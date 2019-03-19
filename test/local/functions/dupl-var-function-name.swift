class DuplicateFoo {
  var foo: String = "foo"
  func foo(bar: String) {
    print(foo)
    print(bar)
  }
}
var duplicateFoo = DuplicateFoo()
duplicateFoo.foo(bar: "bar")
duplicateFoo.foo(bar: duplicateFoo.foo)
