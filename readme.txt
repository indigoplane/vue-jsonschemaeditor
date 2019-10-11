

JSON schema editor
input: a form definition object containing JSON schema (https://json-schema.org/) 

On load, the json schema is transformed to a list of rows which is displayed in a table, in a spreadsheet type format. 
Each cell / attribute is enabled or disabled depending on whether it is a valid attribute for the schema type represented by that row. For example, for a string, min and max are not valid attributes,but minLength and maxLength are.

The main file for this component is JsonSchemaEditor.vue

./sampledata has the code for generating sample JSON data given a JSON schema. 

Notes & todos : 

1.It has some external dependencies like $dataservice, artifactType object (which is the form definition)
For using as an independent component, these need to be factored out

2.Since the schema can have reference to external definitions, need to put in validations for reference type which check for existence of the reference type, circular dependencies.
These checks exist in the original angularjs(1.6) project, and have not been ported yet.

