var a = 1
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 3
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 4
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 1
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 3
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 4
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 2
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 3
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 5
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 6
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}