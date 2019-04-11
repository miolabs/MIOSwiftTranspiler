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

if(fromStep <= 4) {
execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks ${__dirname}/generate-std-lib.swift`, {stdio: [0, 1, 2]})

replaceInFile(`${__dirname}/../Swift/_HeapObject.ts`, contents => '//' + contents)
replaceInFile(`${__dirname}/../Swift/_MaxBuiltinFloatType.ts`, contents => '//' + contents)
replaceInFile(`${__dirname}/../Swift/typeAliases.ts`, contents => (
    contents
        .replace('ClassHolder.AccessRecord = UnsafeValueBuffer', '//ClassHolder.AccessRecord = UnsafeValueBuffer')
))
}

if(fromStep <= 5) {
let imports = [fs.readFileSync(`${__dirname}/generate-imported-module.swift`, 'utf8'), fs.readFileSync(`${__dirname}/generate-imported-module-uikit.swift`, 'utf8')]
for(let lines of imports) {
    for(let line of lines.split('\n')) {
        if(!line.startsWith('import ')) continue
        let importName = line.slice('import '.length)
        if(!fs.existsSync(`${__dirname}/../${importName}`)) {
            fs.mkdirSync(`${__dirname}/../${importName}`)
        }
    }
}
execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks ${__dirname}/generate-imported-module.swift`, {stdio: [0, 1, 2]})
execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS12.2.sdk -target arm64-apple-ios12.2 -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks ${__dirname}/generate-imported-module-uikit.swift`, {stdio: [0, 1, 2]})
}

if(fromStep <= 6) {
execSync(`node ${__dirname}/build-mit.js`, {stdio: [0, 1, 2]})
}

execSync(`node ${__dirname}/../../test/test.js output-lib`, {stdio: [0, 1, 2]})
try{
execSync(`tsc ${__dirname}/../../test/lib/lib.ts`, {stdio: [0, 1, 2]})
} catch(err) {console.log(err)}