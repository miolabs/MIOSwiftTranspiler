var _ = {
    size: function(obj) { return Object.keys(obj).length },
    cloneStruct: function(obj) {
        if(!(obj instanceof Object) || !obj.$struct) return obj
        var cloned = new obj.constructor()
        if(obj instanceof Map) {
            obj.forEach((val, prop) => cloned.set(prop, _.cloneStruct(val)))
        }
        else {
            for(var prop in obj) {
                if(!obj.hasOwnProperty(prop)) continue
                cloned[prop] = _.cloneStruct(obj[prop])
            }
        }
        return cloned
    },
    failableInit: function(obj) { return obj.$failed ? null : obj },
    nilCoalescing: function(a, b) { return a != null ? a : b },
    optionalTry: function(expr) { try { return expr() } catch(e) { return null } }
};
