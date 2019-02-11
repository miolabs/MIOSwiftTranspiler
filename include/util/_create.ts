function _create(Class, signature, $info, ...params) {
    params.unshift($info)
    let obj
    if(Class.$mixin) {
        if(!Class.prototype[signature]) throw "unsupported signature " + signature + " for " + Class
        obj = Class.prototype[signature].apply(null, params)
        if(obj == null) throw "unsupported signature " + signature + " for " + Class
        obj['$info' + Class.$infoAddress] = $info
    }
    else {
        obj = new Class()
        obj['$info' + Class.$infoAddress] = $info
        obj[signature].apply(obj, params)
    }
    if(obj.$failed) return null
    obj.$initialized = true
    return obj
}