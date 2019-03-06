enum VendingMachineError: Error {
  case insufficientFunds(coinsNeeded: Int)
  case outOfStock
}
struct OtherError: Error {}
struct UnexpectedError: Error {}

func buy(amount: Int, myFunds: Int, other: Bool, unexpected: Bool) throws -> String {
  guard 10 >= amount else {
    throw VendingMachineError.outOfStock
  }
  guard myFunds >= amount else {
    throw VendingMachineError.insufficientFunds(coinsNeeded: amount - myFunds)
  }
  guard !other else {
    throw OtherError()
  }
  guard !unexpected else {
    throw UnexpectedError()
  }
  return "No errors."
}
func handleBuy(amount: Int, myFunds: Int, other: Bool, unexpected: Bool) {
  do {
    try buy(amount: amount, myFunds: myFunds, other: other, unexpected: unexpected)
    print("Success! Yum.")
  } catch VendingMachineError.outOfStock {
    print("Out of Stock.")
  } catch VendingMachineError.insufficientFunds(let coinsNeeded) {
    print("Insufficient funds. Please insert an additional \(coinsNeeded) coins.")
  } catch is OtherError {
    print("Other error.")
  } catch {
    print("Unexpected error.")
  }
}
func buyAndBye(amount: Int, myFunds: Int, other: Bool, unexpected: Bool) throws {
  print("Attempting to buy..")
  defer {
    print("Bye bye")
  }
  try buy(amount: amount, myFunds: myFunds, other: other, unexpected: unexpected)
}
func buyAndByeWrapper(amount: Int, myFunds: Int, other: Bool, unexpected: Bool) {
  do {
    try buyAndBye(amount: amount, myFunds: myFunds, other: other, unexpected: unexpected)
  } catch {}
}

handleBuy(amount: 100, myFunds: 200, other: false, unexpected: false)
handleBuy(amount: 8, myFunds: 3, other: false, unexpected: false)
handleBuy(amount: 6, myFunds: 10, other: false, unexpected: true)
handleBuy(amount: 6, myFunds: 10, other: true, unexpected: false)
handleBuy(amount: 6, myFunds: 10, other: false, unexpected: false)
print((try? buy(amount: 100, myFunds: 200, other: false, unexpected: false)) ?? "error")
print((try? buy(amount: 6, myFunds: 10, other: false, unexpected: false)) ?? "error")
print(try! buy(amount: 6, myFunds: 10, other: false, unexpected: false))
buyAndByeWrapper(amount: 100, myFunds: 200, other: false, unexpected: false)
buyAndByeWrapper(amount: 6, myFunds: 10, other: false, unexpected: false)

func deferred() -> String {
  defer { print("ok1") }
  defer { print("ok2") }
  defer { print("ok3") }
  return "ok"
}
print(deferred())
