const Model = require('./index.js')

class AddrObjType extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".addrobjtypes (
                id, level, name, shortname, "desc", updatedate, startdate, enddate, isactive
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE
                SET 
                    level = excluded.level,
                    name = excluded.name,
                    shortname = excluded.shortname,
                    "desc" = excluded."desc",
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactive = excluded.isactive
            RETURNING *
        `
        const values = [
            data.id, data.level, data.name, data.shortname, data.desc, 
            data.updatedate, data.startdate, data.enddate,
            data.isactive
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
            const offset = index * 9
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.level !== undefined ? item.level : null,
                item.name !== undefined ? item.name : null,
                item.shortname !== undefined ? item.shortname : null,
                item.desc !== undefined ? item.desc : null,
                item.updatedate !== undefined ? item.updatedate : null,
                item.startdate !== undefined ? item.startdate : null,
                item.enddate !== undefined ? item.enddate : null,
                item.isactive !== undefined ? item.isactive : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".addrobjtypes (
                id, level, name, shortname, "desc", updatedate, startdate, enddate, isactive
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET 
                    level = excluded.level,
                    name = excluded.name,
                    shortname = excluded.shortname,
                    "desc" = excluded."desc",
                    updatedate = excluded.updatedate,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate,
                    isactive = excluded.isactive;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = AddrObjType