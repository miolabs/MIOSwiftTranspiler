var a: String? = "a"
if let a = a, a < "c" {
  print(a)
}
print(a!)

var dict = [0: "a", 1: "b", 2: "c"]
for number in 0...10 {
  guard let letter = dict[number], letter <= "c" else {
    break
  }
  print(number)
  print(letter)
}

func printStr(_ str: String?) {
  guard let str = str else {
    return
  }
  print(str)
}
printStr(nil)
printStr("string")

var dict2 = ["key": (0, (1, 2))]
if let (x, (y, z)) = dict2["key"], x == 0, y == 1, z == 2 {
  print("nested tuple exists \(x) \(y) \(z)")
}
if let (x, (y, z)) = dict2["nonKey"], x == 0, y == 1, z == 2 {
  print("nested tuple exists \(x) \(y) \(z)")
}

var i = 0
while let letter = dict[i], letter < "c" {
  i += 1
  print(letter)
}
