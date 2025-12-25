const XMLHandler = require('./XMLHandler')
const CarplaceParam = require('../../models/CarplaceParam')

class CarplacesParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: CarplaceParam,
      tagName: 'PARAM',
      entityName: 'параметров машиномест',
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

function carplacesParamsXMLHandler(readStream) {
  return new CarplacesParamsXMLHandler(readStream)
}

module.exports = { carplacesParamsXMLHandler }