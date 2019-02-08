//{Self:SNA2, T: {Self:SNA1, T: String}}
function _clarifyGenerics(Class) {
    if(!Class.Self) return Class
    let result = Class.Self
    for(let genericKey in Class) {
        if(genericKey === 'Self') continue
        let genericType = _clarifyGenerics(Class[genericKey])
        for(let key in result) {
            if(!(result[key] instanceof Object) || result[key].$genericType !== genericKey) continue
            let resultType = genericType
            if(result[key].$subchain) {
                let subchain = result[key].$subchain.split('.')
                for(let elem of subchain) {
                    resultType = resultType[elem]
                }
            }
            result = {...result, [key]: resultType}
        }
    }
    return result
}