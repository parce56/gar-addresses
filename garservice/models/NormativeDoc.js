const Model = require('./index.js')

class NormativeDoc extends Model {
    constructor() {
        super()
    }

    async upsert(data) {
        const query = `
            INSERT INTO "${this.schema}".normativedocs (
                id, name, date, number, type, kind, updatedate, orgname, regnum, regdate, accdate, comment
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO UPDATE
                SET
                    name = excluded.name,
                    date = excluded.date,
                    number = excluded.number,
                    type = excluded.type,
                    kind = excluded.kind,
                    updatedate = excluded.updatedate,
                    orgname = excluded.orgname,
                    regnum = excluded.regnum,
                    regdate = excluded.regdate,
                    accdate = excluded.accdate,
                    comment = excluded.comment
            RETURNING *
        `
        const values = [
            data.id, data.name, data.date, data.number, 
            data.type, data.kind, data.updatedate, 
            data.orgname, data.regnum, data.regdate, 
            data.accdate, data.comment
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
            const offset = index * 12
            placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, 
                $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12})`)
            
            values.push(
                item.id !== undefined ? item.id : null,
                item.name !== undefined ? item.name : null,
                item.date !== undefined ? item.date : null,
                item.number !== undefined ? item.number : null,
                item.type !== undefined ? item.type : null,
                item.kind !== undefined ? item.kind : null,
                item.updatedate !== undefined ? item.updatedate : null,
                item.orgname !== undefined ? item.orgname : null,
                item.regnum !== undefined ? item.regnum : null,
                item.regdate !== undefined ? item.regdate : null,
                item.accdate !== undefined ? item.accdate : null,
                item.comment !== undefined ? item.comment : null
            )
        })

        const query = `
            INSERT INTO "${this.schema}".normativedocs (
                id, name, date, number, type, kind, updatedate, orgname, regnum, regdate, accdate, comment
            ) VALUES ${placeholders.join(', ')}
            ON CONFLICT (id) DO UPDATE
                SET
                    name = excluded.name,
                    date = excluded.date,
                    number = excluded.number,
                    type = excluded.type,
                    kind = excluded.kind,
                    updatedate = excluded.updatedate,
                    orgname = excluded.orgname,
                    regnum = excluded.regnum,
                    regdate = excluded.regdate,
                    accdate = excluded.accdate,
                    comment = excluded.comment;
        `      
        if (values.length === 0) {
            console.error('В bulk-запросе пустой values, items:', items)
            return
        }

        return this.query(query, values)
    }
}

module.exports = NormativeDoc