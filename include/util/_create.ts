function _create(Class, signature, $info, ...params) {
    params.unshift($info)
    let obj
    if(Class.$mixin) {
        if(!Class.prototype[signature]) throw "unsupported signature " + signature + " for " + Class.name
        obj = Class.prototype[signature].apply(null, params)
        if(obj == null) throw "unsupported signature or null argument passed " + signature + " for " + Class.name
        obj['$info' + Class.$infoAddress] = $info
        if(obj.init$vars) obj.init$vars()
    }
    else {
        obj = new Class()
        obj['$info' + Class.$infoAddress] = $info
        if(obj.init$vars) obj.init$vars()
        obj[signature].apply(obj, params)
    }
    if(obj.$failed) return null
    obj.$initialized = true
    return obj
}