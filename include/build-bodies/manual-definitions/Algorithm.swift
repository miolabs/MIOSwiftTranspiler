{
"Swift.(file).min(_:T,_:T,_:T,_:[T])": `
public func min<T : Comparable>(_ x: T, _ y: T, _ z: T, _ rest: T...) -> T {
  var minValue = y < x ? y : x
  if z < minValue {
    minValue = z
  }
  if rest != nil {
    for value in rest where value < minValue {
      minValue = value
    }
  }
  return minValue
}
`,
"Swift.(file).max(_:T,_:T,_:T,_:[T])": `
public func max<T : Comparable>(_ x: T, _ y: T, _ z: T, _ rest: T...) -> T {
  var maxValue = y >= x ? y : x
  if z >= maxValue {
    maxValue = z
  }
  if rest != nil {
    for value in rest where value >= maxValue {
      maxValue = value
    }
  }
  return maxValue
}
`
}