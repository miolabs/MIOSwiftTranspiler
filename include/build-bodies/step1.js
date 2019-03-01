const execSync = require('child_process').execSync
const fs = require('fs')

const dir = '/Users/bubulkowanorka/projects/swift-source/swift/stdlib/public/core/'

const files = [
    'Algorithm.swift',
    'ArrayBody.swift',
    'ArrayBuffer.swift',
    'ArrayBufferProtocol.swift',
    'ArrayCast.swift',
    'Array.swift',
    'ArrayShared.swift',
    'ArraySlice.swift',
    'ArrayType.swift',
    'ASCII.swift',
    'Assert.swift',
    'AssertCommon.swift',
    'AtomicInt.swift.gyb',
    'BidirectionalCollection.swift',
    'Bitset.swift',
    'Bool.swift',
    'BridgeObjectiveC.swift',
    'BridgeStorage.swift',
    'BridgingBuffer.swift',
    'Builtin.swift',
    'BuiltinMath.swift.gyb',
    'Character.swift',
    'CocoaArray.swift',
    'Codable.swift.gyb',
    'Collection.swift',
    'CollectionAlgorithms.swift',
    'CollectionOfOne.swift',
    'Comparable.swift',
    'CompilerProtocols.swift',
    'ContiguousArray.swift',
    'ContiguouslyStored.swift',
    'ClosedRange.swift',
    'ContiguousArrayBuffer.swift',
    'CString.swift',
    'CTypes.swift',
    'DebuggerSupport.swift',
    'Dictionary.swift',
    'DictionaryBridging.swift',
    'DictionaryBuilder.swift',
    'DictionaryCasting.swift',
    'DictionaryStorage.swift',
    'DictionaryVariant.swift',
    'DropWhile.swift',
    'Dump.swift',
    'EmptyCollection.swift',
    'Equatable.swift',
    'ErrorType.swift',
    'Filter.swift',
    'FixedArray.swift.gyb',
    'FlatMap.swift',
    'Flatten.swift',
    'FloatingPoint.swift',
    'FloatingPointParsing.swift.gyb',
    'FloatingPointTypes.swift.gyb',
    'Hashable.swift',
    'AnyHashable.swift',
    'Hasher.swift',
    'Hashing.swift',
    'HashTable.swift',
    'ICU.swift',
    'Indices.swift',
    'InputStream.swift',
    'IntegerParsing.swift',
    'Integers.swift',
    'IntegerTypes.swift.gyb',
    'Join.swift',
    'KeyPath.swift',
    'KeyValuePairs.swift',
    'LazyCollection.swift',
    'LazySequence.swift',
    'LifetimeManager.swift',
    'ManagedBuffer.swift',
    'Map.swift',
    'MemoryLayout.swift',
    'UnicodeScalar.swift',
    'Mirrors.swift.gyb',
    'Misc.swift',
    'MutableCollection.swift',
    'NativeDictionary.swift',
    'NativeSet.swift',
    'NewtypeWrapper.swift',
    'NormalizedCodeUnitIterator.swift',
    'ObjectIdentifier.swift',
    'Optional.swift',
    'OptionSet.swift',
    'OutputStream.swift',
    'Pointer.swift',
    'Policy.swift',
    'PrefixWhile.swift',
    'Print.swift',
    'Random.swift',
    'RandomAccessCollection.swift',
    'Range.swift',
    'RangeReplaceableCollection.swift',
    'ReflectionMirror.swift',
    'Repeat.swift',
    'REPL.swift',
    'Result.swift',
    'Reverse.swift',
    'Runtime.swift.gyb',
    'RuntimeFunctionCounters.swift',
    'SipHash.swift',
    'Sequence.swift',
    'SequenceAlgorithms.swift',
    'Set.swift',
    'SetAlgebra.swift',
    'SetAnyHashableExtensions.swift',
    'SetBridging.swift',
    'SetBuilder.swift',
    'SetCasting.swift',
    'SetStorage.swift',
    'SetVariant.swift',
    'ShadowProtocols.swift',
    'Shims.swift',
    'Slice.swift',
    'SmallBuffer.swift',
    'SmallString.swift',
    'Sort.swift',
    'StaticString.swift',
    'Stride.swift',
    'StringHashable.swift',
    'String.swift',
    'StringBreadcrumbs.swift',
    'StringBridge.swift',
    'StringCharacterView.swift',
    'StringComparable.swift',
    'StringComparison.swift',
    'StringCreate.swift',
    'StringGuts.swift',
    'StringGutsSlice.swift',
    'StringGutsRangeReplaceable.swift',
    'StringGutsVisitor.swift',
    'StringObject.swift',
    'StringProtocol.swift',
    'StringIndex.swift',
    'StringIndexConversions.swift',
    'StringInterpolation.swift',
    'StringLegacy.swift',
    'StringNormalization.swift',
    'StringRangeReplaceableCollection.swift',
    'StringStorage.swift',
    'StringSwitch.swift',
    'StringTesting.swift',
    'StringUnicodeScalarView.swift',
    'StringUTF16View.swift',
    'StringUTF8View.swift',
    'StringUTF8Validation.swift',
    'StringVariant.swift',
    'Substring.swift',
    'SwiftNativeNSArray.swift',
    'ThreadLocalStorage.swift',
    'UIntBuffer.swift',
    'UnavailableStringAPIs.swift.gyb',
    'UnicodeEncoding.swift',
    'UnicodeHelpers.swift',
    'UnicodeParser.swift',
    'UnicodeScalarProperties.swift',
    'CharacterProperties.swift',
    'Unmanaged.swift',
    'UnmanagedOpaqueString.swift',
    'UnmanagedString.swift',
    'UnsafeBufferPointer.swift.gyb',
    'UnsafeRawBufferPointer.swift.gyb',
    'UnsafePointer.swift',
    'UnsafeRawPointer.swift',
    'UTFEncoding.swift',
    'UTF8.swift',
    'UTF16.swift',
    'UTF32.swift',
    'Unicode.swift',
    'StringGraphemeBreaking.swift',
    'ValidUTF8Buffer.swift',
    'WriteBackMutableSlice.swift',
    'MigrationSupport.swift'
]

files.forEach(file => {
    let contents = fs.readFileSync(`${dir}${file}`, 'utf8')
    if(file.endsWith('.swift')) contents = '"-print-ranges"\n' + contents
    fs.writeFileSync(`${__dirname}/swift-lib/${file}`, contents)
})

files.forEach(file => {
    if(!file.endsWith('.swift')) return
    console.log(file)
    let contents = fs.readFileSync(`${__dirname}/swift-lib/${file}`, 'utf8').split('\n')
    let output
    let isUntyped
    try {
        output = execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/swift-lib/${file}'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
    }
    catch(err) {
        output = err.stdout
    }
    try {
        let untypedOutput = execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-parse -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/swift-lib/${file}'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
        if(untypedOutput.length > output.length) {
            output = untypedOutput
            isUntyped = true
        }
    }
    catch(err) {}
    let arr = eval('[' + output + ']')
    let parsedArr = [isUntyped]
    for(let i = 0; i < arr.length - 3; i+= 5) {
        let isType = arr[i]
        let identifier = arr[i + 1]
        let line0 = parseInt(arr[i + 2].split(':')[1])
        let col0 = parseInt(arr[i + 2].split(':')[2])
        let line1 = parseInt(arr[i + 3].split(':')[1])
        let col1 = parseInt(arr[i + 3].split(':')[2])
        let extLine = parseInt(arr[i + 4].split(':')[1])
        let extCol = parseInt(arr[i + 4].split(':')[2])
        let body = ''
        for(let lineI = line0; lineI <= line1; lineI++) {
            let line = contents[lineI - 1]
            if(lineI === line1) line = line.substr(0, col1)
            //if(lineI === line0) line = line.substr(col0 - 1) ignoring, as it leaves out func keywords, e.g. `mutating`
            body += (body ? '\n' : '') + line
        }
        let ext = ''
        if(extLine >= 0) {
            for(let lineI = extLine; lineI <= line1; lineI++) {
                let line = contents[lineI - 1]
                let braceIndex = line.indexOf('{')
                if(braceIndex >= 0) {
                    ext += line.slice(0, braceIndex)
                    break
                }
                else {
                    ext += line + '\n'
                }
            }
        }
        parsedArr.push({isType, identifier, body, ext})
    }
    fs.writeFileSync(`${__dirname}/bodies/${file}`, JSON.stringify(parsedArr))
})