const XMLHandler = require('./XMLHandler')
const Room = require('../../models/Room')

class RoomsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: Room,
      tagName: 'ROOM',
      entityName: 'объектов комнат',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        number: attrs.NUMBER,
        roomtype: attrs.ROOMTYPE ? parseInt(attrs.ROOMTYPE) : null,
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

function roomsXMLHandler(readStream) {
  return new RoomsXMLHandler(readStream)
}

module.exports = { roomsXMLHandler }