"-print-extension"
extension Array: CustomStringConvertible, CustomDebugStringConvertible  {
  public var description: String {
    var result = ""
    //if let type = type {
    //  result += "\(type)(["
    //} else {
      result += "["
    //}

    var first = true
    for item in self {
      if first {
        first = false
      } else {
        result += ", "
      }
      result += "\(item)"
    }
    //if type != nil {
    //  result += "])"
    //}
    //else {
      result += "]"
    //}
    return result
  }
}