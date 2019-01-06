var _ = {
    size: function(obj) { return Object.keys(obj).length },
    cloneStruct: function(obj) {
        if(!(obj instanceof Object) || !obj.$struct) return obj
        var cloned = new obj.constructor()
        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) continue
            cloned[prop] = _.clone(obj[prop])
        }
        return cloned
    },
    failableInit: function(obj) { return obj.$failed ? null : obj }
};
