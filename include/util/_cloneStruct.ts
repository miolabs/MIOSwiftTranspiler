function _cloneStruct(obj) {
    if(!(obj instanceof Object) || !obj.constructor.$struct) return obj
    var cloned = new obj.constructor()
    if(obj.cloneStructFill) {
        cloned.cloneStructFill(null, obj);
    }
    else {
        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) continue
            cloned[prop] = _cloneStruct(obj[prop])
        }
    }
    return cloned
}