<template>
  <v-menu v-model="show"
    :position-x="x"
    :position-y="y"
    absolute
    offset-y >

    <v-list>
      <v-list-tile
        v-for="(item, index) in items"
        :key="index"
        @click="select(item)"
      >
        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>

</template>

<script>

  export default {

    name: 'IMenu',
    data(){
      return{
        x:0,
        y:0,
        context:null,
        show:false
      }
    },
    props: {
      items: {
        type:Array,
        required:true
      }

    },
    methods:{
      open:function(position,context){
        this.x = position.x
        this.y = position.y
        this.context=context
        this.show = true

      },
      select:function(item){
        this.show=false
        if(item.cb)
        item.cb(this.context)

      }
    }
  }

</script>

<style scoped>

</style>
