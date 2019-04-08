function _injectIntoOptional(val) {
    return val == null ? Optional.none : Optional.some(val, {})
}