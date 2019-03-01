const execSync = require('child_process').execSync
const fs = require('fs')

function replaceInFile(path, transform) {
    fs.writeFileSync(path, transform(fs.readFileSync(path, 'utf8')))
}

let noAutogenerate = process.argv[2] === 'no-autogenerate'

if(!noAutogenerate) {
    execSync(`node ${__dirname}/step1.js`, {stdio: [0, 1, 2]})
    execSync(`node ${__dirname}/step2.js`, {stdio: [0, 1, 2]})
}

execSync('/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks /Users/bubulkowanorka/projects/antlr4-visitor/include/build-bodies/generate-std-lib.swift', {stdio: [0, 1, 2]})

replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/_HeapObject.ts', contents => '//' + contents)
replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/_MaxBuiltinFloatType.ts', contents => '//' + contents)
replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/typeAliases.ts', contents => (
    contents
        .replace('ClassHolder.AccessRecord = UnsafeValueBuffer', '//ClassHolder.AccessRecord = UnsafeValueBuffer')
))
replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/Sequence.ts', contents => (
    contents
        .replace('makeIterator($info) {\nreturn this\n}', '/*makeIterator($info) {\nreturn this\n}*/')
))

execSync('/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks /Users/bubulkowanorka/projects/antlr4-visitor/include/build-bodies/generate-imported-module.swift', {stdio: [0, 1, 2]})

execSync('node /Users/bubulkowanorka/projects/antlr4-visitor/test/test.js output-lib', {stdio: [0, 1, 2]})
try{
execSync('tsc /Users/bubulkowanorka/projects/antlr4-visitor/test/lib.ts', {stdio: [0, 1, 2]})
} catch(err) {console.log(err)}