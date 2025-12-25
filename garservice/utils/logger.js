const fs = require('fs')
const path = require('path')
require('dotenv').config()

const LOGS_PATH = process.env.LOGS_PATH || './logs'
const MAX_SIZE_LOG_FILE = parseFloat(process.env.MAX_SIZE_LOG_FILE) || 2
const MAX_FILE_SIZE = Math.floor(MAX_SIZE_LOG_FILE * 1024 * 1024)

let currentLogFile = null
let currentLogStream = null
let currentFilename = ''
let isInitialized = false
let isRotating = false

function getCurrentDateTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}.${milliseconds}`
}

function findLatestIncompleteLogFile() {
    try {
        if (!fs.existsSync(LOGS_PATH)) {
            return null
        }
        const files = fs.readdirSync(LOGS_PATH)
        const logFiles = files.filter(file => file.endsWith('.txt'))        
        if (logFiles.length === 0) {
            return null
        }
        logFiles.sort((a, b) => {
            const statA = fs.statSync(path.join(LOGS_PATH, a))
            const statB = fs.statSync(path.join(LOGS_PATH, b))
            return statB.mtime.getTime() - statA.mtime.getTime()
        })
        for (const file of logFiles) {
            const filenameMatch = file.match(/^(\d{4}-\d{2}-\d{2}_\d{6}\.\d{3})-\.txt$/)
            if (filenameMatch) {
                const filePath = path.join(LOGS_PATH, file)
                const stats = fs.statSync(filePath)                
                if (stats.size < MAX_FILE_SIZE) {
                    return {
                        filename: file,
                        filePath: filePath,
                        size: stats.size
                    }
                }
            }
        }
        return null
    } catch (error) {
        console.error('Ошибка при поиске не завершенного лог-файла: ', error)
        return null
    }
}

function createNewLogFile() {
    if (currentLogStream) {
        currentLogStream.end()
        currentLogStream = null
    }
    const incompleteLog = findLatestIncompleteLogFile()
    if (incompleteLog) {
        currentFilename = incompleteLog.filename
        currentLogFile = incompleteLog.filePath
        currentLogStream = fs.createWriteStream(currentLogFile, { flags: 'a' })
        console.log(`Продолжаем запись в существующий лог-файл: ${currentFilename}`)
    } else {
        const startTime = getCurrentDateTime().replace(/:/g, '')
        currentFilename = `${startTime}-.txt`
        currentLogFile = path.join(LOGS_PATH, currentFilename)
        currentLogStream = fs.createWriteStream(currentLogFile, { flags: 'a' })
        console.log(`Создан новый лог-файл: ${currentFilename}`)
    }
    return currentLogStream
}

function rotateLogIfNeeded() {
    if (isRotating) {
        return false
    }    
    try {
        if (!currentLogFile || !fs.existsSync(currentLogFile)) {
            return false
        }        
        const stats = fs.statSync(currentLogFile)
        if (stats.size >= MAX_FILE_SIZE) {
            isRotating = true            
            if (currentLogStream) {
                currentLogStream.end()
                currentLogStream = null
            }
            const endTime = getCurrentDateTime().replace(/:/g, '')
            const startTimeMatch = currentFilename.match(/^(\d{4}-\d{2}-\d{2}_\d{6}\.\d{3})-/)
            if (startTimeMatch) {
                const startTime = startTimeMatch[1]
                const newFilename = `${startTime}-${endTime}.txt`
                const oldFilePath = path.join(LOGS_PATH, currentFilename)
                const newFilePath = path.join(LOGS_PATH, newFilename)                
                fs.renameSync(oldFilePath, newFilePath)
                console.log(`Лог-файл ротирован: ${currentFilename} => ${newFilename}`)
            }            
            createNewLogFile()
            isRotating = false
            return true
        }
    } catch (error) {
        console.error('Ошибка при ротации log-файла: ', error)
        isRotating = false
    }
    return false
}

function writeToLog(level, message) {
    if (!isInitialized) return
    rotateLogIfNeeded()    
    const timestamp = getCurrentDateTime()
    const logEntry = `[${timestamp}] ${level}: ${message}\n`        
    if (currentLogStream) {
        try {
            currentLogStream.write(logEntry)
        } catch (error) {
            console.error('Ошибка записи в лог: ', error)
        }
    }
}

function initializeLogger() {
    try {
        if (!fs.existsSync(LOGS_PATH)) {
            fs.mkdirSync(LOGS_PATH, { recursive: true })
        }
        createNewLogFile()
        isInitialized = true
        console.log(`Система логирования инициализирована. Логи сохраняются в: ${LOGS_PATH}`)
        return true
    } catch (error) {
        console.error('Ошибка инициализации системы логирования: ', error)
        return false
    }
}

function shutdownLogger() {
    if (currentLogStream) {
        currentLogStream.end()
        currentLogStream = null
    }
    isInitialized = false
}

const originalConsoleLog = console.log
const originalConsoleError = console.error

console.log = function(...args) {
    let message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)).join(' ')
    originalConsoleLog(...args)
    writeToLog('LOG', message)
}

console.error = function(...args) {
    let message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)).join(' ')
    originalConsoleError(...args)
    writeToLog('ERROR', message)
}

module.exports = {
    initializeLogger,
    shutdownLogger
}