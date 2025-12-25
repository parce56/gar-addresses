const XMLHandler = require('./XMLHandler')
const AddrObjDivision = require('../../models/AddrObjDivision')

class AddrObjDivisionXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AddrObjDivision,
      tagName: 'ITEM',
      entityName: 'переподчинений адресных объектов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        parentid: parseInt(attrs.PARENTID),
        childid: parseInt(attrs.CHILDID),
        changeid: parseInt(attrs.CHANGEID)
      })
    })
  }
}

function addrObjDivisionXMLHandler(readStream) {
  return new AddrObjDivisionXMLHandler(readStream)
}

module.exports = { addrObjDivisionXMLHandler }