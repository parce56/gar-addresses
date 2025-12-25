const XMLHandler = require('./XMLHandler')
const RoomType = require('../../models/RoomType')

class RoomTypesXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: RoomType,
      tagName: 'ROOMTYPE',
      entityName: 'типов комнат',
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

function roomTypesXMLHandler(readStream) {
  return new RoomTypesXMLHandler(readStream)
}

module.exports = { roomTypesXMLHandler }