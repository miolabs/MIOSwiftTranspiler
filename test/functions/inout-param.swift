func incr(_ a: inout Int) {
    a += 1
    return
}
var b = 0
incr(&b)
print(b)

struct HasWillSetStr {
  var str: String = "str" {
    willSet {
      print("setting \(newValue)")
    }
  }
}

var hasWillSetStr = HasWillSetStr()

func doNothing(_ str: inout String) {}
func setToFooThenBar(_ str: inout String) {
  str = "foo"
  str = "bar"
}

doNothing(&hasWillSetStr.str)
setToFooThenBar(&hasWillSetStr.str)
