const XMLHandler = require('./XMLHandler')
const AddrObj = require('../../models/AddrObj')

class AddrObjXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AddrObj,
      tagName: 'OBJECT',
      entityName: 'адресных объектов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        name: attrs.NAME,
        typename: attrs.TYPENAME,
        level: attrs.LEVEL,
        opertypeid: parseInt(attrs.OPERTYPEID),
        previd: attrs.PREVID ? parseInt(attrs.PREVID) : null,
        nextid: attrs.NEXTID ? parseInt(attrs.NEXTID) : null,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactual: parseInt(attrs.ISACTUAL),
        isactive: parseInt(attrs.ISACTIVE)
      })
    })
  }
}

function addrObjXMLHandler(readStream) {
  return new AddrObjXMLHandler(readStream)
}

module.exports = { addrObjXMLHandler }