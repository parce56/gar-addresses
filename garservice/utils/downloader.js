const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { getFileSizeFromService } = require('./getFileSizeFromService')

async function downloadFileWithResume(directoryPath, fileURL, options = {}) {
    const {
        timeout = 60000 * 5,
        maxRetries = 5, 
        retryDelay = 1000
    } = options

    const url = new URL(fileURL)
    const protocol = url.protocol === 'https:' ? https : http
    const fileName = path.basename(url.pathname) || 'gar_xml.zip'
    const filePath = path.join(directoryPath, fileName)

    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true })
    }

    let downloadedBytes = 0
    let fileSize = 0
    let retryCount = 0

    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        downloadedBytes = stats.size
        console.log(`Найден существующий файл: ${filePath} (Размер: ${downloadedBytes} байт).`)
        try {
            const serverFileSize = await getFileSizeFromService(fileURL)
            if (serverFileSize > 0) {
                if (downloadedBytes === serverFileSize) {
                    console.log('Файл уже полностью скачан.')
                    return {
                        filePath,
                        size: downloadedBytes,
                        completed: true
                    }
                } else if (downloadedBytes > serverFileSize) {
                    console.log('Существуюший файл на диске больше, чем на сервере. Удаляем и качаем по новой.')
                    fs.unlinkSync(filePath)
                    downloadedBytes = 0
                }
            }
        } catch (error) {
            console.log('Не удалось получить размер файла: ', error)
        }
    }

    while (retryCount < maxRetries) {
        try {
            await new Promise((resolve, reject) => {
                const requestOptions = {
                    method: 'GET',
                    headers: {}
                }

                if (downloadedBytes > 0) {
                    requestOptions.headers['Range'] = `bytes=${downloadedBytes}-`
                }

                const request = protocol.request(fileURL, requestOptions, (response) => {
                    console.log(`Начало скачивания файла: ${filePath}`)
                    const acceptRanges = response.headers['accept-ranges'] === 'bytes'
                    const contentRange = response.headers['content-range']

                    if (contentRange) {
                        const totalSize = parseInt(contentRange.split('/')[1])
                        fileSize = totalSize
                    } else if (response.headers['content-length']) {
                        fileSize = parseInt(response.headers['content-length']) + downloadedBytes
                    }

                    if (downloadedBytes > 0 && !acceptRanges && response.statusCode !== 206) {
                        console.log('Сервер не поддерживает возобновление скачивания файла. Начинаем скачивать с начала.')
                        downloadedBytes = 0
                        response.destroy()
                        try {
                            fs.unlinkSync(filePath)
                        } catch (error) {
                            console.error(error)
                        }
                        reject(new Error('Возобновление скачивания файла не поддерживается.'))
                        return
                    }

                    const statusCode = response.statusCode
                    if (statusCode !== 200 && statusCode !== 206) {
                        reject(new Error(`HTTP ${statusCode}: ${response.statusMessage}`))
                        return
                    }

                    const writeMode = downloadedBytes > 0 ? 'a' : 'w'
                    const fileStream = fs.createWriteStream(filePath, {
                        flags: writeMode
                    })

                    response.on('data', (chunk) => {
                        downloadedBytes += chunk.length
                    })

                    response.on('error', (error) => {
                        fileStream.destroy()
                        reject(error)
                    })

                    fileStream.on('error', (error) => {
                        response.destroy()
                        reject(error)
                    })

                    fileStream.on('finish', () => {
                        console.log(`Скачивание файла завершено: ${filePath}`)
                        resolve()
                    })

                    response.pipe(fileStream)
                    
                })

                request.setTimeout(timeout, () => {
                    request.destroy()
                    reject(new Error('Время ожидания запроса истекло.'))
                })

                request.on('error', (error) => {
                    reject(error)
                })

                request.end()
            })

            break

        } catch (error) {
            retryCount++
            console.error(`Попытка скачивания № ${retryCount} провалилась: `, error.message)

            if (retryCount < maxRetries) {
                console.log(`Следующая попытка через ${retryDelay} миллисекунд...`)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
            } else {
                throw new Error(`Скачивание файла провалилось после ${maxRetries} попыток: ${error.message}`)
            }

        }
    }

    return {
        filePath,
        size: downloadedBytes,
        completed: (fileSize === 0 && downloadedBytes > 0) || downloadedBytes === fileSize
    }    

}

module.exports = { downloadFileWithResume }