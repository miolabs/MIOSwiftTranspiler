{
"Swift.(file).Array.append(contentsOf:S)": `
extension Array {
  public mutating func append<S: Sequence>(contentsOf newElements: __owned S)
    where S.Element == Element {

      for el in newElements {
        append(el)
      }
  }
}
`,
"Swift.(file).Array.insert(_:Element,at:Int)": `
extension Array {
  public mutating func insert(_ newElement: __owned Element, at i: Int) {
    self.replaceSubrange(i..<i, with: CollectionOfOne(newElement))
  }
}
`,
"Swift.(file).Array.removeAll(keepingCapacity:Bool)": `
extension Array {
  public mutating func removeAll(keepingCapacity keepCapacity: Bool = false) {
    self.replaceSubrange(indices, with: EmptyCollection())
  }
}
`,
"Swift.(file).Array.==infix(_:Array<Element>,_:Array<Element>)": `
extension Array where Element: Equatable {
  public static func ==(lhs: Array<Element>, rhs: Array<Element>) -> Bool {
    let lhsCount = lhs.count
    if lhsCount != rhs.count {
      return false
    }

    if lhsCount == 0 {
      return true
    }

    for idx in 0..<lhsCount {
      if lhs[idx] != rhs[idx] {
        return false
      }
    }

    return true
  }
}
`
}