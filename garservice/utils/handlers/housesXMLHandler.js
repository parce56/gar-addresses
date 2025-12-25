const XMLHandler = require('./XMLHandler')
const House = require('../../models/House')

class HousesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: House,
      tagName: 'HOUSE',
      entityName: 'объектов домов',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        housenum: attrs.HOUSENUM,
        addnum1: attrs.ADDNUM1,
        addnum2: attrs.ADDNUM2,
        housetype: attrs.HOUSETYPE ? parseInt(attrs.HOUSETYPE) : null,
        addtype1: attrs.ADDTYPE1 ? parseInt(attrs.ADDTYPE1) : null,
        addtype2: attrs.ADDTYPE2 ? parseInt(attrs.ADDTYPE2) : null,
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

function housesXMLHandler(readStream) {
  return new HousesXMLHandler(readStream)
}

module.exports = { housesXMLHandler }