extension Range {
  func printOk() {
    print("ok range")
  }
}
extension Array {
  func printOk() {
    print("ok array")
  }
}
/*
not allowed for now
extension Collection {
  func printOk2() {
    print("ok collection")
  }
}
*/

(1..<5).printOk()
["str"].printOk()
//["str"].printOk2()
