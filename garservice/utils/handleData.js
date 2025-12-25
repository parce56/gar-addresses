const path = require('path')
const ZipFile = require('../models/ZipFile')
const { zipReader } = require('./zipReader')

async function handleData() {

    try {
        const zipFile = new ZipFile()
        const notHandledZipFiles = await zipFile.getNotHandledZipFiles()

        if (notHandledZipFiles.length === 0) {
            return false
        }

        console.log(`Из базы данных полученая информация о ${notHandledZipFiles.length} необработанных zip-файлах.`)
        console.log(`Начало обработки zip-файлов.`)

        let countHandledFiles = 0

        for (const notHandledZipFile of notHandledZipFiles) {
            const id = parseInt(notHandledZipFile.versionid)
            const absolutePathToFile = path.resolve(notHandledZipFile.directorypath, notHandledZipFile.filename)
            console.log(absolutePathToFile)            
            const result = await zipReader(absolutePathToFile)
            if (!result) {
                return false
            }
            await zipFile.updateParameters(id, {
                'ishandled': true
            })
            countHandledFiles++
        }

        console.log(`Успешно завершена обработка ${countHandledFiles} zip-файлов.`)

        if (countHandledFiles > 0) {
            return true
        }
        
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = { handleData }