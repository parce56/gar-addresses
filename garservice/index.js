require('dotenv').config()
const GARService = require('./models/GARService')
const { getSourceData } = require('./utils/getSourceData')
const { handleData } = require('./utils/handleData')
const { initializeDatabase, refreshMaterializedViews } = require('./db/init')
const { initializeLogger, shutdownLogger } = require('./utils/logger')

const systemParams = new GARService()
let isRunning = false

async function run() {
  if (isRunning) {
    console.log('Процесс уже запущен. Пропускаем запуск и продолжаем выполнения существующего процесса.')
    return
  }
  isRunning = true
  try {
    console.log('Старт выполнения.')
    await systemParams.setLastStart(new Date())
    await getSourceData()
    const handleResult = await handleData()
    if (handleResult) {
      await systemParams.setAdmHierarchyRefresh(false)
    }
    const needRefresh = !(await systemParams.getAdmHierarchyRefresh())
    if (needRefresh) {
      console.log('Обновляем материализованные представления.')
      await refreshMaterializedViews()
      await systemParams.setAdmHierarchyRefresh(true)
    }
    await systemParams.setLastFinish(new Date())
    console.log('Выполнение завершено.')
  } catch (error) {
    console.error('Произошла ошибка во время выполнения выполнения:', error)
  } finally {
    isRunning = false
  }
}

async function needToRun(lastFinish, intervalDays) {
  if (!lastFinish) {
    console.log('Дата последнего завершения отсутствует, запускаем.')
    return true
  }
  const now = new Date()
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000
  const nextRunTime = new Date(lastFinish.getTime() + intervalMs)
  if (now >= nextRunTime) {
    console.log(`Прошло больше ${intervalDays} дней с последнего запуска (${lastFinish}), поэтому запускаем.`)
    return true
  }
  return false
}

async function scheduleRunner() {
  try {
    const runIntervalDays = parseInt(process.env.RUN_INTERVAL_DAYS, 10)
    if (isNaN(runIntervalDays) || runIntervalDays <= 0) {
      console.error('Некорректное значение параметра RUN_INTERVAL_DAYS в .env')
      process.exit(1)
    }
    const lastFinish = await systemParams.getLastFinish()
    if (await needToRun(lastFinish, runIntervalDays)) {
      await run()
    }
  } catch (error) {
    console.error('Ошибка при проверке необходимости запуска:', error)
  }
}

async function startApp() {
  try {
    console.log('Старт приложения.')
    if (process.env.LOG_TO_FILE === 'true') {
      initializeLogger()
    }
    await initializeDatabase()
    await scheduleRunner()
    setInterval(scheduleRunner, 60 * 1000)
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error)
    process.exit(1)
  }

  process.on('SIGINT', async () => {
    console.log('\nПолучен сигнал завершения (SIGINT)')
    await shutdownApp()
  })

  process.on('SIGTERM', async () => {
    console.log('\nПолучен сигнал завершения (SIGTERM)')
    await shutdownApp()
  })
}

async function shutdownApp() {
  const model = require('./models/index')
  try {
    await model?.pool?.end()
  } catch (e) {
    console.error('Ошибка при закрытии пула БД:', e)
  }
  if (process.env.LOG_TO_FILE === 'true') {
    shutdownLogger()
  }
  console.log('Остановка приложения.')
  process.exit(0)
}

startApp()