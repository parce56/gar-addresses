const XMLHandler = require('./XMLHandler')
const ParamType = require('../../models/ParamType')

class ParamTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ParamType,
      tagName: 'PARAMTYPE',
      entityName: 'типов параметров',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        name: attrs.NAME,
        code: attrs.CODE,
        desc: attrs.DESC,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactive: attrs.ISACTIVE === 'true' ? 1 : 0
      })
    })
  }
}

function paramTypesXMLHandler(readStream) {
  return new ParamTypesXMLHandler(readStream)
}

module.exports = { paramTypesXMLHandler }