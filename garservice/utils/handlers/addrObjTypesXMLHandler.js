const XMLHandler = require('./XMLHandler')
const AddrObjType = require('../../models/AddrObjType')

class AddrObjTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AddrObjType,
      tagName: 'ADDRESSOBJECTTYPE',
      entityName: 'типов адресных объектов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        level: attrs.LEVEL,
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

function addrObjTypesXMLHandler(readStream) {
  return new AddrObjTypesXMLHandler(readStream)
}

module.exports = { addrObjTypesXMLHandler }