class A {
  var _ToGet: Int = 1
  var willToGet: Int = 2 {
    willSet {
      print("will set \(newValue)")
    }
  }
  var _ToWill: Int = 3
  var getToWill: Int {
    get {
      return 20
    }
    set {
      print("is setting \(newValue)")
    }
  }
  var _internal: Int = 10
  var getToGet: Int {
    get {
      return _internal
    }
    set {
      _internal = newValue
    }
  }
}
class B: A {
  override var _ToGet: Int {
    get {
      return super._ToGet * 10
    }
    set {
      super._ToGet = newValue / 5
    }
  }
  override var willToGet: Int {
    get {
      return super.willToGet * 20
    }
    set {
      super.willToGet = newValue / 7
    }
  }
  override var _ToWill: Int {
    willSet {
      print("will set \(newValue)")
    }
  }
  override var getToWill: Int {
    willSet {
      print("will set \(newValue)")
    }
  }
  override var getToGet: Int {
    get {
      return super.getToGet * 13
    }
    set {
      super.getToGet = newValue / 9
    }
  }
}
var a = A()
var b = B()
print(a._ToGet)
print(a._ToWill)
print(a.getToGet)
print(a.getToWill)
print(a.willToGet)
print(b._ToGet)
print(b._ToWill)
print(b.getToGet)
print(b.getToWill)
print(b.willToGet)
a._ToGet = 1000
a._ToWill = 1000
a.getToGet = 1000
a.getToWill = 1000
a.willToGet = 1000
b._ToGet = 1000
b._ToWill = 1000
b.getToGet = 1000
b.getToWill = 1000
b.willToGet = 1000
print(a._ToGet)
print(a._ToWill)
print(a.getToGet)
print(a.getToWill)
print(a.willToGet)
print(b._ToGet)
print(b._ToWill)
print(b.getToGet)
print(b.getToWill)
print(b.willToGet)
