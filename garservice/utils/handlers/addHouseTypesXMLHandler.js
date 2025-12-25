const XMLHandler = require('./XMLHandler')
const AddHouseType = require('../../models/AddHouseType')

class AddHouseTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AddHouseType,
      tagName: 'HOUSETYPE',
      entityName: 'дополнительных типов домов',
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

function addHouseTypesXMLHandler(readStream) {
  return new AddHouseTypesXMLHandler(readStream)
}

module.exports = { addHouseTypesXMLHandler }