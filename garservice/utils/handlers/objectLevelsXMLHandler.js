const XMLHandler = require('./XMLHandler')
const ObjectLevel = require('../../models/ObjectLevel')

class ObjectLevelsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ObjectLevel,
      tagName: 'OBJECTLEVEL',
      entityName: 'уровней объектов',
      mapAttributes: (attrs) => ({
        level: parseInt(attrs.LEVEL),
        name: attrs.NAME,
        shortname: attrs.SHORTNAME,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactive: attrs.ISACTIVE === 'true' ? 1 : 0
      })
    })
  }
}

function objectLevelsXMLHandler(readStream) {
  return new ObjectLevelsXMLHandler(readStream)
}

module.exports = { objectLevelsXMLHandler }