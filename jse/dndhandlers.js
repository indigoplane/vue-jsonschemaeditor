import * as commands from './cmds'

let jseDragHandler = {
  bind: function (el, binding, vnode) {
    let cell = vnode.componentInstance
    let row = cell.row
    if (el.draggableObj && el.draggableObj.registerHandler) {
      el.draggableObj.registerHandler(function (dataTransfer) {
        dataTransfer.effectAllowed = 'move'
        let id = row.item.schema.id
        let parentId = row.item.parentId
        dataTransfer.setData('jse-dnd-id', id)
        dataTransfer.setData('jse-dnd-parentId', parentId)

      })
    }
  }
}
let jseDropHandler = {
  bind: function (el, binding, vnode) {
    let cell = vnode.componentInstance
    let row = cell.row
    let grid = row.grid
    if ( el.droptargetObj && el.droptargetObj.registerHandler) {
      el.droptargetObj.registerHandler(function (dataTransfer) {
        let id = dataTransfer.getData('jse-dnd-id')
        let parentId = dataTransfer.getData('jse-dnd-parentId')
        if (!id || !parentId) return false
        let targetId = row.item.schema.id
        //if (parentId == targetId) return
        grid.record( new commands.MoveNodeCommand(grid, id, targetId))
        grid.raiseEvent('itemMoved', item)
        return true
      })
    }

  }
}
let jseRefDropHandler = {
  bind: function (el, binding, vnode) {
    let cell = vnode.componentInstance
    let row = cell.row
    let grid = row.grid
    //let ddh=dd;
    if ((row.item.dataType == 'object') && el.droptargetObj && el.droptargetObj.registerHandler) {
      el.droptargetObj.registerHandler(function (dataTransfer) {
        let id = dataTransfer.getData('jse-ref-id')
        let name = dataTransfer.getData('jse-ref-name')
        if (!id) return false
        grid.addRefNode(row, id, name)
        //if (ctrl.deferOnDrop)ctrl.deferOnDrop.resolve();
        return true
      }, function (e) {
        let id = grid.artifactType.schema.id
        let otherId = null
        if (vnode.context.$root.dnd) otherId = vnode.context.$root.dnd['jse-ref-id']
        if ((id && otherId) && vnode.context.$dataService.isChild(id, otherId)) return false
        return true
      })
    }
  }
}
let jseRefTypeHandler = {
  bind: function (el, binding, vnode) {

    let cell = vnode.componentInstance
    let row = cell.row
    let grid = row.grid

    // let ddh=dd;
    if ((cell.cellType == 'type') && el.droptargetObj && el.droptargetObj.registerHandler) {
      el.droptargetObj.registerHandler(function (dataTransfer) {
        let id = dataTransfer.getData('jse-ref-id')
        let name = dataTransfer.getData('jse-ref-name')
        //console.log("dropped"+name)
        if (!id) return false
        row.item.dataType = id
        row.typeChanged(id)
        return true
      }, function (e) {
        //console.log("check drop type")
        let id = grid.artifactType.schema.id
        let otherId = null
        if (vnode.context.$root.dnd) otherId = vnode.context.$root.dnd['jse-ref-id']
        if (id && otherId && vnode.context.$dataService.isChild(id, otherId)) return false

        return true

      })
    }
  }
}

export {jseDragHandler, jseDropHandler, jseRefDropHandler, jseRefTypeHandler}
