const { promisify } = require('util')
const sleep = promisify(setTimeout)
const AddrObj = require('../../models/AddrObj')

class AddrObjXMLHandler {
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
      const addrObj = new AddrObj()
      await addrObj.bulkUpsert(batch)
      this.counter += batch.length
      console.log(`${filename} Обработан батч из ${batch.length} адресных объектов, всего: ${this.counter}`)
    } catch (error) {
      console.error(`${filename} Ошибка при пакетной вставке ${batch.length} адресных объектов`, error)
      console.error(`${filename} Батч из ${batch.length} записей пропущен из-за ошибки.`)
    } finally {
      this.activePromises.delete(promiseId)
      this.resumeIfPossible()
    }
  }

  onOpenTag(node, filename) {
    if (node.name === 'OBJECT') {
      const item = {
        id: parseInt(node.attributes.ID),
        objectid: parseInt(node.attributes.OBJECTID),
        objectguid: node.attributes.OBJECTGUID,
        changeid: parseInt(node.attributes.CHANGEID),
        name: node.attributes.NAME,
        typename: node.attributes.TYPENAME,
        level: node.attributes.LEVEL,
        opertypeid: parseInt(node.attributes.OPERTYPEID),
        previd: node.attributes.PREVID ? parseInt(node.attributes.PREVID) : null,
        nextid: node.attributes.NEXTID ? parseInt(node.attributes.NEXTID) : null,
        updatedate: node.attributes.UPDATEDATE,
        startdate: node.attributes.STARTDATE,
        enddate: node.attributes.ENDDATE,
        isactual: parseInt(node.attributes.ISACTUAL),
        isactive: parseInt(node.attributes.ISACTIVE)
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
    console.log(`Обработано ${this.counter} адресных объектов из файла ${filename}`)
    this.readStream?.resume()
  }
}

function addrObjXMLHandler(readStream) {
  return new AddrObjXMLHandler(readStream)
}

module.exports = { addrObjXMLHandler }