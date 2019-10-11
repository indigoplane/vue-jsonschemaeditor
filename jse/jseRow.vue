<template>
  <tr v-bind:class="{root:isRoot,highlight:highlight,readonly:item.readonly}" style="position:relative">
    <slot v-bind:context="thisContext"></slot>
  </tr>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import * as commands from './cmds'

  let visitor = (function () {
    function visit (item, fn, data) {
      let result = fn.call(self, item, data)
      if (result) {
        visitChildren(item, fn, data)
      }
      return result
    }

    function visitChildren (item, fn, data) {
      item && item.children && item.children.forEach(function (child) {
        visit(child, fn, data)
      })

    }

    return {
      visit: visit,
      visitChildren: visitChildren
    }
  })()
  export default {
    name: 'jseRow',
    props: {
      item: Object,
      isRoot: Boolean
    },
    data () {
      return {
        highlight: false,
        search: '',
        dataTypes: []
      }

    },
    provide: function () {
      return {
        row: this
      }
    },
    inject: ['grid'],
    created: function () {
      this.moduleName = this.grid.getModuleName()
      this.$store.dispatch(this.moduleName + '/addRow', this)
      this.cells = []

    },
    computed: {
      required: {
        set (bRequired) {
          this.grid.record(new commands.FieldChangedAction(this, this.requiredChanged, bRequired, !bRequired))

        },
        get () {
          let parent = this.getParent()
          if (parent && parent.schema.type == 'object') {
            if (!parent.schema.required) return false
            return parent.schema.required.indexOf(this.item.name) >= 0
          }
          return false
        }
      },

      name: {
        get: function () {
          return this.item.name
        },
        set: function (val) {
          this.grid.record(new commands.NameChangedAction(this, val, this.item.name))
          this.$set(this.item, 'name', val)

        }
      },
      type: {
        get: function () {
          return this.$dataService.getNamePathFromId(this.item.dataType)
        },
        set: function (val) {
          let typeVal = this.$dataService.getIdFromNamePath(val)
          this.typeChanged(typeVal)
        }
      },
      hasChildren: function () {
        return this.item.children && this.item.children.length > 0
      },
      thisContext: function () {
        return this
      }
    },
    methods: {
      toggle: function () {
        let item = this.item
        item.expanded = !item.expanded
        visitor.visitChildren(item,
          function (item, flag) {
            item.visible = flag
            return item.expanded
          }, item.expanded)
      },
      getParent: function () {
        return this.$dataService.getArtifactType(this.item.parentId)
      },
      getTypes: function () {
        let query = this.search
        //console.log('get types')
        let parentType = this.$store.getters[this.moduleName + '/dataType'](this.item.parentId)
        let types = []
        if (parentType == 'array') {
          types = ['string', 'number', 'boolean', 'array', 'object']
        } else {
          types = ['string', 'number', 'boolean', 'array']
        }
        let results = this.$store.getters['artifactTypes/searchTypes'](this.$dataService,
          this.search, types, this.grid.artifactType.schema.id)

        return results

      },
      typeChanged: function (newType) {

        if (newType == null) return
        let oldType = this.item.schema.type || this.item.schema.$ref
        this.grid.record(new commands.TypeChangedAction(this, newType, oldType))
      },
      requiredChanged: function (bRequired) {
        let item = this.item
        let parent = this.getParent(item)
        if (parent && parent.schema.type == 'object') {
          if (bRequired) {
            if (!parent.schema.required) parent.schema.required = []
            if (parent.schema.required.indexOf(item.name) < 0) {
              parent.schema.required.push(item.name)
            }
          } else if (!bRequired && parent.schema.required) {
            let index = parent.schema.required.indexOf(item.name)
            if (index >= 0) {
              parent.schema.required.splice(index, 1)
            }
          }
        }
      },
      registerCell: function (cell) {
        this.cells.push(cell)
      },
      highlightPath: function () {
        let path = this.path = {}
        let item = this.item
        let flag = true
        while (flag) {
          path[item.schema.id] = 1
          let row = this.grid.getRow(item.parentId)
          flag = (row == null)
          item = row.item
        }
        this.grid.highlightPath(path)

      },
      changeType: function (newType, oldType) {
        if (newType == null) return
        oldType = this.item.schema.type || this.item.schema.$ref
        if (oldType == newType) return

        let fromSimple = ['string', 'number', 'boolean'].indexOf(oldType) >= 0
        let toSimple = ['string', 'number', 'boolean'].indexOf(newType) >= 0

        if (!fromSimple) {
          if (oldType == 'object') {
            delete this.item.schema.properties
          } else if (oldType == 'array') {
            if(this.item.schema.items)
            this.grid.deleteItem(this.grid.getRow(this.item.schema.items.id))
          } else if (this.item.schema.$ref) {
            delete this.item.schema.$ref
          }

        }
        if (!toSimple) {
          if (newType == 'array') {
            this.item.schema.type = newType
            let self = this
            //this.$nextTick(function () {
              self.grid.addChildItem(self)
            //}, 0)
          } else if (newType == 'object') {
            this.item.schema.type = newType
            this.item.schema.properties = {}
          } else {//$ref
            this.item.schema.$ref = newType
            delete this.item.schema.type

          }
        } else {//toSimple
          this.item.schema.type = newType

        }

        //for (let i = 0; i < this.cells.length; i++) {
        //  this.cells[i].checkIfValid();
        //}
        this.grid.rebuildList()
      },
      hasAttribute: function (attr) {
        switch (this.item.schema.type) {
          case 'string':
            return ['type', 'name', 'required', 'minLength', 'maxLength', 'pattern'].indexOf(attr) >= 0
          case 'number':
            return ['type', 'name', 'required', 'min', 'max'].indexOf(attr) >= 0
          case 'array':
            return ['type', 'name', 'required', 'minItems', 'maxItems'].indexOf(attr) >= 0
          default:
            return ['type', 'name', 'required'].indexOf(attr) >= 0

        }
        return false
      },
      nameChanged: function (name, oldName) {
        console.log('name changed')
        let item = this.item
        let parent = this.grid.getRow(item.parentId)
        if (parent) {
          let parentSchema = parent.item.schema
          if (parentSchema.type == 'object') {
            if (!parentSchema.properties) {
              this.$set(parentSchema.properties, {})
            }
            this.$set(parentSchema.properties, name, item.schema)
            this.$delete(parentSchema.properties, oldName)
            if (parent.item.schema.required) {
              let index = parent.item.schema.required.indexOf(oldName)
              if (index >= 0) {
                parent.item.schema.required.splice(index, 1)
                parent.item.schema.required.push(name)
              }
            }

          } else if (parentSchema.type == 'array') {
          }
        }
        item.schema.name = name
        //self.raiseEvent('nameChanged',item);
      }

    },
    directives: {}
  }
</script>

<style scoped>

</style>
