function _preserveGenerics(obj, obj2) {
    obj['$info' + obj.constructor.$infoAddress] = obj2['$info' + obj2.constructor.$infoAddress]
    return obj
}
function _preserveInfo(obj, obj2, $info) {
    obj['$info' + obj.constructor.$infoAddress] = {...obj2['$info' + obj2.constructor.$infoAddress], $info}
    return obj
}