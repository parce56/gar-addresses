const XMLHandler = require('./XMLHandler')
const Carplace = require('../../models/Carplace')

class CarplacesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: Carplace,
      tagName: 'CARPLACE',
      entityName: 'объектов машиномест',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        number: attrs.NUMBER,
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

function carplacesXMLHandler(readStream) {
  return new CarplacesXMLHandler(readStream)
}

module.exports = { carplacesXMLHandler }