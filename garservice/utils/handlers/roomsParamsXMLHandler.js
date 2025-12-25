const XMLHandler = require('./XMLHandler')
const RoomParam = require('../../models/RoomParam')

class RoomsParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: RoomParam,
      tagName: 'PARAM',
      entityName: 'параметров комнат',
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

function roomsParamsXMLHandler(readStream) {
  return new RoomsParamsXMLHandler(readStream)
}

module.exports = { roomsParamsXMLHandler }