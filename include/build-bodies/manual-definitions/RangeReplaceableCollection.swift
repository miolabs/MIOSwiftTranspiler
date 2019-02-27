{
"Swift.(file).RangeReplaceableCollection.removeLast()": `
extension RangeReplaceableCollection where Self : BidirectionalCollection {
  public mutating func removeLast() -> Element {
    return remove(at: index(before: endIndex))
  }
}
`
}