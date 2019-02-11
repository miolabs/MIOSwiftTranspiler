class TestElement: Equatable {
  let identifier: String

  init(identifier: String) {
    self.identifier = identifier
  }

  static func == (lhs: TestElement, rhs: TestElement) -> Bool {
   return lhs.identifier == rhs.identifier
  }
}