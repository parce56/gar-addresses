const Model = require('./index.js')

class NormativeDocsKind extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".normativedocskinds (
                id, name
            ) VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE
                SET 
                    name = excluded.name
            RETURNING *
        `
        const values = [
            data.id, data.name
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
            const offset = index * 2
            placeholders.push(`($${offset + 1}, $${offset + 2})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.name !== undefined ? item.name : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".normativedocskinds (
                id, name
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET 
                    name = excluded.name;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = NormativeDocsKind