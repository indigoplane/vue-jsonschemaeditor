<template>
  <div  v-bind:style='cssStyle'>
    <v-layout row ><v-icon v-on:click="row.toggle">{{getStateIcon()}}</v-icon>
    <div @contextmenu.prevent="onContextMenu"><slot></slot></div>
    </v-layout>
  </div>
</template>

<script>
  import {jseDragHandler,jseDropHandler,jseRefDropHandler,jseRefTypeHandler,jseDropTarget} from './dndhandlers'
  import draggable from '@/shared/dragndrop/draggable'
  import droptarget from '@/shared/dragndrop/droptarget'
  export default {
    name: 'jseTreeNode',
    inject:['grid','row'],
    data(){
      return {
        message:'from first column'
      }
    },
    computed:{
      cssStyle:function(){
        return{
          'padding-left':this.row.item.level*40+'px'
        }
      },
      dataType:function(){
        return this.row.item.dataType
      }
    },
    created:function(){
      //console.log("created first col")

    },
    methods:{
      toggle:function(){
        this.row.toggle()
      },
      getStateIcon: function () {
        if (this.row.hasChildren) {
         if (this.row.item.expanded) {
            return 'mdi-minus-box-outline'
          } else {
            return 'mdi-plus-box-outline'
          }
        } else {
          return ''
        }
      },
      onContextMenu(e){
        //console.log("show imenu")
        e.preventDefault()
        this.grid.showContextMenu({event:e,context:this.row})
      }
    },
    directives:{
      jseDragHandler,
      jseDropHandler,
      jseRefDropHandler,
      jseRefTypeHandler,
    draggable,
    droptarget
    }
  }
</script>

<style scoped>

</style>
