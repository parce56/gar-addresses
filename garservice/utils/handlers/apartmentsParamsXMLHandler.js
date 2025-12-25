const XMLHandler = require('./XMLHandler')
const ApartmentParam = require('../../models/ApartmentParam')

class ApartmentsParamsXMLHandler extends XMLHandler {
  constructor(readStream) {
    super(readStream, {
      Model: ApartmentParam,
      tagName: 'PARAM',
      entityName: 'параметров помещений',
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

function apartmentsParamsXMLHandler(readStream) {
  return new ApartmentsParamsXMLHandler(readStream)
}

module.exports = { apartmentsParamsXMLHandler }