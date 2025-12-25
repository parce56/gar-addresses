const XMLHandler = require('./XMLHandler')
const ReestrObject = require('../../models/ReestrObject')

class ReestrObjectsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ReestrObject,
      tagName: 'OBJECT',
      entityName: 'объектов реестра',
      mapAttributes: (attrs) => ({
        objectid: parseInt(attrs.OBJECTID),
        objectguid: attrs.OBJECTGUID,
        changeid: parseInt(attrs.CHANGEID),
        isactive: parseInt(attrs.ISACTIVE),
        levelid: parseInt(attrs.LEVELID),
        createdate: attrs.CREATEDATE,
        updatedate: attrs.UPDATEDATE
      })
    })
  }
}

function reestrObjectsXMLHandler(readStream) {
  return new ReestrObjectsXMLHandler(readStream)
}

module.exports = { reestrObjectsXMLHandler }