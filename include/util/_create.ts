function _create(Class, signature, $info, ...params) {
    params.unshift($info)
    let obj
    if(Class.$mixin) {
        obj = Class.prototype[signature].apply(null, params)
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