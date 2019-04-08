function _cloneStruct(obj) {
    if(!(obj instanceof Object) || obj instanceof String || obj instanceof Number || obj instanceof Bool || !obj.constructor.$struct) return obj
    var cloned = new obj.constructor()
    if(obj.cloneStructFill) {
        cloned.cloneStructFill(obj, {});
    }
    else {
        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) continue
            cloned[prop] = _cloneStruct(obj[prop])
        }
    }
    return cloned
}