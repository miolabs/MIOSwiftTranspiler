function _create(Class, signature, $info, ...params) {
    params.unshift($info)
    let obj
    if(Class.$mixin) {
        if(!Class.prototype[signature]) throw "unsupported signature " + signature + " for " + Class
        obj = Class.prototype[signature].apply(null, params)
        if(!obj) throw "unsupported signature " + signature + " for " + Class
    }
    else {
        obj = new Class()
        obj[signature].apply(obj, params)
    }
    if(obj.$failed) return null
    obj.$initialized = true
    obj['$info' + Class.$infoAddress] = $info
    return obj
}