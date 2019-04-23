function _create(Class, signature, ...params) {
    if(params[params.length - 1]) params[params.length - 1].$setThis = $val => obj = $val
    let obj
    if(Class.$mixin) {
        if(!Class.prototype[signature]) throw "unsupported signature " + signature + " for " + Class.name
        obj = Class.prototype[signature].apply(new Class(), params)
        if(obj == null) throw "unsupported signature or null argument passed " + signature + " for " + Class.name
        obj.$info = params[params.length - 1]
        if(obj.init$vars) obj.init$vars()
    }
    else {
        obj = new Class()
        obj.$info = params[params.length - 1]
        if(obj.init$vars) obj.init$vars()
        if(!obj[signature]) throw "unsupported signature " + signature + " for " + Class.name
        obj[signature].apply(obj, params)
    }
    obj.$initialized = true
    if(obj.$failed) return Optional.none
    if(Class[signature + '$failable']) obj = _injectIntoOptional(obj)
    return obj
}