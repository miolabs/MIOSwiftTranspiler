func arithmeticMean(_ numbers: Int...) -> Int {
    var sum = 0
    for i in numbers {
      sum += i
    }
    return sum / numbers.count
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
printWithSeparator(separator: "|")
printWithSeparator("a", separator: "|")
printWithSeparator("a", "b", separator: "|")
printWithSeparator("a", "b", "c", separator: "|")
