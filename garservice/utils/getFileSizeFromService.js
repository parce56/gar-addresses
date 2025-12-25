const http = require('http')
const https = require('https')

async function getFileSizeFromService(fileURL, options = {}) {
    const {
        timeout = 30000,
        maxRetries = 5, 
        retryDelay = 1000
    } = options

    const url = new URL(fileURL)
    const protocol = url.protocol === 'https:' ? https : http
    let retryCount = 0

    while (retryCount <= maxRetries) {
        try {
            const contentLength = await new Promise((resolve, reject) => {
                const requestOptions = {
                    method: 'HEAD',
                    headers: {}
                }

                const request = protocol.request(fileURL, requestOptions, (response) => {
                    const statusCode = response.statusCode
                    if (statusCode !== 200) {
                        reject(new Error(`HTTP ${statusCode}: ${response.statusMessage}`))
                        return
                    }

                    const length = response.headers['content-length']
                    if (length === undefined) {
                        reject(new Error('Ответ не содержит заголовок Content-Length'))
                        return
                    }

                    resolve(Number(length))
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

            return contentLength

        } catch (error) {
            retryCount++
            console.error(`Попытка HEAD-запроса № ${retryCount} провалилась: ${error.message}`)
            if (retryCount <= maxRetries) {
                console.log(`Следующая попытка через ${retryDelay} миллисекунд...`)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
            } else {
                throw new Error(`Не удалось получить размер файла после ${maxRetries} попыток: ${error.message}`)
            }
        }
    }
}

module.exports = { getFileSizeFromService }