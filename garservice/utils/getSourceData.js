require('dotenv').config()
const { getManualData } = require('./getManualData')
const { getServiceData } = require('./getServiceData')

async function getSourceData() {

    const DATA_LOAD_MODE = process.env.DATA_LOAD_MODE === 'manual' ? 'manual' : 'service'
    if (DATA_LOAD_MODE === 'manual') {
        await getManualData()
    } else {
        await getServiceData()
    }

}

module.exports = { getSourceData }