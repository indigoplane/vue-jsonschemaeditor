/**
 * Created by tuktuk on 2/11/2018.
 */

// SchemaIteratorFactory
export default function(callback, ifns, m) {
  let method = m;
  if(!method) method="pre";
  function objectIterator(iterate) {
    return function (schema, data) {
      let keys = Object.keys(schema.properties)
      keys.forEach(function (key) {
        let childSchema = schema.properties[key]
          iterate(key, childSchema, data);
      })
    }

  }
  function arrayIterator(iterate) {
    return function (schema, data) {
      if(schema.items)
        iterate('item', schema.items, data);

    }
  }
  function SchemaIterator(schema, data) {


    (function processChildren(schema) {
      let itemType = schema.$ref ? '$ref' : schema.type;
      let fn = fns[itemType];
      if (fn) fn(schema, data);
    })(schema);

  }

  function iterate(key, schema, data) {
    let data2;
    if(method=="pre")
      data2 = callback(key, schema, data);
    SchemaIterator(schema, data2)
    if(method=="post")
      data2 = callback(key, schema, data);


  }

  let fns = {};

  fns['object'] = (ifns && ifns['object'] ? ifns['object'] : objectIterator)(iterate);
  fns['array'] = (ifns && ifns['array'] ? ifns['array'] : arrayIterator)(iterate);
  fns['$ref'] = (ifns && ifns['$ref'] ? ifns['$ref'](iterate) : null);


  return SchemaIterator;
}
