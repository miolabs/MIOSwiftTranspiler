function _create(Class, signature, ...params) {
    if(Class.$mixin) return Class.prototype[signature].apply(null, params)
    let obj = new Class()
    obj[signature].apply(obj, params)
    if(obj.$failed) return null
    obj.$initialized = true
    return obj
}