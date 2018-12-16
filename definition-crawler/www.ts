import request = require('request-promise-native')
import jsdom = require('jsdom')
import urlParser = require('url')
import fs = require('fs-extra')

interface Definition {
    name: string
    declaration: string
    properties: string[]
    dependencies: string[]
    path: string
    conformsTo: string[]
}

const structureDescriptionToKeyword: {[url: string]: string} = {
    'Class': 'class',
    'Structure': 'struct',
    'Protocol': 'protocol',
    'Generic Structure': 'struct',
    'Generic Class': 'class',
    'Enumeration': 'enum',
    'Type Alias': 'typealias'
}

let crawled: {[url: string]: true} = {}
let definitions: {[name: string]: Definition} = {}

const SAMPLE = Infinity
let iter = 0

async function parseProperties(url: string, parent: Definition, urlParsed: any, dom: any, properties: any) {

    let structureDescription = dom.window.document.querySelector("#main .topic-title .eyebrow").textContent.trim()
    let name = dom.window.document.querySelector("#main .topic-heading").textContent.trim()
    let structure = structureDescriptionToKeyword[structureDescription]

    let declarationElem = dom.window.document.querySelector("#declarations .declaration")
    let declaration = declarationElem ? declarationElem.textContent.trim() : structure + " " + name
    if(!structure && structureDescription !== 'Framework') {
        //throw "unknown structure description: " + structureDescription + " " + url
        //TODO we're ignoring unknown structures for now, but we should add it later
        console.log("unknown structure description: " + structureDescription + " " + url)
    }

    let conformsToElems = dom.window.document.querySelectorAll("#conforms-to li.relationships-section-content-list-item")
    let conformsToCodes: string[] = []
    let conformsToSymbols: string[] = []
    for(let conformsTo of conformsToElems) {
        let conformsToSymbol = conformsTo.querySelector("a.symbol-name").textContent.trim()
        let conformsToCode = conformsToSymbol
        let constraint = conformsTo.querySelector(".availability-constraint > div")
        if(constraint) {
            if(constraint.childNodes.length === 5 && constraint.childNodes[0].textContent === "Conforms when " && constraint.childNodes[2].textContent === " conforms to ") {
                conformsToCode += ` where ${constraint.childNodes[1].textContent} == ${constraint.childNodes[3].textContent}`
            }
            else {
                //throw "unknown constraint description: " + constraint.textContent + " " + url
                //TODO we're ignoring unknown constraints for now, but we should add it later
                console.log("unknown constraint description: " + constraint.textContent + " " + url)
            }
        }
        conformsToSymbols.push(conformsToSymbol)
        conformsToCodes.push(conformsToCode)
    }

    for(let property of properties) {
        if(!definitions[name] && structure) definitions[name] = {
            name,
            declaration,
            properties: [],
            dependencies: conformsToSymbols.slice(),
            path: (parent ? `${parent.path}/` : '') + name,
            conformsTo: conformsToCodes
        }
        await crawl(`${urlParsed.protocol}//${urlParsed.hostname}${property.href}`, definitions[name])
        if(iter++ > SAMPLE) break
    }
}

async function parseSingleDeclaration(parent: Definition, urlParsed: any, dom: any) {

    let declaration = dom.window.document.querySelector("#declarations .code-source").textContent.trim()
    if(parent) parent.properties.push(declaration)
    else console.log('!!!', declaration)

    let declarationRefs = dom.window.document.querySelectorAll("#declarations .code-source a.symbolref")
    for(let declarationRef of declarationRefs) {
        if(parent) {
            let dependency = declarationRef.textContent.trim()
            if(dependency !== parent.name && !parent.dependencies.includes(dependency)) {
                parent.dependencies.push(dependency)
            }
        }
        if(!(iter++ > SAMPLE)) await crawl(`${urlParsed.protocol}//${urlParsed.hostname}${declarationRef.href}`)
    }
}

async function crawl(url: string, parent?: Definition) {

    if(crawled[url]) return
    console.log(url)
    crawled[url] = true

    let urlParsed = new urlParser.URL(url)
    let html = await request(url)
    let dom = new jsdom.JSDOM(html)

    //the apple documentation page can be one of two categories:
    //1) a list of properties of a topic/class (e.g. https://developer.apple.com/documentation/objectivec/nsobject)
    //2) a declaration of a single property (e.g. https://developer.apple.com/documentation/objectivec/nsobject/1418815-load)
    //we establish that by looking for the list of properties ("#topics a.symbol-name-decorated")
    let properties = dom.window.document.querySelectorAll("#topics a.symbol-name-decorated")

    if(properties.length) {
        await parseProperties(url, parent, urlParsed, dom, properties)
    }
    else {
        await parseSingleDeclaration(parent, urlParsed, dom)

    }
}

async function loadNativeDefinition(definitionName: string): Promise<string> {

    let nativeDefinition: string = null
    if(fs.existsSync(`../native-definitions/${definitionName}.swift`)) {
        nativeDefinition = await fs.readFile(`../native-definitions/${definitionName}.swift`, 'utf8')
    }
    return nativeDefinition
}

function topLevelReplacements(nativeDefinition: string): string {
    let replacements = ''
    if(!nativeDefinition) return replacements
    let lines = nativeDefinition.match(/[^\r\n]+/g)
    for(let i = 1; i < lines.length; i++) {
        if(!lines[i].startsWith('    !def')) break
        replacements += lines[i] + '\n'
    }
    return replacements
}

function propertyBody(property: string, nativeDefinition: string): string {

    //we can amend the fished definitions by adding a file `native-definitions/${definitionName}.swift`
    //that way, we can crawl the definitions at any time (to update with new changes from apple)
    //without losing our custom amendments
    //the amendments can include typeReplacement and codeReplacement
    let body = ' {\n    }\n'
    if(nativeDefinition) {
        let position = nativeDefinition.indexOf(`${property} {`)
        if(position >= 0) {
            let endPosition = nativeDefinition.indexOf('\n    }\n', position) + '\n    }\n'.length
            body = nativeDefinition.substring(position + property.length, endPosition)
        }
    }
    return body
}

async function saveDefinitions() {

    if(!fs.existsSync('definitions')) {
        await fs.mkdir('definitions')
    }

    for(let definitionName in definitions) {
        let contents = ''
        contents += definitions[definitionName].declaration
        if(definitions[definitionName].conformsTo.length) {
            contents += definitions[definitionName].declaration.includes(": ") ? ", " : ": "
            contents += definitions[definitionName].conformsTo.join(", ")
        }
        contents += ' {\n'
        let nativeDefinition = await loadNativeDefinition(definitionName)
        contents += topLevelReplacements(nativeDefinition)
        for(let property of definitions[definitionName].properties) {
            contents += '    ' + property + propertyBody(property, nativeDefinition)
        }
        contents += '}\n'
        await fs.writeFile(`definitions/${definitionName}.swift`, contents)
    }
}

crawl('https://developer.apple.com/documentation/objectivec').then(() => {
    console.dir(definitions, {depth: 10})
    saveDefinitions()
})