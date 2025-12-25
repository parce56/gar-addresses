const XMLHandler = require('./XMLHandler')
const Stead = require('../../models/Stead')

class SteadsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: Stead,
      tagName: 'STEAD',
      entityName: 'объектов земельных участков',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        number: attrs.NUMBER ? attrs.NUMBER : `без номера`,
        opertypeid: attrs.OPERTYPEID ? parseInt(attrs.OPERTYPEID) : null,
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

function steadsXMLHandler(readStream) {
  return new SteadsXMLHandler(readStream)
}

module.exports = { steadsXMLHandler }