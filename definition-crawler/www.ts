import request = require('request-promise-native');
import jsdom = require('jsdom');
import urlParser = require('url');

interface Parent {
    declaration: string
    properties: string[]
}

const structureDescriptionToKeyword = {
    'Class': 'class',
    'Structure': 'struct',
    'Protocol': 'protocol',
    'Generic Structure': 'struct',
    'Enumeration': 'enum'
}

let crawled = {}

async function crawl(url: string, parent?: Parent) {

    if(crawled[url]) return
    crawled[url] = true

    let urlParsed = new urlParser.URL(url)
    let html = await request(url)
    let dom = new jsdom.JSDOM(html)

    let properties = dom.window.document.querySelectorAll("#topics a.symbol-name-decorated")

    if(properties.length) {
        let structureDescription = dom.window.document.querySelector("#main .topic-title .eyebrow").textContent.trim()
        let declaration = dom.window.document.querySelector("#main .topic-heading").textContent.trim()
        let structure = structureDescriptionToKeyword[structureDescription]
        if(!structure && structureDescription !== 'Framework') throw "unknown structure description: " + structureDescription + " " + url
        for(let property of properties) {
            await crawl(urlParsed.protocol + '//' + urlParsed.hostname + property.href, {declaration: structure + " " + declaration, properties: []})
        }
    }
    else {
        let declaration = dom.window.document.querySelector("#declarations .code-source").textContent.trim()
        parent.properties.push(declaration)
        console.log(parent.declaration, '-->', declaration)

        let declarationRefs = dom.window.document.querySelectorAll("#declarations .code-source a.symbolref")
        for(let declarationRef of declarationRefs) {
            await crawl(urlParsed.protocol + '//' + urlParsed.hostname + declarationRef.href, {declaration: declarationRef.textContent.trim(), properties: []})
        }
    }
}

crawl('https://developer.apple.com/documentation/objectivec')