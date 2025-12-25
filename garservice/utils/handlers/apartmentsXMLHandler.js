const XMLHandler = require('./XMLHandler')
const Apartment = require('../../models/Apartment')

class ApartmentsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: Apartment,
      tagName: 'APARTMENT',
      entityName: 'объектов помещений',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        number: attrs.NUMBER,
        aparttype: attrs.APARTTYPE ? parseInt(attrs.APARTTYPE) : null,
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

function apartmentsXMLHandler(readStream) {
  return new ApartmentsXMLHandler(readStream)
}

module.exports = { apartmentsXMLHandler }