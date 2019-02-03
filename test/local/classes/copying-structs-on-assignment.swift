struct PreStruct {
  var prop = 0
}
class Class {
  var prop = 0
  var subStruct = PreStruct()
}
struct Struct {
  var prop = 0
  var subStruct = PreStruct()
  var subClass = Class()
}
var s = Struct()
var s2 = s
s2.prop = 1
s2.subStruct.prop = 1
s2.subClass.prop = 1
s2.subClass.subStruct.prop = 1
print(s.prop)
print(s2.prop)
print(s.subStruct.prop)
print(s2.subStruct.prop)
print(s.subClass.prop)
print(s2.subClass.prop)
print(s.subClass.subStruct.prop)
print(s2.subClass.subStruct.prop)
var c = Class()
var c2 = c
c2.prop = 1
print(c.prop)
print(c2.prop)

protocol HasFoo {
  var foo: String {get set}
}
class FooClass: HasFoo {
  var foo: String = "foo"
}
struct FooStruct: HasFoo {
  var foo: String = "foo"
}
func changeFooInAnotherVar(_ hasFoo: HasFoo) {
  var anotherVar = hasFoo
  anotherVar.foo = "bar"
  print(hasFoo.foo)
  print(anotherVar.foo)
}
var fooClass = FooClass()
var fooStruct = FooStruct()
changeFooInAnotherVar(fooClass)
changeFooInAnotherVar(fooStruct)
print(fooClass.foo)
print(fooStruct.foo)