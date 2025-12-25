const XMLHandler = require('./XMLHandler')
const NormativeDocsType = require('../../models/NormativeDocsType')

class NormativeDocsTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: NormativeDocsType,
      tagName: 'NDOCTYPE',
      entityName: 'типов нормативных документов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        name: attrs.NAME,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE
      })
    })
  }
}

function normativeDocsTypesXMLHandler(readStream) {
  return new NormativeDocsTypesXMLHandler(readStream)
}

module.exports = { normativeDocsTypesXMLHandler }