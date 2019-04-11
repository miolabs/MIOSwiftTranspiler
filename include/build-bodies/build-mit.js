const execSync = require('child_process').execSync
const fs = require('fs')

const dir = `${__dirname}/../../UIKit-cross-platform/Sources/`
if(!fs.existsSync(dir)) fs.mkdirSync(dir)

const files = ['UIColor']

files.forEach(file => {
    console.log(file)

    let contents = fs.readFileSync(`${dir}${file}.swift`, 'utf8')
    contents = '"-prefix-uikit"\n' + contents
    fs.writeFileSync(`${__dirname}/mit-files/${file}.swift`, contents)

    output = execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS12.2.sdk -target arm64-apple-ios12.2 -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/mit-files/${file}.swift'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})

    fs.writeFileSync(`${__dirname}/../UIKit/M${file}.ts`, contents)
})