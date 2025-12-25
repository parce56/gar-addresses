const { promisify } = require('util')
const sleep = promisify(setTimeout)

class XMLHandler {
  constructor(readStream, options = {}) {
    this.readStream = readStream
    this.counter = 0
    this.currentBatch = []
    this.batchSize = parseInt(process.env.BATCH_SIZE) || 1000
    this.maxConcurrentBatches = parseInt(process.env.MAX_CONCURRENT_BATCHES) || 3
    this.activePromises = new Set()
    this.isFinalizing = false
    this.maxBufferedRecords = this.batchSize * (this.maxConcurrentBatches + 10)

    if (!options.Model) throw new Error('Параметр Model обязателен.')
    if (!options.tagName) throw new Error('Параметр tagName обязателен.')
    if (typeof options.mapAttributes !== 'function') throw new Error('Функция mapAttributes обязательна.')

    this.Model = options.Model
    this.tagName = options.tagName
    this.mapAttributes = options.mapAttributes
    this.entityName = options.entityName || 'записей'
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
      const modelInstance = new this.Model()
      await modelInstance.bulkUpsert(batch)
      this.counter += batch.length
      console.log(`${filename} Обработан батч из ${batch.length} ${this.entityName}, всего: ${this.counter}`)
    } catch (error) {
      console.error(`${filename} Ошибка при пакетной вставке ${batch.length} ${this.entityName}`, error)
      console.error(`${filename} Батч из ${batch.length} записей пропущен из-за ошибки.`)
    } finally {
      this.activePromises.delete(promiseId)
      this.resumeIfPossible()
    }
  }

  onOpenTag(node, filename) {
    if (node.name === this.tagName) {
      const item = this.mapAttributes(node.attributes)
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
    console.log(`Обработано ${this.counter} ${this.entityName} из файла ${filename}`)
    this.readStream?.resume()
  }
}

module.exports = XMLHandler