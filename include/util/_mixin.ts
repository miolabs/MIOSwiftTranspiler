function _mixin(dest, source, shouldOverride) {
    var properties = Object.getOwnPropertyNames(source.prototype)
    for (let name of properties) {
        if (name == 'constructor') continue
        if (shouldOverride || !(name in dest.prototype)) {
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