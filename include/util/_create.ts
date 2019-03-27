function _create(Class, signature, $info, ...params) {
    let obj
    if(!$info) $info = {}
    if(!$info.Self) $info.Self = Class
    $info.$setThis = $val => obj = $val
    params.unshift($info)
    if(Class.$mixin) {
        if(!Class.prototype[signature]) throw "unsupported signature " + signature + " for " + Class.name
        obj = Class.prototype[signature].apply(new Class(), params)
        if(obj == null) throw "unsupported signature or null argument passed " + signature + " for " + Class.name
        obj['$info' + Class.$infoAddress] = $info
        if(obj.init$vars) obj.init$vars()
    }
    else {
        obj = new Class()
        obj['$info' + Class.$infoAddress] = $info
        if(obj.init$vars) obj.init$vars()
        if(!obj[signature]) throw "unsupported signature " + signature + " for " + Class.name
        obj[signature].apply(obj, params)
    }
    obj.$initialized = true
    //WRAP_OPTIONALS
    //if(obj.$failed) return Optional.none
    //if(Class[signature + '$failable']) obj = _injectIntoOptional(obj)
    //!WRAP_OPTIONALS
    if(obj.$failed) return null
    if(Class[signature + '$failable']) obj = obj
    return obj
}