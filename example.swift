func deferred() {
  defer { print("ok") }
  defer { print("ok2") }
  defer { print("ok3") }
  return
}
deferred()
