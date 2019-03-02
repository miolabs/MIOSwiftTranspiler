"-print-extension"
extension String: Error {}
public func precondition(
  _ condition: @autoclosure () -> Bool,
  _ message: @autoclosure () -> String = String(),
  file: StaticString = #file, line: UInt = #line
) throws {
  if !condition() {
    throw message()
  }
}