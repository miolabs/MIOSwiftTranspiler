# Parent repo for our swift transpiler projects

* [Initial setup](#initial-setup)
* [Usage](#usage)

A parent repo for apple/swift fork & MIOJSLibs. Contains additional tests and scripts for transpiling native swift libs.

## **Initial setup:**

**Cloning this repo**

Clone with an additional flag `git clone --recurse-submodules https://github.com/miolabs/MIOSwiftTranspiler.git`.
That ensures that it's cloned together with the submodule MIOJSLibs.

**Cloning the swift repo (separate for now)**

We've decided not to include the swift submodule, because it was failing when running the
`./swift/utils/update-checkout --clone` for some reason. For now, you need to clone it *separately*.

Go to the *parent directory* of MIOSwiftTranspiler and run `mkdir swift-source && cd swift-source`. Then
clone our fork of the apple swift repo `git clone https://github.com/miolabs/swift.git`. Then remember to
switch the branch `cd swift && git checkout ts-transpiler`. Finally, run the command that swift needs to work
`cd .. && ./swift/utils/update-checkout --clone`.

Finally, you need to build the C++ executable. We need to additionally include the `--ios` flag, so that we can target UIKit.
Run `./swift/utils/build-script --release-debuginfo --ios`. The initial setup is complete 🎉🎉.

## **Usage:**

**Rebuilding the executable after changing a .cpp file**

```
cd ./swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64
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

**Running templates/project**

These instructions are for Visual Studio Code; not sure how to do without it.

Open the folder `./MIOJSLibs/templates/project`. Then `Terminal -> New Terminal`. For the first time, run
`npm run init`; later on you can just do `npm run tsc` to run the tsc compiler in watch mode.

You also need to have the express extension installed in Visual Studio Code. Set the port as 9090 in
express settings. Then do `cmd+p` and type `>Express: Host Current Workspace`. You can now launch the VSC debugger.
