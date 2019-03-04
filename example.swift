"-print-extension"
extension ClosedRange: Collection, BidirectionalCollection, RandomAccessCollection
where Bound : Strideable, Bound.Stride : SignedInteger
 {
  public func index(after i: Index) -> Index {
    switch i {
    case .inRange(let x):
      "#clarifyGeneric#Bound.Stride#Int"
      return x == upperBound
        ? .pastEnd
        : .inRange(x.advanced(by: 1))
    case .pastEnd:
      preconditionFailure("Incrementing past end index")
    }
  }
}