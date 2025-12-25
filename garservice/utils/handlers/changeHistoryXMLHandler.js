const XMLHandler = require('./XMLHandler')
const ChangeHistory = require('../../models/ChangeHistory')

class ChangeHistoryXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ChangeHistory,
      tagName: 'ITEM',
      entityName: 'записей изменений',
      mapAttributes: (attrs) => ({
        changeid: parseInt(attrs.CHANGEID),
        objectid: parseInt(attrs.OBJECTID),
        adrobjectid: attrs.ADROBJECTID,
        opertypeid: parseInt(attrs.OPERTYPEID),
        ndocid: attrs.NDOCID ? parseInt(attrs.NDOCID) : null,
        changedate: attrs.CHANGEDATE
      })
    })
  }
}

function changeHistoryXMLHandler(readStream) {
  return new ChangeHistoryXMLHandler(readStream)
}

module.exports = { changeHistoryXMLHandler }