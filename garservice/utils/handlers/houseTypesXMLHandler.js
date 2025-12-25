const XMLHandler = require('./XMLHandler')
const HouseType = require('../../models/HouseType')

class HouseTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: HouseType,
      tagName: 'HOUSETYPE',
      entityName: 'типов домов',
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

function houseTypesXMLHandler(readStream) {
  return new HouseTypesXMLHandler(readStream)
}

module.exports = { houseTypesXMLHandler }