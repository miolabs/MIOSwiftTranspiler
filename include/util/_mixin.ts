const PROTOCOL_DEFAULT_IMPLEMENTATION_PRIORITY = {
    "ClosedRange.makeIterator": "Collection$implementation",
    "Range.makeIterator": "Collection$implementation"
}
function _mixin(dest, source, shouldOverride) {
    var properties = Object.getOwnPropertyNames(source.prototype)
    for (let name of properties) {
        if (name == 'constructor') continue
        /*
        if(name === '' && dest.prototype.constructor.name === '') {
            console.log(name in dest.prototype, source.prototype.constructor.name)
            console.log(source.prototype[name])
        }
        */
        let proceed = !(name in dest.prototype)
        if(!proceed) {
            let prioritisedClass = PROTOCOL_DEFAULT_IMPLEMENTATION_PRIORITY[dest.prototype.constructor.name + '.' + name]
            if(prioritisedClass) proceed = source.prototype.constructor.name === prioritisedClass
            else proceed = shouldOverride
        }
        if(proceed) {
            Object.defineProperty(
                dest.prototype,
                name,
                Object.getOwnPropertyDescriptor(source.prototype, name)
            )
        }
    }

    _mixinStatic(dest, source, shouldOverride)
}
function _mixinStatic(dest, source, shouldOverride) {
    var staticProperties = Object.getOwnPropertyNames(source)
    const commonProperties = Object.getOwnPropertyNames(function(){})
    for (let name of staticProperties) {
        if (commonProperties.includes(name)) continue
        if (shouldOverride || !(name in dest)) {
            Object.defineProperty(
                dest,
                name,
                Object.getOwnPropertyDescriptor(source, name)
            )
        }
    }
}