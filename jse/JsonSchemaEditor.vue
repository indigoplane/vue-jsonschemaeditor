/*
JSON schema editor
input/output : JSON schema (https://json-schema.org/)
json schema is transformed displayed as a table. Each row is valid if it is one of the predefined schema types,
OR is a reference to an existing type in the system.
Attributes (cells) for a row in the table are disabled /enabled depending on the schema type of the
schema attribute displayed by the row
*/

<template>
  <div class="jseditor">
    <div class="content" flex style="margin:10px 30px 0 0">
      <v-text-field label="Artifact Type Label" v-model="artifactTypeLabel"></v-text-field>
      <v-text-field label="Artifact Type Model Name" v-model="artifactTypeName" required></v-text-field>
      <v-text-field label="Artifact Type Version" v-model="artifactTypeVersion">
      </v-text-field>
    </div>
    <table>
      <tr>
        <th v-resizable>Name</th>
        <th v-resizable>Type</th>
        <th v-resizable>Required</th>
        <th v-resizable>Min</th>
        <th v-resizable>Max</th>
        <th v-resizable>MinLength</th>
        <th v-resizable>MaxLength</th>
        <th v-resizable>Pattern</th>
        <th v-resizable>Min Items</th>
        <th v-resizable>Max Items</th>
      </tr>
      <jse-row v-for="(item,index) in itemList" v-bind:key="item.schema.id"
               :item="item"
               v-slot="{context : row}"
               v-show="item.visible"
               v-on:mouseover="highlightPath" :is-root="index===0"
      >
         <jse-cell cell-type="name"  first="true" class="first-column"
                   v-draggable
                   v-droptarget
                   v-jse-drag-handler
                   v-jse-drop-handler
                   v-jse-ref-drop-handler>

           <jse-tree-node >
              <input v-model="row.name" required >
           </jse-tree-node>

        </jse-cell>
        <jse-cell cell-type="type" v-droptarget v-jse-ref-type-handler="" >
         <v-combobox flex required
                           v-model='row.type'
                            :items='row.getTypes()'
                          auto-select-first
                          dense single-line
              >

           </v-combobox>
        </jse-cell>
        <jse-cell cell-type="required" >
          <v-checkbox v-model="row.required"></v-checkbox>

        </jse-cell>
        <jse-cell  cell-type="min" v-slot="{context: cell}" :class="{cellerror:+item.schema.min>+item.schema.max}">
          <input  :value="item.schema.min" @input="cell.changed($event.target.value)"
                  type="number" :min="0" :max="item.schema.max" >
        </jse-cell>
        <jse-cell  cell-type="max" v-slot="{context: cell}" :class="{cellerror:+item.schema.min>+item.schema.max}">
          <input :value="item.schema.max" @input="cell.changed($event.target.value)"
                 type="number" :min="item.schema.min"  >
        </jse-cell>
        <jse-cell  cell-type="minLength" v-slot="{context: cell}" :class="{cellerror:+item.schema.minLength>+item.schema.maxLength}">
          <input :value="item.schema.minLength" @input="cell.changed($event.target.value)" type="number" :min="0" :max="item.schema.maxLength">
        </jse-cell>
        <jse-cell  cell-type="maxLength" v-slot="{context:cell}"  :class="{cellerror:+item.schema.minLength>+item.schema.maxLength}" >
          <input :value="item.schema.maxLength" @input="cell.changed($event.target.value)" type="number" :min="item.schema.minLength">

        </jse-cell>
        <jse-cell  cell-type="pattern" v-slot="{context:cell}">
          <input :value="item.schema.pattern" @input="cell.changed($event.target.value)">
        </jse-cell>
        <jse-cell cell-type="minItems" v-slot="{context:cell}"  :class="{cellerror:+item.schema.minItems>+item.schema.maxItems}">
          <input :value="item.schema.minItems" @input="cell.changed($event.target.value)" type="number" :min="0" :max="item.schema.maxItems">

        </jse-cell>
        <jse-cell  cell-type="maxItems" v-slot="{context:cell}"  :class="{cellerror:+item.schema.minItems>+item.schema.maxItems}">
          <input :value="item.schema.maxItems" @input="cell.changed($event.target.value)" type="number" :min="item.schema.minItems">

        </jse-cell>
      </jse-row>
    </table>
    <i-menu ref="menu" :items="menuItems">

    </i-menu>
  </div>
</template>

<script src="./jse.js">

</script>

<style lang="scss">
  @import "./jse.scss";
  .jseditor > table{
    .v-input__slot {
      &:before {
        display: none;
      }

      &:after {
        display: none;
      }

      input {
        padding: 0;
      }
    }
    td>input{
      width:100%;
      outline:none;
    }
    .cellerror{
      //  color:red;
      background-color:rgba(255,0,0,0.3)
    }
  }
</style>
