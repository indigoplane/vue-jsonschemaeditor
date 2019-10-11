/**
 * Created by tuktuk on 4/18/2018.
 */
let Actions = function() {
    let undoActions = [];
    let redoActions = [];
    function save(action) {
        if (action) {
            undoActions.push(action);
            redoActions = [];
        }
    }

    function undo() {
        let action = undoActions.pop();
        if (action) {
            action.undo();
            redoActions.push(action);
        }
    }

    function redo() {
        let action = redoActions.pop();
        if (action) {
            action.redo();
            undoActions.push(action);
        }
    }

    return {
        save: save,
        undo: undo,
        redo: redo
    }

}

export default Actions
