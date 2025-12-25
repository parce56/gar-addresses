const fs = require('fs')
const path = require('path')
const yauzl = require('yauzl')

function parseVersionDate(line) {
    const match = line.match(/^(\d{4})\.(\d{2})\.(\d{2})/)
    if (match) {
        const [, year, month, day] = match
        return parseInt(`${year}${month}${day}`, 10)
    }
    return null
}

function validateZipDate(zipPath, expectedDate) {
    return new Promise((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (error, zipfile) => {
            if (error) return reject(error)
            let found = false
            zipfile.readEntry()
            zipfile.on('entry', (entry) => {
                if (entry.fileName === 'version.txt') {
                    found = true
                    zipfile.openReadStream(entry, (error, readStream) => {
                        if (error) {
                            zipfile.close()
                            reject(error)
                        }
                        let data = ''
                        readStream.on('data', (chunk) => {
                            data += chunk.toString('utf8')
                        })
                        readStream.on('end', () => {                            
                            const firstLine = data.split(/\r?\n/)[0] || ''
                            const versionDate = parseVersionDate(firstLine)
                            zipfile.close()
                            resolve(versionDate === expectedDate)
                        })
                    })
                } else {
                    zipfile.readEntry()
                }
            })
            zipfile.on('end', () => {
                if (!found) {
                    zipfile.close()
                    reject()
                }
            })
        })
    })
}

async function findFoldersWithDeltaZipFiles(folders) {
    let result = []

    for (const folder of folders) {
        try {
            const folderName = path.basename(folder)
            const date = parseInt(folderName.match(/\d{8}$/)[0])

            const zipFilePath = path.join(folder, 'gar_delta_xml.zip')

            if (!fs.existsSync(zipFilePath)) continue

            const isValid = await validateZipDate(zipFilePath, date)
            if (isValid) {
                result.push(folder)
            }
        } catch (error) {
            console.error(error)
        }
    }
    return result
}

module.exports = { findFoldersWithDeltaZipFiles }