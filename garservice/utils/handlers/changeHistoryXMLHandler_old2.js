const { promisify } = require('util')
const sleep = promisify(setTimeout)
const ChangeHistory = require('../../models/ChangeHistory')

class ChangeHistoryXMLHandler {
  constructor(readStream) {
    this.readStream = readStream
    this.counter = 0
    this.currentBatch = []
    this.batchSize = parseInt(process.env.BATCH_SIZE) || 1000
    this.maxConcurrentBatches = parseInt(process.env.MAX_CONCURRENT_BATCHES) || 3
    this.activePromises = new Set()
    this.isFinalizing = false
    this.maxBufferedRecords = this.batchSize * (this.maxConcurrentBatches + 10)
  }

  checkBackpressure() {
    const totalBuffered = this.currentBatch.length + this.activePromises.size * this.batchSize
    if (totalBuffered >= this.maxBufferedRecords && !this.readStream.isPaused?.()) {
      this.readStream.pause()
    }
  }

  resumeIfPossible() {
    const totalBuffered = this.currentBatch.length + this.activePromises.size * this.batchSize
    if (totalBuffered < this.maxBufferedRecords && this.readStream.isPaused?.()) {
      this.readStream.resume()
    }
  }

  async processBatch(batch, filename, isFinal = false) {
    const promiseId = Symbol('batch')
    this.activePromises.add(promiseId)
    try {
      const changeHistory = new ChangeHistory()
      await changeHistory.bulkUpsert(batch)
      this.counter += batch.length
      console.log(`${filename} Обработан батч из ${batch.length} записей изменений, всего: ${this.counter}`)
    } catch (error) {
      console.error(`${filename} Ошибка при пакетной вставке ${batch.length} записей изменений`, error)
      console.error(`${filename} Батч из ${batch.length} записей пропущен из-за ошибки.`)
    } finally {
      this.activePromises.delete(promiseId)
      this.resumeIfPossible()
    }
  }

  onOpenTag(node, filename) {
    if (node.name === 'ITEM') {
      const item = {
        changeid: parseInt(node.attributes.CHANGEID),
        objectid: parseInt(node.attributes.OBJECTID),
        adrobjectid: node.attributes.ADROBJECTID,
        opertypeid: parseInt(node.attributes.OPERTYPEID),
        ndocid: node.attributes.NDOCID ? parseInt(node.attributes.NDOCID) : null,
        changedate: node.attributes.CHANGEDATE
      }
      this.currentBatch.push(item)
      if (this.currentBatch.length >= this.batchSize) {
        const batchToProcess = this.currentBatch.splice(0, this.batchSize)
        this.processBatch(batchToProcess, filename).catch(console.error)
      }
      this.checkBackpressure()
    }
  }

  async finalize(filename) {
    this.isFinalizing = true
    if (this.currentBatch.length > 0) {
      const finalBatch = [...this.currentBatch]
      this.currentBatch = []
      await this.processBatch(finalBatch, filename, true)
    }
    while (this.activePromises.size > 0) {
      await sleep(50)
    }
    console.log(`Обработано ${this.counter} записей изменений из файла ${filename}`)
    this.readStream?.resume()
  }
}

function changeHistoryXMLHandler(readStream) {
  return new ChangeHistoryXMLHandler(readStream)
}

module.exports = { changeHistoryXMLHandler }