import { Project, BinaryExpression, PropertyDeclaration, ParameterDeclaration, ClassInstancePropertyTypes, ReferencedSymbol } from "ts-morph"
const optionals = require("./miojslibs-optionals.json")
const renames = require("./miojslibs-renames.json")

const project = new Project({
  tsConfigFilePath: `${__dirname}/../../MIOJSLibs/tsconfig.json`,
  compilerOptions: {
    outDir: `${__dirname}/../../MIOJSLibs/types-swift-transpiler`
  }
})

function getReferences(chain: string[]): ReferencedSymbol[] {
  let chained: any = project
  for(let i = 0; i < chain.length; i += 2) {
    if(typeof chain[i + 1] === 'string') chained = chained[chain[i]](chain[i + 1])
    else chained = chained[chain[i]]
  }

  let property = chained as ParameterDeclaration | ClassInstancePropertyTypes
  //console.log(chain)
  return property.findReferences()
}

let replacements = []

for(let optional of optionals) {
  for(const referencedSymbol of getReferences(optional)) {
    for(let reference of referencedSymbol.getReferences()) {

      let isDeclaration = reference.getNode().getParent().getKindName() === 'PropertyDeclaration'
      if (isDeclaration) {
        let declaration = reference.getNode().getParent() as PropertyDeclaration
        if(declaration.getInitializer()) {
          replacements.push({
            file: reference.getSourceFile().getFilePath(),
            range: [declaration.getInitializer().getStart(), declaration.getInitializer().getEnd()],
            text: "_injectIntoOptional(" + declaration.getInitializer().getText() + ")"
          })
        }
        continue
      }
  
      let isAssignment = false
      let nodeOrParent = reference.getNode()
      if(nodeOrParent.getParent().getKindName() === 'PropertyAccessExpression') nodeOrParent = nodeOrParent.getParent()
      if(nodeOrParent.getParent().getKindName() === 'BinaryExpression') {
        let bin = nodeOrParent.getParent() as BinaryExpression
        if (bin.getOperatorToken().getText().trim() === '=' && bin.getLeft() === nodeOrParent) {
          isAssignment = true
          replacements.push({
            file: reference.getSourceFile().getFilePath(),
            range: [bin.getRight().getStart(), bin.getRight().getEnd()],
            text: "_injectIntoOptional(" + bin.getRight().getText() + ")"
          })
        }
      }
      if (isAssignment) continue
  
      //TODO custom rules
  
      replacements.push({
        file: reference.getSourceFile().getFilePath(),
        range: [reference.getNode().getStart(), reference.getNode().getEnd()],
        text: reference.getNode().getText() + "[0]"
      })
    }
  }
}

for(let rename of renames) {
  for(const referencedSymbol of getReferences(rename.chain)) {
    for(let reference of referencedSymbol.getReferences()) {
      replacements.push({
        file: reference.getSourceFile().getFilePath(),
        range: [reference.getNode().getStart(), reference.getNode().getEnd()],
        text: rename.rename
      })
    }
  }
}

replacements.sort((a, b) => a.range[0] < b.range[1] ? 1 : -1)

//console.log(replacements)

for(let replacement of replacements) {
  let file = project.getSourceFile(replacement.file)

  file.replaceText(replacement.range, replacement.text)
}

project.emit()