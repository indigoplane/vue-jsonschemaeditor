/**
 * Created by tuktuk on 1/30/2018.
 */
import SchemaIteratorFactory from '@/formBuilder/builder/schemaIterator'

let generator = function(dataService){
    let fns={};
    function toNumber(a, fallback){
      if(a === a+0) return a
      let number = parseInt(a)
      if(isNaN(number)) return fallback
      return number

    }
    function random(min,max){
      return  min+Math.floor(Math.random()*(max-min))
    }
    function putData(key,val,data){
        if(Array.isArray(data))data.push(val);
        else data[key]=val;
        return val;
    }
    fns['number']=function(schema, key, data){
        let min = toNumber(schema.min, 2)
        let max = toNumber(schema.max, min+3)
        min = Math.min(min,max)
        let val = random(min, max)
        return putData(key,val,data);

    };
    fns['string']=function(schema,key,data){
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let length = random(schema.minLength ?schema.minLength :2 ,schema.maxLength?schema.maxLength :10 );
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return putData(key,text,data);


    };
    fns['array']=function(schema,key,data){
        let listData = putData(key,[],data);

        return listData;
    }
    fns['object']=function(schema,key,data){

        let objectData = putData(key,{},data);
        return objectData;
    }
    fns['$ref']=function(schema,key,data){

        let refData = dataService.getArtifactType(schema.$ref);
        if(!refData) return "Could not find definition for "+schema.$ref;
        data = putData(key,{},data);

        let SchemaIterator = SchemaIteratorFactory(generateData,{'array':dataGenArrayIterator})
        SchemaIterator(refData.schema,data);
        return data;
    }

    function generateData(key,schema,data){
        let fn;
        if(!schema)return;
        if(schema.$ref)fn=fns['$ref'];
        else fn=fns[schema.type ];
        return (fn?fn.call(null,schema,key, data):{});


    }
    function dataGenArrayIterator(iterate){
        return function(schema,data){
            if(!schema.items) return;

            let min = toNumber(schema.minItems, 1);
            let max = toNumber(schema.maxItems, min+3);
            min = Math.min(min,max)

            let length = random(min,max);
            for(let i=0; i < length; i++){
                iterate('item', schema.items, data);
            }

        }
    }


    let data={};
    return {
        generate:function(schema){
            let SchemaIterator = SchemaIteratorFactory(generateData,{'array':dataGenArrayIterator})
            data={};
            SchemaIterator(schema,data);
            return data;
        }
    }
}

export default{
  get:function(dataService){
    return generator(dataService)
  }

}
