const Model = require('./Model')

class AdmAddress extends Model {
  constructor() {
    super()
    this.isMaterializedViewReady = false
    this.materializedViewName = 'admhierarchyaddresses'
  }

  async checkMaterializedViewReady() {
    if (this.isMaterializedViewReady) {
      return true
    }
    try {
      const queryText = `SELECT relispopulated FROM pg_class WHERE oid = '${this.schema}.${this.materializedViewName}'::regclass`
      const result = await this.query(queryText)
      if (!result.rows[0].relispopulated) {
        return false
      }
      this.isMaterializedViewReady = true
      return true
    } catch (error) {
      console.error('Ошибка при проверке статуса заполнения материализованного представления административной иерархии:', error.message)
      return false
    }
  }

  async getAdmAddresses(userQueryText) {
    let queryText = `
      SELECT a.objectid, a.objectguid, a.levelid, a.normalized_level, a.isactive, a.full_address, a.path FROM (
        SELECT objectid, objectguid, levelid, normalized_level, isactive, full_address, path, paradedb.score(objectid)
        FROM ${this.schema}.${this.materializedViewName}
        WHERE full_address @@@ pdb.match($1, distance => 0, conjunction_mode => true)
        ORDER BY score DESC
        LIMIT 7) a
      ORDER BY a.normalized_level, a.full_address;
    `
    return await this.query(queryText, [userQueryText])
  }

  async getAdmAddressesDistanceOne(userQueryText) {
    let queryText = `
      SELECT a.objectid, a.objectguid, a.levelid, a.normalized_level, a.isactive, a.full_address, a.path FROM (
        SELECT objectid, objectguid, levelid, normalized_level, isactive, full_address, path, paradedb.score(objectid)
        FROM ${this.schema}.${this.materializedViewName}
        WHERE full_address @@@ pdb.match($1, distance => 1, conjunction_mode => true)
        ORDER BY score DESC
        LIMIT 7) a
      ORDER BY a.normalized_level, a.full_address;
    `
    return await this.query(queryText, [userQueryText])
  }


}

module.exports = new AdmAddress()