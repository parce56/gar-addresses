const XMLHandler = require('./XMLHandler')
const MunHierarchy = require('../../models/MunHierarchy')

class MunHierarchyXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: MunHierarchy,
      tagName: 'ITEM',
      entityName: 'объектов муниципальной иерархии',
      mapAttributes: (attrs) => ({
        id: parseInt(attrs.ID),
        objectid: parseInt(attrs.OBJECTID),
        parentobjid: attrs.PARENTOBJID && !isNaN(parseInt(attrs.PARENTOBJID)) ? parseInt(attrs.PARENTOBJID) : null,
        changeid: parseInt(attrs.CHANGEID),
        oktmo: attrs.OKTMO ? attrs.OKTMO : '00000000000',
        previd: attrs.PREVID ? parseInt(attrs.PREVID) : null,
        nextid: attrs.NEXTID ? parseInt(attrs.NEXTID) : null,
        updatedate: attrs.UPDATEDATE,
        startdate: attrs.STARTDATE,
        enddate: attrs.ENDDATE,
        isactive: parseInt(attrs.ISACTIVE),
        path: attrs.PATH
      })
    })
  }
}

function munHierarchyXMLHandler(readStream) {
  return new MunHierarchyXMLHandler(readStream)
}

module.exports = { munHierarchyXMLHandler }