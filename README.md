# Parent repo for our swift transpiler projects

* [Initial setup](#initial-setup)
* [Usage](#usage)

A parent repo for apple/swift fork & MIOJSLibs. Contains additional tests and scripts for transpiling native swift libs.

## **Initial setup:**

TODO we'll write down once Edgar gets his mac :)

**Building the executable for the C++ compiler**

We need to additionally include the `--ios` flag, so that we can target UIKit.

```
./swift-source/swift/utils/build-script --release-debuginfo --ios
```

## **Usage:**

**Rebuilding the executable after changing a .cpp file**

```
cd swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64
ninja swift
```

**Testing our transpiler - both local & github tests**

```
cd ./test
mocha
```

**Transpiling a given file**

```
./swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks example.swift
```

For UIKit:

```
./swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -Xfrontend -disable-access-control -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS12.1.sdk -target arm64-apple-ios12.1 -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks example.swift
```

**Outputting the AST tree (untouched ASTDumper)**

```
swiftc -dump-ast -O example.swift
```

**Building the transpiled swift libraries**

```
node ./include/build-bodies/build.js from-step-2
```

**Building MIOJSLibs for templates/project**

```
node ./template-build-miojs.js
```

**Copying transpiled swift libraries into templates/project**

```
node ./template-build-swift.js
```