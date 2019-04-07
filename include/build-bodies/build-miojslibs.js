const execSync = require('child_process').execSync
const fs = require('fs')

//uncomment to rebuild miojslibs
//execSync(`cd ${__dirname}/../../MIOJSLibs && npm run dev`)

//BODGE dirty workaround to make miojslibs work in node
global.window = {addEventListener: () => {}}
global.navigator = {userAgent: '', platform: '', appName: ''}

const miojslibs = require('../../MIOJSLibs/packages/miojslibs/dist/js/miojslibs.js')

let UIKit = execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS12.2.sdk -target arm64-apple-ios12.2 -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks ${__dirname}/print-members-uikit.swift`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
eval('UIKit = {' + UIKit + '}')

for(let className in UIKit) {
    if(!miojslibs[className]) continue
    console.log('-------------------', className)

    let mio = miojslibs[className]
    let swift = UIKit[className]
    let instance = null
    try {instance = new mio()} catch(err){}

    for(let i = 0; i < swift.length; i += 3) {
        let propName = swift[i]
        let isOptional = swift[i + 1]
        let optionalParams = swift[i + 2]

        if(propName in mio) {
            if(isOptional) console.log('!optional', propName)
            else if(optionalParams.some(optionalParam => !!optionalParam)) console.log('!optionalParams', propName)
            delete mio[propName]
        }
        else if(mio.prototype && propName in mio.prototype) {
            if(isOptional) console.log('!optional', propName)
            else if(optionalParams.some(optionalParam => !!optionalParam)) console.log('!optionalParams', propName)
            delete mio.prototype[propName]
        }
        else if(instance && propName in instance) {
            if(isOptional) console.log('!optional', propName)
            else if(optionalParams.some(optionalParam => !!optionalParam)) console.log('!optionalParams', propName)
            delete instance[propName]
        }
    }

    for(let propName in mio) {
        if(propName[0] !== '_' && mio.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
    if(mio.prototype) for(let propName in mio.prototype) {
        if(propName[0] !== '_' && mio.prototype.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
    if(instance) for(let propName in instance) {
        if(propName[0] !== '_' && instance.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
}