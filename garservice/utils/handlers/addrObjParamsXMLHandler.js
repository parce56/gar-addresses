const XMLHandler = require('./XMLHandler')
const AddrObjParam = require('../../models/AddrObjParam')

class AddrObjParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AddrObjParam,
      tagName: 'PARAM',
      entityName: 'параметров адресных объектов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        changeid: parseInt(attrs.CHANGEID),
        changeidend: parseInt(attrs.CHANGEIDEND),
        typeid: parseInt(attrs.TYPEID),
        value: attrs.VALUE,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE
      })
    })
  }
}

function addrObjParamsXMLHandler(readStream) {
  return new AddrObjParamsXMLHandler(readStream)
}

module.exports = { addrObjParamsXMLHandler }