function _preserveGenerics(obj, obj2) {
    obj['$info' + obj.constructor.$infoAddress] = obj2['$info' + obj2.constructor.$infoAddress]
}
function _preserveInfo(obj, $info) {
    obj['$info' + obj.constructor.$infoAddress] = $info
}