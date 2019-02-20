func duplName(_ a: inout [String]) {
  var a = a
  a += ["b"]
}
var a = ["a"]
duplName(&a)
print(a.count)
