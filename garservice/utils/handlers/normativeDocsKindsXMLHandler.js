const XMLHandler = require('./XMLHandler')
const NormativeDocsKind = require('../../models/NormativeDocsKind')

class NormativeDocsKindsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: NormativeDocsKind,
      tagName: 'NDOCKIND',
      entityName: 'видов нормативных документов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        name: attrs.NAME
      })
    })
  }
}

function normativeDocsKindsXMLHandler(readStream) {
  return new NormativeDocsKindsXMLHandler(readStream)
}

module.exports = { normativeDocsKindsXMLHandler }