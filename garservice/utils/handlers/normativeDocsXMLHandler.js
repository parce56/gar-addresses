const XMLHandler = require('./XMLHandler')
const NormativeDoc = require('../../models/NormativeDoc')

class NormativeDocsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: NormativeDoc,
      tagName: 'NORMDOC',
      entityName: 'нормативных документов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        name: attrs.NAME ? attrs.NAME : 'Без названия',
        date: attrs.DATE,
        number: attrs.NUMBER,
        type: attrs.TYPE ? parseInt(attrs.TYPE) : null,
        kind: attrs.KIND ? parseInt(attrs.KIND) : null,
        updatedate: attrs.UPDATEDATE,
        orgname: attrs.ORGNAME,
        regnum: attrs.REGNUM || null,
        regdate: attrs.REGDATE || null,
        accdate: attrs.ACCDATE,
        comment: attrs.COMMENT || null
      })
    })
  }
}

function normativeDocsXMLHandler(readStream) {
  return new NormativeDocsXMLHandler(readStream)
}

module.exports = { normativeDocsXMLHandler }