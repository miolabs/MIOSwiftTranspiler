"-print-extension"
extension Sequence  {
  public func sorted(
    by areInIncreasingOrder:
      (Element, Element) throws -> Bool
  ) rethrows -> [Element] {
    var result = Array(self)
    try result.sort(by: areInIncreasingOrder)
    return result
  }
}