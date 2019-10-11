<template>
  <td v-bind:class="{'invalid-attribute':!validAttribute}" style="min-width: 80px;position:relative">
    <slot v-bind:context="thisContext"></slot>
  </td>
</template>

<script>
  import * as commands from './cmds'

  export default {
    name: 'jseCell',
    props: {
      cellType: String
     },
    inject: ['row'],
    data(){
      return{
        error:false
      }
    },
    computed: {
      validAttribute: function () {
        return this.checkIfValid()
      },
      thisContext: function () {
        return this
      }
    },
    methods: {

      checkIfValid: function () {
        let valid = false
        if (this.cellType == 'required') {
          let parent = this.row.grid.getRow(this.row.item.parentId)
          valid = parent && parent.item.schema.type == 'object'
        } else {
          valid = this.row.hasAttribute(this.cellType)
        }
        return valid
      },
      changed: function (newValue) {
        let action = null
        let self = this
        this.row.grid.record(new commands.FieldChangedAction(self.row,
          function (val) {
              self.row.item.schema[self.cellType] = val
          },
          newValue, self.oldVal))
        this.oldVal = newValue

      }

    }
  }
</script>

<style scoped>

</style>
