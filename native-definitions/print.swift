func print(items: Any...) {
    !def codeReplacement ts "console.log(#AA)"
    !def codeReplacement java "System.out.println(#AA)"
}