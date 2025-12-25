const XMLHandler = require('./XMLHandler')
const AdmHierarchy = require('../../models/AdmHierarchy')

class AdmHierarchyXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: AdmHierarchy,
      tagName: 'ITEM',
      entityName: 'объектов административной иерархии',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        parentobjid: attrs.PARENTOBJID && !isNaN(parseInt(attrs.PARENTOBJID)) ? parseInt(attrs.PARENTOBJID) : null,
        changeid: parseInt(attrs.CHANGEID),
        regioncode: attrs.REGIONCODE,
        areacode: attrs.AREACODE,
        citycode: attrs.CITYCODE,
        placecode: attrs.PLACECODE,
        plancode: attrs.PLANCODE,
        streetcode: attrs.STREETCODE,
        previd: attrs.PREVID && !isNaN(parseInt(attrs.PREVID)) ? parseInt(attrs.PREVID) : null,
        nextid: attrs.NEXTID && !isNaN(parseInt(attrs.NEXTID)) ? parseInt(attrs.NEXTID) : null,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactive: parseInt(attrs.ISACTIVE),
        path: attrs.PATH
      })
    })
  }
}

function admHierarchyXMLHandler(readStream) {
  return new AdmHierarchyXMLHandler(readStream)
}

module.exports = { admHierarchyXMLHandler }