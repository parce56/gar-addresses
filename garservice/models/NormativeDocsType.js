const Model = require('./index.js')

class NormativeDocsType extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".normativedocstypes (
                id, name, startdate, enddate
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
                SET 
                    name = excluded.name,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate
            RETURNING *
        `
        const values = [
            data.id, data.name, data.startdate, data.enddate
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
                item.name !== undefined ? item.name : null,
                item.startdate !== undefined ? item.startdate : null,
                item.enddate !== undefined ? item.enddate : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".normativedocstypes (
                id, name, startdate, enddate
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET 
                    name = excluded.name,
                    startdate = excluded.startdate,
                    enddate = excluded.enddate;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = NormativeDocsType