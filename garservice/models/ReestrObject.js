const Model = require('./index.js')

class ReestrObject extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".reestrobjects (
                objectid, objectguid, changeid, isactive, levelid,
                createdate, updatedate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (objectid) DO UPDATE
                SET
                    objectguid = excluded.objectguid,
                    changeid = excluded.changeid,
                    isactive = excluded.isactive,
                    levelid = excluded.levelid,
                    createdate = excluded.createdate,
                    updatedate = excluded.updatedate                    
            RETURNING *
        `
        const values = [
            data.objectid, data.objectguid, data.changeid, 
            data.isactive, data.levelid, data.createdate, data.updatedate
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
            if (!item || item.objectid === undefined || item.objectid === null) {
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
            const offset = index * 7
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 
                $${offset + 7})`)
            
            values.push(
                item.objectid !== undefined ? item.objectid : null,
                item.objectguid !== undefined ? item.objectguid : null,
                item.changeid !== undefined ? item.changeid : null,
                item.isactive !== undefined ? item.isactive : null,
                item.levelid !== undefined ? item.levelid : null,
                item.createdate !== undefined ? item.createdate : null,
                item.updatedate !== undefined ? item.updatedate : null                
            )
        })

        const query = `
            INSERT INTO "${this.schema}".reestrobjects (
                objectid, objectguid, changeid, isactive, levelid,
                createdate, updatedate
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (objectid) DO UPDATE
                SET
                    objectguid = excluded.objectguid,
                    changeid = excluded.changeid,
                    isactive = excluded.isactive,
                    levelid = excluded.levelid,
                    createdate = excluded.createdate,
                    updatedate = excluded.updatedate;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = ReestrObject