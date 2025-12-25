const Model = require('./index.js')

class Room extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".rooms (
                id, objectid, objectguid, changeid, number, roomtype, 
                opertypeid, previd, nextid, updatedate, startdate, enddate, isactual, isactive
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    objectguid = excluded.objectguid,
                    changeid = excluded.changeid,
                    number = excluded.number,
                    roomtype = excluded.roomtype,
                    opertypeid = excluded.opertypeid,
                    previd = excluded.previd,
                    nextid = excluded.nextid,
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactual = excluded.isactual,
                    isactive = excluded.isactive
            RETURNING *
        `
        const values = [
            data.id, data.objectid, data.objectguid, data.changeid, 
            data.number, data.roomtype, data.opertypeid, data.previd, 
            data.nextid, data.updatedate, data.startdate, data.enddate, 
            data.isactual, data.isactive
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
            if (!item || item.id === undefined || item.id === null) {
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
            const offset = index * 14
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 
                $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, 
                $${offset + 13}, $${offset + 14})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.objectid !== undefined ? item.objectid : null,
                item.objectguid !== undefined ? item.objectguid : null,
                item.changeid !== undefined ? item.changeid : null,
                item.number !== undefined ? item.number : null,
                item.roomtype !== undefined ? item.roomtype : null,
                item.opertypeid !== undefined ? item.opertypeid : null,
                item.previd !== undefined ? item.previd : null,
                item.nextid !== undefined ? item.nextid : null,
                item.updatedate !== undefined ? item.updatedate : null,
                item.startdate !== undefined ? item.startdate : null,
                item.enddate !== undefined ? item.enddate : null,
                item.isactual !== undefined ? item.isactual : null,
                item.isactive !== undefined ? item.isactive : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".rooms (
                id, objectid, objectguid, changeid, number, roomtype, 
                opertypeid, previd, nextid, updatedate, startdate, enddate, isactual, isactive
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    objectguid = excluded.objectguid,
                    changeid = excluded.changeid,
                    number = excluded.number,
                    roomtype = excluded.roomtype,
                    opertypeid = excluded.opertypeid,
                    previd = excluded.previd,
                    nextid = excluded.nextid,
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactual = excluded.isactual,
                    isactive = excluded.isactive;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = Room