var a = 4
if a > 3 {
    print("A greater than 3")
} else {
    print("A smaller or equal 3")
}

var dict = ["key":"val"]
if let dictVal = dict["key"] {
    print(dictVal);
}

for number in 0...10 {
    guard number < 3 else {
        break
    }
    print(number)
}

var str: String? = "elo"
let b = "ziom"
if let b = str {
  print(b)
}
print(b)

var dict2 = ["key": (0, (1, 2))]
if let (x, (y, z)) = dict2["key"] {
  print("nested tuple exists \(x) \(y) \(z)")
}
if let (x, (y, z)) = dict2["nonKey"] {
  print("nested tuple exists \(x) \(y) \(z)")
}