let droptargetFn = function () {
  function factoryFn(){
    let handlers=[]
    function registerHandler(handler, check) {
      handlers.push({handler: handler, check: check})
    }
    function handle(dataTransfer) {
      handlers.forEach(function (obj) {
        obj.handler(dataTransfer)
      })

    }
    function checkFn (e) {
      e.stopPropagation()

      for (let i = 0; i < handlers.length; i++) {
        if (!handlers[i].check || (handlers[i].check && handlers[i].check(e))) {
          e.preventDefault()
          return
        }
      }
    }
    function dropFn(e) {
      e.preventDefault()
      e.stopPropagation()
      let dataTransfer = e.dataTransfer || e.originalEvent.dataTransfer
      if (!dataTransfer) return
      handle(dataTransfer)
    }
    return{
      registerHandler:registerHandler,
      handle:handle,
      checkFn:checkFn,
      dropFn:dropFn
    }

  }
  function bind (el, binding, vnode) {
    el.droptargetObj = factoryFn()
    el.addEventListener('dragover', el.droptargetObj.checkFn)
    el.addEventListener('dragenter', el.droptargetObj.checkFn)
    el.addEventListener('drop', el.droptargetObj.dropFn)
  }

  function unbind (el, binding, vnode) {
    if(el && el.droptargetObj) {
      //console.log("unbind droptarget")
      el.removeEventListener('dragover', el.droptargetObj.checkFn)
      el.removeEventListener('dragenter', el.droptargetObj.checkFn)
      el.removeEventListener('drop', el.droptargetObj.dropFn)
    }
  }

  return {
    priority: 1002,
    bind: bind,
    unbind: unbind
  }
}
export default droptargetFn()
