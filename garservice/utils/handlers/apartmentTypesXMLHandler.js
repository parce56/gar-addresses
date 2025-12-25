const XMLHandler = require('./XMLHandler')
const ApartmentType = require('../../models/ApartmentType')

class ApartmentTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ApartmentType,
      tagName: 'APARTMENTTYPE',
      entityName: 'типов помещений',
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

function apartmentTypesXMLHandler(readStream) {
  return new ApartmentTypesXMLHandler(readStream)
}

module.exports = { apartmentTypesXMLHandler }