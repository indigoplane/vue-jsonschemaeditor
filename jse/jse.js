import Actions from '@/shared/commands/actions'
import * as commands from './cmds'
let schemaParser = {

  methods: {
    schemaToList: function (schema,list) {
      let level = 0
      if (!schema || !schema.id) {
        return []
      }
      let parseSchema = (schema, parentItem) => {
        let item = (schema.$ref ? {
          children: [],
          name:'',
          level: 0,
          expanded:true,
          visible:true,
          schema: schema,
          dataType: schema.$ref
        } : {children: [], name:'', level: 0, schema: schema, dataType: schema.type,visible:true,expanded:true})
        //item.row = {message : 'row message'}
        list.push(item)

        if (parentItem) {
          parentItem.children.push(item)
          item.parentId = parentItem.schema.id
          item.level = parentItem.level + 1
          item.readonly = parentItem.isRef || parentItem.readonly
        }
        if (schema.type) {
          if (schema.type == 'object' && schema.properties) {
            if (!parentItem) item.name = '<root>'
            Object.keys(schema.properties).forEach(function (key) {
              let value = schema.properties[key]
              let childItem = parseSchema(value, item)
              childItem.name = key

            })

          } else if (schema.type == 'array' && schema.items) {
            //console.log("schematolist:"+schema.items!=null)
            let listContent = parseSchema(schema.items, item)
            this.$set(listContent,'name','<itemType>')
          }
        } else if (schema.$ref) {
          item.isRef = true

          let refSchema = this.getDefinition(schema.$ref)//definitions[schema.$ref];
          if (!refSchema) {//todo : port the code for displaying error message instead of exceptions...
            throw "refSchema "+schema.$ref+" not found !"
            //item.error = {
            //    type:"Reference component not found",
            //    description:"Component : "+schema.$ref+" not found"
            //}
            //return item
          }
          //throw "jsEditor : " + schema.$ref + " not found !"
          if (refSchema.type == 'object' && refSchema.properties) {
            if (!parentItem) item.name = '<root>';
            Object.keys(refSchema.properties).forEach(function (key) {
              let value = refSchema.properties[key]
              let childItem = parseSchema(value, item)
              childItem.name = key

            })

          } else if (refSchema.type == 'array' && refSchema.items) {
            let listContent = parseSchema(refSchema.items, item)
            this.$set(listContent,'name','<itemType>')

          }

        }
        return item
      }

      parseSchema(schema)
      return list

    }
  }

}
let schema={
  methods:{
    addSchemaObject:function(parentId, schema, bSkipRebuildList,insertIndex) {
      let id = schema.id;
      let name = schema.name;
      let parent = this.$store.getters['jse/rowState'](parentId);
      if (parent.item.schema.type == 'object') {
        if(!parent.item.schema.properties)
          this.$set(parent.item.schema.properties,{});
        this.$set(parent.item.schema.properties,name,schema);
        if (!bSkipRebuildList) this.rebuildList();
      }
      else if (parent.item.schema.type == 'array') {
        parent.item.schema.items = schema;
        if (!bSkipRebuildList) this.rebuildList();
      }

    },
    removeSchemaObject :function(parentId, name, bSkipRebuildList) {
      let parent = this.$store.getters['jse/rowState'](parentId);
      if (parent.item.schema.type == 'object') {
        if (parent.item.schema.properties) {
          delete parent.item.schema.properties[name];
          //console.log("deleted.." + name)
          if (!bSkipRebuildList) this.rebuildList();
        }

      }
      else if (parent.item.schema.type == 'array') {
        if (parent.item.schema.items) {
          delete parent.item.schema.items;
          if (!bSkipRebuildList) this.rebuildList();
        }
      }

    }

  }
}
let history = (function(){
  let commands = Actions()
  return {
    methods: {
      record: function (command) {
        //console.log('record')
        if (command)
          commands.save(command);
      },
      undo: function () {
        //console.log('undo')
        commands.undo();
      },
      redo: function () {
        //console.log('redo')
        commands.redo();
      }

    }
  }
})()

import resizable from './resizable.js'
import jseRow from './jseRow'
import jseTreeNode from './jseTreeNode'
//import {jseRefTypeHandler} from './dndhandlers'
import jseCell from './jseCell'
import IMenu from '@/shared/imenu/IMenu'
import {jseDragHandler,jseDropHandler,jseRefDropHandler,jseRefTypeHandler,jseDropTarget} from './dndhandlers'
import draggable from '@/shared/dragndrop/draggable'
import droptarget from '@/shared/dragndrop/droptarget'
import state from './state'
import id from '@/shared/ids/id'

//let actions = Actions()

export default {
  name: 'JsonSchemaEditor',
  props: {
   artifactType:Object
  },
  mixins: [schemaParser,schema,history,id],
  data () {
    return{
      itemList:[],
      //message:"from jse",
      contextMenu : {
        'root':[{title:"add child",cb:this.addChildItem}],
        'object':[{title:"add child",cb:this.addChildItem}, {title:"add sibling",cb:this.addSiblingItem}, {title:"delete",cb:this.deleteItem}],
        'array':[{title:"delete",cb:this.deleteItem}],
        'default':[{title:"add sibling",cb:this.addSiblingItem}, {title:"delete",cb:this.deleteItem}]
      },
      menuItems:[]

    }
  },
  watch:{
    artifactType:function(){
      this.rebuildList()
    }
  },
  provide:function(){
    return{
      grid : this

    }
  },
  beforeCreate:function(){
  },
  created: function () {
    //console.log('created jse')

    this.moduleName = this.name && this.name.length>0 || 'jse'
    this.$store.registerModule(this.moduleName, state);
    this.rebuildList()

  },
  methods: {
    rebuildList:function(){
      this.itemList.splice(0)
      if(this.artifactType && this.artifactType.schema)
      this.schemaToList(this.artifactType.schema,this.itemList)

    },
    getModuleName:function(){
      return this.moduleName
    },
    getDefinition: function (ref) {
      let typedef =  this.$dataService.getArtifactType(ref)
      return (typedef ? typedef.schema : null)
    },
    getItem:function(id){
      let row = this.getRow(id)
      if(row) return row.item
      return null

    },
    getRow:function(id){
      return this.$store.getters[this.moduleName+'/rowState'](id)
    },
    showContextMenu(args){
      let e = args.event
      let item = args.context.item

      this.menuItems = (item => {

        if (!item.parentId)
          return this.contextMenu['root'];
        if (item.schema.type == 'object')
          return this.contextMenu['object'];
        if (item.schema.type == 'array')
          return this.contextMenu['array'];
        else
          return this.contextMenu['default'];
      })(item)

      this.$refs.menu.open({x:e.x,y:e.y},args.context);

    },
    raiseEvent:function(eventName,data){
      //console.log("dispatch " +eventName)
      let jseEvent = new CustomEvent(eventName, {bubbles:true,detail:data})
      this.$el.dispatchEvent(jseEvent)
    },
    save:function(){
      this.$dataService.save()
      //saveArtifactType(this.artifactType)
    },
    //grid ops
    addChildItem(row){
      this.record(new commands.AddNodeCommand(row))
    },
    addRefNode(row,refId,refName){
      this.record(new commands.AddRefNodeCommand(row, refId, refName))
    },
    addSiblingItem(row){
      this.record(new commands.AddSiblingNodeCommand(row))
    },
    deleteItem(row){
      this.record(new commands.DeleteNodeCommand(row))
    },


    //schema ops

    //tree ops
    removeNode:function(id){

    },

    highlightPath:function(path){
      let rows = this.$state.getters['jse/rows']()
      rows.forEach(function(row){
        if(path[row.item.schema.id]==1 )
          row.highlight = true
        else row.highlight = false
      })
    }

  },
  computed:{
      artifactTypeLabel:{
        get:function(){return this.artifactType && this.artifactType.properties && this.artifactType.properties.label},
        set:function(val){
          this.artifactType.properties.label = val
          //this.$dataService.saveArtifactType(this.artifactType)
          this.save()
        }
      },
      artifactTypeName:{
        get:function(){return this.artifactType && this.artifactType.properties && this.artifactType.properties.name},
        set:function(val){
          this.artifactType.properties.name = val
          //this.$dataService.saveArtifact(this.artifactType)
          this.save()
          }
        },
      artifactTypeVersion:{
        get:function(){return this.artifactType && this.artifactType.properties && this.artifactType.properties.version},
        set:function(val){
          this.artifactType.properties.version = val
          //this.$dataService.saveArtifact(this.artifactType)
          this.save()
        }
      }
  },
  components:{
    jseTreeNode,
    jseRow,
    jseCell,
    IMenu


  },
  directives: {
    resizable,
    jseDragHandler,
    jseDropHandler,
    jseRefDropHandler,
    jseRefTypeHandler,
    draggable,
    droptarget
  }

}


