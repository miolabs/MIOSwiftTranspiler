func arithmeticMean(_ numbers: Int...) -> Int {
    return 1
}
print(arithmeticMean(1, 2, 3, 4, 5))

func printWithSeparator(_ varArgs: String..., separator: String) {
  var first = true
  for arg in varArgs {
    if first {first = false}
    else {print(separator)}
    print(arg)
  }
}
printWithSeparator("a", "b", "c", separator: "|")
