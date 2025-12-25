const XMLHandler = require('./XMLHandler')
const SteadParam = require('../../models/SteadParam')

class SteadsParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: SteadParam,
      tagName: 'PARAM',
      entityName: 'параметров земельных участков',
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

function steadsParamsXMLHandler(readStream) {
  return new SteadsParamsXMLHandler(readStream)
}

module.exports = { steadsParamsXMLHandler }