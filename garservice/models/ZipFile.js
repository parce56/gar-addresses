const Model = require('./index.js')

class ZipFile extends Model {
    constructor() {
        super()
    }

    async getCount() {
        const query = `SELECT COUNT(*) FROM "${this.schema}".zipfiles`
        const values = []
        try {
            const result = await this.query(query, values)
            return parseInt(result.rows[0].count)
        } catch (error) {
            throw error
        }
    }

    async getAllIds() {
        const query = `SELECT versionid FROM "${this.schema}".zipfiles`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows.map(record =>  parseInt(record.versionid))
        } catch (error) {
            throw error
        }
    }

    async getZipFileById(versionid) {
        const query = `SELECT * FROM "${this.schema}".zipfiles WHERE versionid = $1`
        const values = [versionid]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async getNeededToDownload() {
        const query = `SELECT * FROM "${this.schema}".zipfiles WHERE isdownloaded IS FALSE`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows
        } catch (error) {
            throw error
        }
    }

    async getNotHandledZipFiles() {
        const query = `SELECT * FROM "${this.schema}".zipfiles WHERE ishandled IS FALSE AND isdownloaded IS TRUE ORDER BY versionid ASC`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows
        } catch (error) {
            throw error
        }
    }

    parseDate(date) {
        if (!date) return null
        const [day, month, year] = date.split('.')
        return `${year}-${month}-${day}`
    }

    async insertFromService(data) {
        const query = `
            INSERT INTO "${this.schema}".zipfiles (
                versionid, textversion, garxmlfullurl, garxmldeltaurl, date
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `
        const values = [
            parseInt(data.VersionId), 
            data.TextVersion !== undefined ? data.TextVersion : null,
            data.GarXMLFullURL !== undefined ? data.GarXMLFullURL : null,
            data.GarXMLDeltaURL !== undefined ? data.GarXMLDeltaURL : null,
            data.Date !== undefined ? this.parseDate(data.Date) : null
        ]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async updateParameters(versionid, updates) {
        const allowedColumns = ['textversion', 'garxmlfullurl', 
            'garxmldeltaurl', 'date', 'directorypath', 'filename', 
            'isdownloaded', 'ishandled', 'sizebytes', 'isfull']        
        const entries = Object.entries(updates)
        if (entries.length === 0) {
            throw new Error('Не передан список полей для обновления.')
        }
        const setClauses = []
        const values = [versionid]
        let paramIndex = 2
        for (const [key, value] of entries) {
            if (!allowedColumns.includes(key)) {
                throw new Error(`Передан невалидный и/или неразрешённый столбец: ${key}`)
            }
            setClauses.push(`"${key}" = $${paramIndex}`)
            values.push(value)
            paramIndex++
        }
        const query = `
            UPDATE "${this.schema}".zipfiles
            SET ${setClauses.join(', ')}
            WHERE versionid = $1;
        `
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async resetHandledFlag(versionid) {
        const query = `
            UPDATE "${this.schema}".zipfiles
            SET ishandled = false
            WHERE versionid >= $1
        `
        const values = [versionid]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

}

module.exports = ZipFile