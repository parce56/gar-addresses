require('dotenv').config()
const { addHouseTypesXMLHandler } = require('./handlers/addHouseTypesXMLHandler')
const { addrObjDivisionXMLHandler } = require('./handlers/addrObjDivisionXMLHandler')
const { addrObjParamsXMLHandler } = require('./handlers/addrObjParamsXMLHandler')
const { addrObjTypesXMLHandler } = require('./handlers/addrObjTypesXMLHandler')
const { addrObjXMLHandler } = require('./handlers/addrObjXMLHandler')
const { admHierarchyXMLHandler } = require('./handlers/admHierarchyXMLHandler')
const { apartmentsParamsXMLHandler } = require('./handlers/apartmentsParamsXMLHandler')
const { apartmentsXMLHandler } = require('./handlers/apartmentsXMLHandler')
const { apartmentTypesXMLHandler } = require('./handlers/apartmentTypesXMLHandler')
const { carplacesParamsXMLHandler } = require('./handlers/carplacesParamsXMLHandler')
const { carplacesXMLHandler } = require('./handlers/carplacesXMLHandler')
const { changeHistoryXMLHandler } = require('./handlers/changeHistoryXMLHandler')
const { housesParamsXMLHandler } = require('./handlers/housesParamsXMLHandler')
const { housesXMLHandler } = require('./handlers/housesXMLHandler')
const { houseTypesXMLHandler } = require('./handlers/houseTypesXMLHandler')
const { munHierarchyXMLHandler } = require('./handlers/munHierarchyXMLHandler')
const { normativeDocsKindsXMLHandler } = require('./handlers/normativeDocsKindsXMLHandler')
const { normativeDocsTypesXMLHandler } = require('./handlers/normativeDocsTypesXMLHandler')
const { normativeDocsXMLHandler } = require('./handlers/normativeDocsXMLHandler')
const { objectLevelsXMLHandler } = require('./handlers/objectLevelsXMLHandler')
const { operationTypesXMLHandler } = require('./handlers/operationTypesXMLHandler')
const { paramTypesXMLHandler } = require('./handlers/paramTypesXMLHandler')
const { reestrObjectsXMLHandler } = require('./handlers/reestrObjectsXMLHandler')
const { roomsParamsXMLHandler } = require('./handlers/roomsParamsXMLHandler')
const { roomsXMLHandler } = require('./handlers/roomsXMLHandler')
const { roomTypesXMLHandler } = require('./handlers/roomTypesXMLHandler')
const { steadsParamsXMLHandler } = require('./handlers/steadsParamsXMLHandler')
const { steadsXMLHandler } = require('./handlers/steadsXMLHandler')

const minimalHandlers = [
    { prefix: 'AS_ADDHOUSE_TYPES_', handler: addHouseTypesXMLHandler },
    { prefix: 'AS_ADDR_OBJ_DIVISION_', handler: addrObjDivisionXMLHandler },
    { prefix: 'AS_ADDR_OBJ_TYPES_', handler: addrObjTypesXMLHandler },
    { prefix: 'AS_ADDR_OBJ_', handler: addrObjXMLHandler },
    { prefix: 'AS_ADM_HIERARCHY_', handler: admHierarchyXMLHandler },
    { prefix: 'AS_APARTMENTS_', handler: apartmentsXMLHandler},
    { prefix: 'AS_APARTMENT_TYPES_', handler: apartmentTypesXMLHandler},
    { prefix: 'AS_CARPLACES_', handler: carplacesXMLHandler },
    { prefix: 'AS_HOUSES_', handler: housesXMLHandler },
    { prefix: 'AS_HOUSE_TYPES_', handler: houseTypesXMLHandler },
    { prefix: 'AS_MUN_HIERARCHY_', handler: munHierarchyXMLHandler },
    { prefix: 'AS_OBJECT_LEVELS_', handler: objectLevelsXMLHandler },
    { prefix: 'AS_REESTR_OBJECTS_', handler: reestrObjectsXMLHandler },
    { prefix: 'AS_ROOMS_', handler: roomsXMLHandler },
    { prefix: 'AS_ROOM_TYPES_', handler: roomTypesXMLHandler },
    { prefix: 'AS_STEADS_', handler: steadsXMLHandler }
]

const additionalHandlers = [
    { prefix: 'AS_ADDR_OBJ_PARAMS_', handler: addrObjParamsXMLHandler },
    { prefix: 'AS_APARTMENTS_PARAMS_', handler: apartmentsParamsXMLHandler},
    { prefix: 'AS_CARPLACES_PARAMS_', handler: carplacesParamsXMLHandler },
    { prefix: 'AS_CHANGE_HISTORY_', handler: changeHistoryXMLHandler },
    { prefix: 'AS_HOUSES_PARAMS_', handler: housesParamsXMLHandler },
    { prefix: 'AS_NORMATIVE_DOCS_KINDS_', handler: normativeDocsKindsXMLHandler },
    { prefix: 'AS_NORMATIVE_DOCS_TYPES_', handler: normativeDocsTypesXMLHandler },
    { prefix: 'AS_NORMATIVE_DOCS_', handler: normativeDocsXMLHandler },
    { prefix: 'AS_OPERATION_TYPES_', handler: operationTypesXMLHandler },
    { prefix: 'AS_PARAM_TYPES_', handler: paramTypesXMLHandler },
    { prefix: 'AS_ROOMS_PARAMS_', handler: roomsParamsXMLHandler },
    { prefix: 'AS_STEADS_PARAMS_', handler: steadsParamsXMLHandler }
]

function getXMLHandlersConfig() {
  const mode = process.env.DATA_HANDLE_MODE || 'minimal'  
  if (mode.toLowerCase() === 'full') {
    return [...minimalHandlers, ...additionalHandlers]
  }  
  return minimalHandlers
}

module.exports = { getXMLHandlersConfig }