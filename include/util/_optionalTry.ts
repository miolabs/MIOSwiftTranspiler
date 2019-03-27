//WRAP_OPTIONAL
//function _optionalTry(expr) { try { return expr() } catch(e) { return Optional.none } }
//!WRAP_OPTIONAL
function _optionalTry(expr) { try { return expr() } catch(e) { return null } }