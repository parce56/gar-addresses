const { promisify } = require('util')
const sleep = promisify(setTimeout)
const ChangeHistory = require('../../models/ChangeHistory')

const changeHistoryXMLHandler = function changeHistoryXMLHandler() {
  let counter = 0
  let currentBatch = []
  const batchSize = parseInt(process.env.BATCH_SIZE) || 1000
  const maxConcurrentBatches = parseInt(process.env.MAX_CONCURRENT_BATCHES) || 3
  
  let activePromises = new Set()
  let isFinalizing = false

  const processBatch = async (batch, filename, isFinal = false) => {
    const promiseId = Symbol('batchPromise')
    activePromises.add(promiseId)
    try {
      const changeHistory = new ChangeHistory()
      await changeHistory.bulkUpsert(batch)
      counter += batch.length
      console.log(`${filename} Обработан батч из ${batch.length} записей изменений, всего: ${counter}`)
    } catch (error) {
      console.error(`${filename} Ошибка при пакетной вставке ${batch.length} записей изменений`, error)
      if (!isFinal) {
        currentBatch = [...batch, ...currentBatch]
      }
    } finally {
      activePromises.delete(promiseId)
    }
  }

  const processWithBackpressure = async (batch, filename) => {
    while (activePromises.size >= maxConcurrentBatches && !isFinalizing) {
      await sleep(10)
    }
    if (isFinalizing) {
      return processBatch(batch, filename, true)
    } else {
      processBatch(batch, filename).catch(console.error)
    }
  }

  return {
    onOpenTag: function(node, filename) {
      if (node.name === 'ITEM') {
        const item = {
          changeid: parseInt(node.attributes.CHANGEID),
          objectid: parseInt(node.attributes.OBJECTID),
          adrobjectid: node.attributes.ADROBJECTID,
          opertypeid: parseInt(node.attributes.OPERTYPEID),
          ndocid: node.attributes.NDOCID ? parseInt(node.attributes.NDOCID) : null,
          changedate: node.attributes.CHANGEDATE
        }

        currentBatch.push(item)

        if (currentBatch.length >= batchSize) {
          const batchToProcess = [...currentBatch]
          currentBatch = []
          processWithBackpressure(batchToProcess, filename).catch(console.error)
        }
      }
    },

    async finalize(filename) {
      isFinalizing = true
      if (currentBatch.length > 0) {
        await processBatch(currentBatch, filename, true)
        currentBatch = []
      }
      while (activePromises.size > 0) {
        await sleep(50)
      }
      console.log(`Обработано ${counter} записей изменений из файла ${filename}`)
      isFinalizing = false
    }
  }
}

module.exports = { changeHistoryXMLHandler }