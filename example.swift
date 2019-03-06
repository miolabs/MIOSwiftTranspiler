func deferred() -> String {
  defer { print("ok1") }
  defer { print("ok2") }
  defer { print("ok3") }
  return "ok"
}
print(deferred())

func deferred2() -> String {
  defer { print("ok1") }
  defer { print("ok2") }
  defer { print("ok3") }
  return "ok"
}
print(deferred2())
