/**
 * Created by tuktuk on 1/9/2018.
 */
export function NullAction () {
  this.undo = this.redo = function () {

  }
}

export function AddNodeCommand (row) {

  if(!row)return;
  let parentId = row.item.schema.id
  let grid = row.grid
  let id = grid.getId()
  let name = 'item' + id
  let data = {type: 'string', id: id, name: name}

  function execute () {

    grid.addSchemaObject(parentId, data)
    grid.save()
    row.grid.raiseEvent('modelItemAdded', {child: data, parent: grid.getItem(parentId).schema, name: name})
  }

  execute()
  this.undo = function () {
    grid.removeSchemaObject(parentId, name)
    grid.save()
    row.grid.raiseEvent('modelItemRemoved', data.id)
  }
  this.redo = function () {
    execute()

  }

}

export function AddRefNodeCommand (row, refId, refName) {

  if(!row || !refId)return;
  let parentId = row.item.schema.id
  let grid = row.grid
  let id = grid.getId()
  let schema = grid.getDefinition(refId)
  //console.log(JSON.stringify(schema.rules))
  let name = (refName || 'item') + id
  let data = {$ref: refId, id: id, refName: refName, name: name}

  //console.log("cmd"+refName)
  function execute () {

    //console.log("add rules ref for.." + name+","+data.refName);

    grid.addSchemaObject(parentId, data)
    grid.save()

    row.grid.raiseEvent('modelItemAdded', {child: data, parent: row.item.schema, name: name})
  }

  execute()
  this.undo = function () {
    grid.removeSchemaObject(parentId, name)
    grid.save()

    row.grid.raiseEvent('modelItemRemoved', data.id)
  }
  this.redo = function () {
    execute()

  }
}

export function AddSiblingNodeCommand (row) {

  if(!row)return;
  let parentId = row.item.parentId
  let grid = row.grid
  let id = grid.getId()
  let name = 'item' + id
  let data = {type: 'string', id: id, name: name}

  function execute () {

    grid.addSchemaObject(parentId, data)
    row.grid.raiseEvent('modelItemAdded', {child: data, parent: row.item.schema, name: name})
  }

  execute()
  this.undo = function () {
    grid.removeSchemaObject(parentId, name)
    row.grid.raiseEvent('modelItemRemoved', data.id)
  }
  this.redo = function () {
    execute()

  }
}

export function DeleteNodeCommand (row) {

  if(!row)return;
  let grid = row.grid
  let item = row.item
  let name = item.name
  let dataCopy = JSON.parse(JSON.stringify(item.schema))//angular.copy(item.data);
  let parentId = row.item.parentId
  let id = row.item.schema.id

  function execute () {

    grid.removeSchemaObject(parentId, name)
    grid.save()

    row.grid.raiseEvent('modelItemRemoved', dataCopy.id)
  }

  execute()
  this.undo = function () {
    grid.addSchemaObject(parentId, name, dataCopy)
    grid.save()

    row.grid.raiseEvent('modelItemAdded', {child: dataCopy, parent: grid.getItem(parentId).schema, name: name})
  }
  this.redo = function () {
    execute()

  }
}

export function MoveNodeCommand (grid, id, targetId) {

  let item = grid.getItem(id)
  let target = grid.getItem(targetId)
  let parent = grid.getItem(item.parentId)
  let targetParent = grid.getItem(target.parentId)

  if(!item || !parent || !target || !targetParent) return
  let index = parent.children.indexOf(item)
  let targetIndex= targetParent.children.indexOf(target)

  let parentId = item.parentId
  let name = item.name
  let data = item.schema
  //id = data.id

  function execute () {

    grid.removeSchemaObject(parentId, name, true)
    grid.addSchemaObject(targetId, name, data, true, targetIndex)
    grid.save()

    grid.rebuildList()
    //grid.repaint();

    grid.raiseEvent('modelItemMoved', {
      child: item.schema,
      parent: grid.getItem(parentId).schema,
      newParent: grid.getItem(targetId).schema
    })

  }

  execute()
  this.undo = function () {
    grid.removeSchemaObject(targetId, name, true)
    grid.addSchemaObject(parentId, name, data, true)
    grid.save()

    grid.rebuildList()
    //grid.repaint();
    grid.raiseEvent('modelItemMoved', {
      child: item.schema,
      parent: grid.getItem(targetId).schema,
      newParent: grid.getItem(parentId).schema
    })

  }
  this.redo = function () {
    execute()

  }
}

export function FieldChangedAction (row, cb, newValue, oldValue) {
  let item = row.item
  let grid = row.grid

  //console.log(newValue+","+oldValue);
  function execute () {

    cb(newValue)
    grid.save()

    grid.raiseEvent('modelItemUpdated', {schema: item.schema, parentId: item.parentId})

  }

  execute()
  this.undo = function () {
    cb(oldValue)
    grid.save()

    grid.raiseEvent('modelItemUpdated', {schema: item.schema, parentId: parentId})
  }
  this.redo = function () {
    execute()
  }
}

export function TypeChangedAction (row, newValue, oldValue) {
  //console.log("Type Changed Action");
  let item = row.item
  let grid = row.grid
  let id = item.schema.id
  let parentId = item.parentId

  let data = JSON.parse(JSON.stringify(item.schema))//angular.copy(item.data);
  data.type = oldValue

  function execute () {
    //data.type=newValue;
    //grid.setData(id,data);
    row.changeType(newValue, oldValue)
    grid.save()

    grid.raiseEvent('modelTypeChanged', {schema: item.schema, parentId: parentId})
  }

  execute()
  this.undo = function () {
    grid.setData(id, data)
    grid.save()

    grid.raiseEvent('modelTypeChanged', {schema: item.schema, parentId: parentId})
  }
  this.redo = function () {
    execute()
  }
}

export function NameChangedAction (row, newValue, oldValue) {
  function execute () {
    row.nameChanged(newValue, oldValue)
    row.grid.save()

    row.grid.raiseEvent('modelNameChanged', {schema: row.item.schema, parentId: row.item.parentId, name: newValue})
  }

  execute()
  this.undo = function () {
    row.nameChanged(oldValue, newValue)
    row.grid.save()

    row.grid.raiseEvent('modelNameChanged', {schema: row.item.schema, parentId: row.item.parentId, name: oldValue})
  }
  this.redo = function () {
    execute()

  }
}


