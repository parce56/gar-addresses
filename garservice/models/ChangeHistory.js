const Model = require('./index.js')

class ChangeHistory extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".changehistory (
                changeid, objectid, adrobjectid, opertypeid, ndocid, changedate
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (changeid) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    adrobjectid = excluded.adrobjectid,
                    opertypeid = excluded.opertypeid,
                    ndocid = excluded.ndocid,
                    changedate = excluded.changedate
            RETURNING *
        `
        const values = [
            data.changeid, data.objectid, data.addrobjectid, data.opertypeid,
            data.ndocid, data.changedate
        ]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async bulkUpsert(items) {
        if (!items || items.length === 0) {
            console.log('В bulk-запрос передан пустой массив.')
            return
        }

        const validItems = items.filter(item => {
            if (!item || item.changeid === undefined || item.changeid === null) {
                console.log('Найден невалидный объект в bulk-запросе: ', item)
                return false
            }
            return true
        })

        if (validItems.length === 0) {
            console.log('В bulk-запросе нет валидных объектов.')
            return
        }

        if (validItems.length !== items.length) {
            console.log(`В bulk-запросе отфильтровано ${items.length - validItems.length} невалидных объетов`)
        }

        const placeholders = []
        const values = []
        
        validItems.forEach((item, index) => {
            const offset = index * 6
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`)
            
            values.push(
                item.changeid !== undefined ? item.changeid : null,
                item.objectid !== undefined ? item.objectid : null,
                item.adrobjectid !== undefined ? item.adrobjectid : null,
                item.opertypeid !== undefined ? item.opertypeid : null,
                item.ndocid !== undefined ? item.ndocid : null,
                item.changedate !== undefined ? item.changedate : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".changehistory (
                changeid, objectid, adrobjectid, opertypeid, ndocid, changedate
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (changeid) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    adrobjectid = excluded.adrobjectid,
                    opertypeid = excluded.opertypeid,
                    ndocid = excluded.ndocid,
                    changedate = excluded.changedate;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = ChangeHistory