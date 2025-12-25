const Model = require('./index.js')

class AddrObjDivision extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".addrobjdivision (
                id, parentid, childid, changeid
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
                SET
                    parentid = excluded.parentid,
                    childid = excluded.childid,
                    changeid = excluded.changeid
            RETURNING *
        `
        const values = [
            data.id, data.parentid, data.childid, data.changeid
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
            const offset = index * 4
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.parentid !== undefined ? item.parentid : null,
                item.childid !== undefined ? item.childid : null,
                item.changeid !== undefined ? item.changeid : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".addrobjdivision (
                id, parentid, childid, changeid
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET
                    parentid = excluded.parentid,
                    childid = excluded.childid,
                    changeid = excluded.changeid;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = AddrObjDivision