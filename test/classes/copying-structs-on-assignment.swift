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
//this will fail - cloning structures is deep (as long as there's only a structure in the chain)
//we need to set $isStruct=true in struct declarations (also native ones like Map, Set and Array)
//_.cloneStruct() needs to traverse the tree and break only in case a non-structure is encountered