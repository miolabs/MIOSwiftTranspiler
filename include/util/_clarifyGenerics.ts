//{Self:SNA2, T: {Self:SNA1, T: String}}
function _clarifyGenerics(Class) {
    if(!Class.Self) return Class
    let result = Class.Self
    for(let genericKey in Class) {
        if(genericKey === 'Self') continue
        //let genericType = _clarifyGenerics(Class[genericKey])
        let genericType = Class[genericKey]
        for(let key in result) {
            let prop = Object.getOwnPropertyDescriptor(result, key)
            prop = (prop || {}).value
            if(!(prop instanceof Object) || prop.$genericType !== genericKey) continue
            let resultType = genericType
            if(prop.$subchain) {
                let subchain = prop.$subchain.split('.')
                for(let elem of subchain) {
                    resultType = resultType[elem]
                }
            }
            result = {...result, [key]: resultType}
        }
    }
    result = {...result, Self: result}
    return result
}