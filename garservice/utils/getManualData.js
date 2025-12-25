require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { getDatesFolders } = require('./getDatesFolders')
const { findFoldersWithDeltaZipFiles } = require('./findFoldersWithDeltaZipFiles')
const { findLatestFolderWithFullZipFile } = require('./findLatestFolderWithFullZipFile')
const ZipFile = require('../models/ZipFile')

function getDateDottedDDMMYYYY(YYYYMMDD) {
    const year = YYYYMMDD.substring(0, 4)
    const month = YYYYMMDD.substring(4, 6)
    const day = YYYYMMDD.substring(6, 8)
    return `${day}.${month}.${year}`
}

function getDateDottedYYYYMMDD(YYYYMMDD) {
    const year = YYYYMMDD.substring(0, 4)
    const month = YYYYMMDD.substring(4, 6)
    const day = YYYYMMDD.substring(6, 8)
    return `${year}.${month}.${day}`
}

async function getManualData() {
    console.log('Получаем данные локально.')

    const DATA_SOURCE_PATH = process.env.DATA_SOURCE_PATH || './data'
    if (!fs.existsSync(DATA_SOURCE_PATH)) {
        fs.mkdirSync(DATA_SOURCE_PATH, { recursive: true })
    }

    const folders = await getDatesFolders(DATA_SOURCE_PATH)
    const pathFolderWithFull = await findLatestFolderWithFullZipFile(folders)
    const pathsFoldersWithDelta = await findFoldersWithDeltaZipFiles(folders)

    if (folders.length === 0) {
        return
    }

    const zipFile = new ZipFile()

    const countZipFiles = await zipFile.getCount()
    if (countZipFiles === 0) {        
        if (pathFolderWithFull) {
            try {
                const absolutePathToFile = path.resolve(pathFolderWithFull, 'gar_xml.zip')
                const statsFile = fs.statSync(absolutePathToFile)
                const fileSize = statsFile.size
                const folderName = path.basename(pathFolderWithFull)
                const zipFileInfo = {
                    VersionId: folderName,
                    TextVersion: `БД ФИАС от ${getDateDottedDDMMYYYY(folderName)}`,
                    GarXMLFullURL: `https://fias-file.nalog.ru/downloads/${getDateDottedYYYYMMDD(folderName)}/gar_xml.zip`,
                    GarXMLDeltaURL: `https://fias-file.nalog.ru/downloads/${getDateDottedYYYYMMDD(folderName)}/gar_delta_xml.zip`,
                    Date: getDateDottedDDMMYYYY(folderName)
                }
                const zipFileDB = await zipFile.insertFromService(zipFileInfo)
                const id = parseInt(zipFileDB.versionid)
                await zipFile.updateParameters(id, {
                    'directorypath': pathFolderWithFull,
                    'filename': 'gar_xml.zip',
                    'isdownloaded': true,
                    'sizebytes': fileSize,
                    'isfull': true
                })
            } catch (error) {
                console.error(error)
            }
        }
    } else {
        const zipFilesIds = await zipFile.getAllIds()
        const minZipFileId = Math.min(...zipFilesIds)
        for (const pathFolderWithDelta of pathsFoldersWithDelta) {
            const folderName = path.basename(pathFolderWithDelta)
            const id = parseInt(folderName)
            if (id <= minZipFileId) {
                continue
            }
            try {
                const absolutePathToFile = path.resolve(pathFolderWithDelta, 'gar_delta_xml.zip')
                const statsFile = fs.statSync(absolutePathToFile)
                const fileSize = statsFile.size
                if (zipFilesIds.includes(id)) {
                    const zipFileDB = await zipFile.getZipFileById(id)
                    if (Number(zipFileDB.sizebytes) !== fileSize && Number.isInteger(fileSize) && fileSize > 0) {
                        await zipFile.updateParameters(id, {
                            'sizebytes': fileSize
                        })
                        await zipFile.resetHandledFlag(id)
                    }
                } else {
                    const zipFileInfo = {
                        VersionId: folderName,
                        TextVersion: `БД ФИАС от ${getDateDottedDDMMYYYY(folderName)}`,
                        GarXMLFullURL: `https://fias-file.nalog.ru/downloads/${getDateDottedYYYYMMDD(folderName)}/gar_xml.zip`,
                        GarXMLDeltaURL: `https://fias-file.nalog.ru/downloads/${getDateDottedYYYYMMDD(folderName)}/gar_delta_xml.zip`,
                        Date: getDateDottedDDMMYYYY(folderName)
                    }
                    await zipFile.insertFromService(zipFileInfo)
                    await zipFile.updateParameters(id, {
                        'directorypath': pathFolderWithDelta,
                        'filename': 'gar_delta_xml.zip',
                        'isdownloaded': true,
                        'sizebytes': fileSize,
                        'isfull': false
                    })
                    await zipFile.resetHandledFlag(id)
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

}

module.exports = { getManualData }