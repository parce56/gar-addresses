const yauzl = require('yauzl')
const sax = require('sax')
const { getXMLHandlersConfig } = require('./XMLHandlersConfig')
const XMLFileHandlers = getXMLHandlersConfig()

const zipReader = function (path) {
  return new Promise((resolve, reject) => {
    yauzl.open(path, { lazyEntries: true }, function (error, zipFile) {
      if (error) {
        console.error(`Ошибка открытия ZIP файла ${path}:`, error)
        return resolve(false)
      }

      let processing = 0
      let finished = false
      let hasErrors = false

      zipFile.on('error', function(error) {
          console.error(`Ошибка чтения ZIP ${path}:`, error)
          resolve(false)
      })

      const processEntry = async function (entry) {
        if (!entry) {
          return
        }
        try {
          const filename = entry.fileName.toString()
          const regionsToProcess = process.env.REGIONS ? process.env.REGIONS.split(',') : []
          let needProcessFile = false
          
          if (regionsToProcess.length === 0) {
            needProcessFile = true
          } else {
            for (const region of regionsToProcess) {
              const isInRoot = !filename.includes('/')
              const isInFolder = filename.startsWith(`${region}/`) || filename.startsWith(`${region}\\`)
              if (isInRoot || isInFolder) {
                needProcessFile = true
                break
              }
            }
          }
          
          if (needProcessFile && /\.xml$/i.test(filename)) {
            console.log(`Найден файл: ${filename}`)
            const handler = getHandlerForXMLFile(filename)
            if (handler) {
              await new Promise((resolveLoad, rejectLoad) => {
                zipFile.openReadStream(entry, function (readError, readStream) {
                  if (readError) {
                    console.error(`Ошибка открытия потока для ${filename}:`, readError)
                    hasErrors = true
                    return resolveLoad()
                  }
                  const saxParser = sax.createStream(true, {})

                  const handlerInstance = handler(readStream)

                  saxParser.on('opentag', function (node) { 
                    handlerInstance.onOpenTag(node, filename)
                  })

                  saxParser.on('end', async function () {
                    try {
                      await handlerInstance.finalize(filename)
                      console.log(`Обработка XML-файла завершена: ${filename}`)
                      resolveLoad()
                    } catch (error) {
                      console.error(`Ошибка финализации обработки ${filename}:`, error)
                      hasErrors = true
                      resolveLoad()
                    }
                  })

                  saxParser.on('error', function (parseError) {
                    console.error(`Ошибка при парсинге XML: ${filename}`, parseError)
                    hasErrors = true
                    resolveLoad()
                  })

                  readStream.pipe(saxParser)
                })
              })
            }
          } else {
            console.log(`Обработка файла ${filename} пропущена.`)
          }
        } catch (error) {
          console.error(`Общая ошибка обработки ${entry.fileName}:`, error)
          hasErrors = true
        } finally {
          zipFile.readEntry()
        }
      }

      function next() {
        processing--
        if (finished && processing === 0) {
          console.log(`Обработка ZIP-архива ${path} завершена.`)
          zipFile.close()
          resolve(!hasErrors)
        }
      }

      zipFile.on('entry', function (entry) {
        processing++        
        processEntry(entry).then(() => {
          next()
        }).catch((error) => {
          console.error('Ошибка в processEntry:', error)
          hasErrors = true
          next()
        })
      })

      zipFile.on('end', function() {
        finished = true
        if (processing === 0) {
          console.log(`Обработка ZIP-архива ${path} завершена.`)
          zipFile.close()
          resolve(!hasErrors)
        }
      })

      zipFile.readEntry()
    })
  })
}

function getHandlerForXMLFile(filename) {
  const baseName = filename.split('/').pop().split('\\').pop().toUpperCase()
  for (const {prefix, handler} of XMLFileHandlers) {
    if (baseName.startsWith(prefix)) {
      const rest = baseName.slice(prefix.length)
      if (/^\d/.test(rest)) {
        return handler
      }
    }
  }
  return null
}

module.exports = { zipReader }