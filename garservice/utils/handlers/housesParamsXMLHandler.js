const XMLHandler = require('./XMLHandler')
const HouseParam = require('../../models/HouseParam')

class HousesParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: HouseParam,
      tagName: 'PARAM',
      entityName: 'параметров домов',
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

function housesParamsXMLHandler(readStream) {
  return new HousesParamsXMLHandler(readStream)
}

module.exports = { housesParamsXMLHandler }