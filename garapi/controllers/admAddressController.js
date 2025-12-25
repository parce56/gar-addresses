const AdmAddress = require('../models/AdmAddress')

const admAddressController = {

  async getAdmAddresses(req, res, next) {
    try {
      const { userQueryText } = req.query
      if (!userQueryText) {
        return res.status(400).json({error: 'Параметр userQueryText обязателен и не может быть пустым.'})
      }
      const isMaterializedViewReady = await AdmAddress.checkMaterializedViewReady()
      if (!isMaterializedViewReady) {
        return res.status(503).json({ 
          error: 'Сервис временно недоступен.',
          message: 'Материализованное представление административной иерархии ещё не заполнено. Пожалуйста, повторите попытку позже.'
        })
      }      
      const admAddresses = await AdmAddress.getAdmAddresses(userQueryText)
      if (admAddresses.rows.length > 0) {
        res.json(admAddresses.rows)
      } else {
        const admAddressesDistanceOne = await AdmAddress.getAdmAddressesDistanceOne(userQueryText)
        res.json(admAddressesDistanceOne.rows)
      }
    } catch (error) {
      next(error)
    }
  }

}

module.exports = admAddressController