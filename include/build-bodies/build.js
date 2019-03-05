const execSync = require('child_process').execSync
const fs = require('fs')

function replaceInFile(path, transform) {
    fs.writeFileSync(path, transform(fs.readFileSync(path, 'utf8')))
}

let fromStep = 1
if(process.argv[2] && process.argv[2].includes('from-step-')) fromStep = parseInt(process.argv[2].match('[0-9]+'))

if(fromStep <= 1) execSync(`node ${__dirname}/step1.js`, {stdio: [0, 1, 2]})
if(fromStep <= 2) execSync(`node ${__dirname}/step2.js`, {stdio: [0, 1, 2]})
if(fromStep <= 3) execSync(`node ${__dirname}/step3.js`, {stdio: [0, 1, 2]})

execSync('/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks /Users/bubulkowanorka/projects/antlr4-visitor/include/build-bodies/generate-std-lib.swift', {stdio: [0, 1, 2]})

replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/_HeapObject.ts', contents => '//' + contents)
replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/_MaxBuiltinFloatType.ts', contents => '//' + contents)
replaceInFile('/Users/bubulkowanorka/projects/antlr4-visitor/include/Swift/typeAliases.ts', contents => (
    contents
        .replace('ClassHolder.AccessRecord = UnsafeValueBuffer', '//ClassHolder.AccessRecord = UnsafeValueBuffer')
))

execSync('/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks /Users/bubulkowanorka/projects/antlr4-visitor/include/build-bodies/generate-imported-module.swift', {stdio: [0, 1, 2]})

execSync('node /Users/bubulkowanorka/projects/antlr4-visitor/test/test.js output-lib', {stdio: [0, 1, 2]})
try{
execSync('tsc /Users/bubulkowanorka/projects/antlr4-visitor/test/lib/lib.ts', {stdio: [0, 1, 2]})
} catch(err) {console.log(err)}