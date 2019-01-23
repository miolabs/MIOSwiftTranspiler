struct MemberwiseInit {
  var str: String? {
    willSet {
      print("setting \(newValue ?? "null")")
    }
  }
}
struct CustomInit {
  var str: String? {
    willSet {
      print("setting \(newValue ?? "null")")
    }
  }
  init() {
    str = "custom str"
    str = "custom str2"
  }
}
struct NonInit {
  var str: String? {
    willSet {
      print("setting \(newValue ?? "null")")
    }
  }
}
struct AutoInit {
  var str: String? = "auto" {
    willSet {
      print("setting \(newValue ?? "null")")
    }
  }
}
var member = MemberwiseInit(str: "a string")
print(member.str!)
member.str = "another string"
print(member.str!)
var custom = CustomInit()
print(custom.str!)
custom.str = "yet another string"
print(custom.str!)
custom.str = nil
custom.str = "yet yet another string"
print(custom.str!)
var nonInit = NonInit()
nonInit.str = "previously unset"
print(nonInit.str!)
var autoInit = AutoInit()
print(autoInit.str!)
autoInit.str = "after auto"
print(autoInit.str!)
