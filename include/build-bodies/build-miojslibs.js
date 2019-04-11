const execSync = require('child_process').execSync
const fs = require('fs')

//uncomment to rebuild miojslibs
//execSync(`cd ${__dirname}/../../MIOJSLibs && npm run dev`)

//BODGE dirty workaround to make miojslibs work in node
global.window = {addEventListener: () => {}}
global.navigator = {userAgent: '', platform: '', appName: ''}

const miojslibs = require('../../MIOJSLibs/packages/miojslibs/dist/js/miojslibs.js')
const miojslibsFileNames = fs.readdirSync(`${__dirname}/../../MIOJSLibs/source/MIOUI/`).filter(fileName => fileName.endsWith('.ts'))
const miojslibsFiles = miojslibsFileNames.map(file => fs.readFileSync(`${__dirname}/../../MIOJSLibs/source/MIOUI/${file}`, 'utf8'))
const miojslibsMapping = require('./miojslibs-mapping.json')

let UIKit = execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS12.2.sdk -target arm64-apple-ios12.2 -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks ${__dirname}/print-members-uikit.swift`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
eval('UIKit = {' + UIKit + '}')

let optionals = []
let renames = []

for(let className in UIKit) {
    if(!miojslibs[className]) continue
    console.log('-------------------', className)

    let mio = miojslibs[className]
    let swift = UIKit[className]
    let instance = null
    let classMapping = miojslibsMapping[className]
    try {instance = new mio()} catch(err){}

    let sourceFileI = miojslibsFiles.findIndex(file => file.match(`export (enum|class) ${className}[^a-zA-Z0-9]`))
    if(sourceFileI < 0) throw "file not found for " + className
    let sourceFile = miojslibsFileNames[sourceFileI]

    for(let i = 0; i < swift.length; i += 3) {
        let propName = swift[i]
        let isOptional = swift[i + 1]
        let optionalParams = swift[i + 2]

        if(classMapping && classMapping[propName]) {
            renames.push({chain: ["getSourceFile", sourceFile, "getClass", className, "getInstanceMethod", classMapping[propName]], rename: propName})
            propName = classMapping[propName]
        }

        let found = false
        if(propName in mio) {
            found = true
            delete mio[propName]
        }
        if(mio.prototype && propName in mio.prototype) {
            found = true
            delete mio.prototype[propName]
        }
        if(instance && propName in instance) {
            found = true
            delete instance[propName]
        }

        if(found) {
            if(isOptional) optionals.push(["getSourceFile", sourceFile, "getClass", className, "getInstanceProperty", propName])
            else for(let opI = 0; opI < optionalParams.length; opI++) {
                if(!optionalParams[opI]) continue
                optionals.push(["getSourceFile", className + ".ts", "getClass", className, "getInstanceMethod", propName, "getParameters", "", "0", null])
            }
        }
    }

    for(let propName in mio) {
        if(propName[0] !== '_' && propName !== 'constructor' && mio.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
    if(mio.prototype) for(let propName in mio.prototype) {
        if(propName[0] !== '_' && propName !== 'constructor' && mio.prototype.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
    if(instance) for(let propName in instance) {
        if(propName[0] !== '_' && propName !== 'constructor' && instance.hasOwnProperty(propName)) console.log('!superfluous', propName)
    }
}

fs.writeFileSync(`${__dirname}/miojslibs-optionals.json`, JSON.stringify(optionals))
fs.writeFileSync(`${__dirname}/miojslibs-renames.json`, JSON.stringify(renames))