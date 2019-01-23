protocol HasString {
    var string: String {get set}
}

struct HasStringStruct: HasString {
    var string: String
}

func printString<T: HasString>(_ arg: T) {
    print(arg.string)
    print(arg.string.count)
}

var hasString = HasStringStruct(string: "string")
printString(hasString)