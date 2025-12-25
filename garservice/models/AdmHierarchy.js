const Model = require('./index.js')

class AdmHierarchy extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".admhierarchy (
                id, objectid, parentobjid, changeid, regioncode, areacode,
                citycode, placecode, plancode, streetcode, previd, nextid, 
                updatedate, startdate, enddate, isactive, path 
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    parentobjid = excluded.parentobjid,
                    changeid = excluded.changeid,
                    regioncode = excluded.regioncode,
                    areacode = excluded.areacode,
                    citycode = excluded.citycode,
                    placecode = excluded.placecode,
                    plancode = excluded.plancode,
                    streetcode = excluded.streetcode,
                    previd = excluded.previd,
                    nextid = excluded.nextid,
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactive = excluded.isactive,
                    path = excluded.path
            RETURNING *
        `
        const values = [
            data.id, data.objectid, data.parentobjid, data.changeid, 
            data.regioncode, data.areacode, data.citycode, data.placecode, 
            data.plancode, data.streetcode, data.previd, data.nextid,
            data.updatedate, data.startdate, data.enddate, 
            data.isactive, data.path
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
            const offset = index * 17
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 
                $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, 
                $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16}, $${offset + 17})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.objectid !== undefined ? item.objectid : null,
                item.parentobjid !== undefined ? item.parentobjid : null,
                item.changeid !== undefined ? item.changeid : null,
                item.regioncode !== undefined ? item.regioncode : null,
                item.areacode !== undefined ? item.areacode : null,
                item.citycode !== undefined ? item.citycode : null,
                item.placecode !== undefined ? item.placecode : null,
                item.plancode !== undefined ? item.plancode : null,
                item.streetcode !== undefined ? item.streetcode : null,
                item.previd !== undefined ? item.previd : null,
                item.nextid !== undefined ? item.nextid : null,
                item.updatedate !== undefined ? item.updatedate : null,
                item.startdate !== undefined ? item.startdate : null,
                item.enddate !== undefined ? item.enddate : null,
                item.isactive !== undefined ? item.isactive : null,
                item.path !== undefined ? item.path : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".admhierarchy (
                id, objectid, parentobjid, changeid, regioncode, areacode,
                citycode, placecode, plancode, streetcode, previd, nextid, 
                updatedate, startdate, enddate, isactive, path 
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET
                    objectid = excluded.objectid,
                    parentobjid = excluded.parentobjid,
                    changeid = excluded.changeid,
                    regioncode = excluded.regioncode,
                    areacode = excluded.areacode,
                    citycode = excluded.citycode,
                    placecode = excluded.placecode,
                    plancode = excluded.plancode,
                    streetcode = excluded.streetcode,
                    previd = excluded.previd,
                    nextid = excluded.nextid,
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactive = excluded.isactive,
                    path = excluded.path;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = AdmHierarchy