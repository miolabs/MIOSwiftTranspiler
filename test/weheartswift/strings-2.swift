let aString = "anutforajaroftuna"

var reverse = ""

for character in aString {
    var char = "\(character)"
    reverse = char + reverse
}

print(aString == reverse)