const http = require('http')
const https = require('https')

async function getAllDownloadFileInfo(options = {}) {
    const {
        timeout = 30000,
        maxRetries = 5, 
        retryDelay = 1000,
        maxRedirects = 5
    } = options

    const url = new URL('http://fias.nalog.ru/WebServices/Public/GetAllDownloadFileInfo')
    let retryCount = 0

    while (retryCount < maxRetries) {
        try {
            const result = await new Promise((resolve, reject) => {
                let redirectCount = 0
                
                const doRequest = (currentUrl) => {
                    const currentProtocol = currentUrl.protocol === 'https:' ? https : http
                    
                    const requestOptions = {
                        method: 'GET',
                        headers: {}
                    }

                    const request = currentProtocol.request(currentUrl, requestOptions, (response) => {
                        const statusCode = response.statusCode
                        
                        if (statusCode === 302 || statusCode === 301) {
                            if (redirectCount >= maxRedirects) {
                                reject(new Error(`Превышено максимальное количество редиректов: ${maxRedirects}`))
                                return
                            }
                            
                            const location = response.headers.location
                            if (!location) {
                                reject(new Error(`Получен код ${statusCode} но заголовок Location отсутствует`))
                                return
                            }
                            
                            let redirectUrl
                            try {
                                redirectUrl = new URL(location, currentUrl)
                            } catch (error) {
                                reject(new Error(`Некорректный URL редиректа: ${location}`))
                                return
                            }
                            
                            redirectCount++
                            console.log(`Редирект № ${redirectCount}: ${currentUrl.href} => ${redirectUrl.href}`)
                            
                            doRequest(redirectUrl)
                            return
                        }
                        
                        if (statusCode !== 200) {
                            reject(new Error(`HTTP ${statusCode}: ${response.statusMessage}`))
                            return
                        }

                        let data = ''

                        response.on('data', (chunk) => {
                            data += chunk
                        })

                        response.on('end', () => {
                            try {
                                const jsonData = JSON.parse(data)
                                resolve(jsonData)
                            } catch (error) {
                                reject(new Error(`Ошибка парсинга JSON: ${error.message}`))
                            }
                        })
                    })

                    request.setTimeout(timeout, () => {
                        request.destroy()
                        reject(new Error('Время ожидания запроса истекло.'))
                    })

                    request.on('error', (error) => {
                        reject(error)
                    })

                    request.end()
                }

                doRequest(url)
            })
            
            return result
            
        } catch (error) {
            retryCount++
            console.error(`Попытка выполнения запроса GET ${url} № ${retryCount} провалилась: `, error.message)

            if (retryCount < maxRetries) {
                console.log(`Следующая попытка выполнения запроса GET ${url} через ${retryDelay} миллисекунд...`)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
            } else {
                throw new Error(`Выполнение запроса GET ${url} провалилось после ${maxRetries} попыток: ${error.message}`)
            }
        }
    }
}

module.exports = { getAllDownloadFileInfo }