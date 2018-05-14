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