require('dotenv').config()
const { downloadFileWithResume } = require('./downloader')
const { getAllDownloadFileInfo } = require('./getAllDownloadFileInfo')
const { getFileSizeFromService } = require('./getFileSizeFromService')
const fs = require('fs')
const path = require('path')
const ZipFile = require('../models/ZipFile')

async function getServiceData() {
    console.log('Получаем данные из службы получения обновлений.')

    const DATA_SOURCE_PATH = process.env.DATA_SOURCE_PATH || './data'
    if (!fs.existsSync(DATA_SOURCE_PATH)) {
        fs.mkdirSync(DATA_SOURCE_PATH, { recursive: true })
    }

    let allFilesInfo = []
    allFilesInfo = await getAllDownloadFileInfo()
    if (allFilesInfo.length === 0) {
        console.log('Из службы получения обновлений получены пустые данные. Данные в БД не созданы/обновлены.')
        return
    }

    const zipFile = new ZipFile()

    const countZipFiles = await zipFile.getCount()
    if (countZipFiles === 0) {
        const lastZipFileInfo = allFilesInfo.reduce((max, current) => {
            if (!current.GarXMLFullURL) {
                return max
            }        
            if (!max || current.versionid > max.versionid) {
                return current
            }        
            return max
        }, null)
        try {
            await zipFile.insertFromService(lastZipFileInfo)
            await zipFile.updateParameters(id, {
                'isfull': true
            })
        } catch (error) {
            console.error(error)
            return
        }
    } else {
        const zipFilesIds = await zipFile.getAllIds()
        const minZipFileId = Math.min(...zipFilesIds)
        allFilesInfo = allFilesInfo.filter(fileInfo => fileInfo.VersionId > minZipFileId)
        for (const fileInfo of allFilesInfo) {
            try {
                const id = fileInfo.VersionId
                if (zipFilesIds.includes(id)) {
                    const zipFileDB = await zipFile.getZipFileById(id)
                    if (fileInfo.GarXMLDeltaURL !== zipFileDB.garxmldeltaurl && !zipFileDB.garxmldeltaurl) {
                        await zipFile.updateParameters(id, {
                            'garxmldeltaurl': fileInfo.GarXMLDeltaURL
                        })
                    }
                    if (fileInfo.GarXMLDeltaURL) {
                        const deltaFileBytes = await getFileSizeFromService(fileInfo.GarXMLDeltaURL)
                        if (Number(zipFileDB.sizebytes) !== deltaFileBytes && Number.isInteger(deltaFileBytes) && deltaFileBytes > 0) {
                            await zipFile.updateParameters(id, {
                                'sizebytes': deltaFileBytes,
                                'isdownloaded': false
                            })
                        }
                    }
                } else {
                    await zipFile.insertFromService(fileInfo)
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

    let zipFilesNeededToDownload = await zipFile.getNeededToDownload()
    zipFilesNeededToDownload = zipFilesNeededToDownload.sort((a, b) => {
        return Number(a.versionid) - Number(b.versionid)
    })

    for (const zip of zipFilesNeededToDownload) {
        try {
            let url = ''
            if (zip.isfull === true) {
                url = new URL(zip.garxmlfullurl)
            } else {
                if (zip.garxmldeltaurl) {
                    url = new URL(zip.garxmldeltaurl)
                } else {
                    continue
                }
            }
            const id = parseInt(zip.versionid)
            const fileName = path.basename(url.pathname)
            const folderName = zip.versionid
            const directoryPath = path.resolve(DATA_SOURCE_PATH, folderName)
            await zipFile.updateParameters(id, {
                'directorypath': directoryPath,
                'filename': fileName
            })
            const resultDownloadFile = await downloadFileWithResume(directoryPath, url)
            if (resultDownloadFile.completed === true) {
                await zipFile.updateParameters(id, {
                    'sizebytes': resultDownloadFile.size,
                    'isdownloaded': true
                })
                await zipFile.resetHandledFlag(id)
            }
        } catch (error) {
            console.error(error)
        }
    }

}

module.exports = { getServiceData }



