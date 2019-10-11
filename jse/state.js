export default {
  namespaced:true,
  state: {
    rowStateMap:{}
  },
  getters:{
    rowState:function(state){
      return function(id){
        return state.rowStateMap[id]
      }

    },
    rows:function(state){
      return Object.values(state.rowStateMap)
    } ,
    dataType:function(state){
      return function(id){
        if(id) {
          let row = state.rowStateMap[id]
          if (row) return row.item.dataType
        }
        return null
      }

    }

  },
  mutations: {
    addRow(state, row) {
      state.rowStateMap[row.item.schema.id] = row
    }

  },
  actions:{
    addRow(state,row){
      state.commit('addRow',row)
    }
  }
};
