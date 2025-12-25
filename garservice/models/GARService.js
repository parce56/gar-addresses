const Model = require('./index.js')

class GARService extends Model {
    constructor() {
        super()
    }

    async get() {
        const query = `SELECT * FROM "${this.schema}".garservice`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async getLastStart() {
        const query = `SELECT laststart FROM "${this.schema}".garservice`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows[0].laststart
        } catch (error) {
            throw error
        }
    }

    async setLastStart(timestamp) {
        const query = `UPDATE "${this.schema}".garservice SET laststart = $1`
        const values = [timestamp]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async getLastFinish() {
        const query = `SELECT lastfinish FROM "${this.schema}".garservice`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows[0].lastfinish
        } catch (error) {
            throw error
        }
    }

    async setLastFinish(timestamp) {
        const query = `UPDATE "${this.schema}".garservice SET lastfinish = $1`
        const values = [timestamp]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }

    async getAdmHierarchyRefresh() {
        const query = `SELECT admhierarchyrefresh FROM "${this.schema}".garservice`
        const values = []
        try {
            const result = await this.query(query, values)
            return result.rows[0].admhierarchyrefresh
        } catch (error) {
            throw error
        }
    }

    async setAdmHierarchyRefresh(boolean) {
        const query = `UPDATE "${this.schema}".garservice SET admhierarchyrefresh = $1`
        const values = [boolean]
        try {
            const result = await this.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw error
        }
    }



}

module.exports = GARService