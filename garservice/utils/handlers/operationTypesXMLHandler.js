const XMLHandler = require('./XMLHandler')
const OperationType = require('../../models/OperationType')

class OperationTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: OperationType,
      tagName: 'OPERATIONTYPE',
      entityName: 'типов операций',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        name: attrs.NAME,
        shortname: attrs.SHORTNAME,
        desc: attrs.DESC,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactive: attrs.ISACTIVE === 'true' ? 1 : 0
      })
    })
  }
}

function operationTypesXMLHandler(readStream) {
  return new OperationTypesXMLHandler(readStream)
}

module.exports = { operationTypesXMLHandler }