let a = 3
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}