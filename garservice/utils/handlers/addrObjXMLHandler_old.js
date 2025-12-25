const { promisify } = require('util')
const sleep = promisify(setTimeout)
const AddrObj = require('../../models/AddrObj')

const addrObjXMLHandler = function addrObjXMLHandler() {
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
      const addrObj = new AddrObj()
      await addrObj.bulkUpsert(batch)
      counter += batch.length
      console.log(`${filename} Обработан батч из ${batch.length} адресных объектов, всего: ${counter}`)
    } catch (error) {
      console.error(`${filename} Ошибка при пакетной вставке ${batch.length} адресных объектов`, error)
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
      if (node.name === 'OBJECT') {
        const item = {
          id: parseInt(node.attributes.ID),
          objectid: parseInt(node.attributes.OBJECTID),
          objectguid: node.attributes.OBJECTGUID,
          changeid: parseInt(node.attributes.CHANGEID),
          name: node.attributes.NAME,
          typename: node.attributes.TYPENAME,
          level: node.attributes.LEVEL,
          opertypeid: node.attributes.OPERTYPEID,
          previd: node.attributes.PREVID ? parseInt(node.attributes.PREVID) : null,
          nextid: node.attributes.NEXTID ? parseInt(node.attributes.NEXTID) : null,   
          updatedate: node.attributes.UPDATEDATE,
          startdate: node.attributes.STARTDATE,
          enddate: node.attributes.ENDDATE,
          isactual: parseInt(node.attributes.ISACTUAL),
          isactive: parseInt(node.attributes.ISACTIVE)
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
      console.log(`Обработано ${counter} адресных объектов из файла ${filename}`)
      isFinalizing = false
    }
  }
}

module.exports = { addrObjXMLHandler }