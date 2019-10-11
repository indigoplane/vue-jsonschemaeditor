function draggable () {
  function factoryFn () {
    let handler = null
    function dragHandler(e)
    {
      //console.log("drag handler")
      let dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
      if (this.handler) {
        this.handler(dataTransfer)
      }
      e.stopPropagation()

    }

    function registerHandler (handlerFn) {
      this.handler = handlerFn
    }
    return{
      dragHandler:dragHandler,
      registerHandler:registerHandler
    }
  }

  let dragDirective = {
    priority: 1002,
    bind: function (el, binding, vnode) {
      //console.log("bind draghandler")
      el.setAttribute('draggable', true)
      el.draggableObj = factoryFn()
      el.addEventListener('dragstart', el.draggableObj.dragHandler.bind(el.draggableObj))

    },

    unbind: function (el, binding, vnode) {
      //console.log("unbind draggable")
      if (el && el.draggableObj) {
        el.removeEventListener('dragstart', el.draggableObj.dragHandler.bind(el.draggableObj))
      }
    }
  }
  return dragDirective

}

export default draggable()
