const fs = require('fs')
const path = require('path')

async function getDatesFolders(root) {
    try {
        if (!fs.existsSync(root)) {
            throw new Error(`Путь не существует: ${root}`)
        }

        const stats = fs.statSync(root)
        if (!stats.isDirectory()) {
            throw new Error(`Путь не является директорией: ${root}`)
        }

        const items = fs.readdirSync(root)

        const dateFolders = items.filter(item => {
            const itemPath = path.join(root, item)
            try {
                const itemStats = fs.statSync(itemPath)
                if (!itemStats.isDirectory()) {
                    return false
                }

                const isDatePattern = /^\d{8}$/.test(item)
                if (isDatePattern) {
                    const year = parseInt(item.substring(0, 4), 10)
                    const month = parseInt(item.substring(4, 6), 10)
                    const day = parseInt(item.substring(6, 8), 10)
                    return year >= 2025 &&
                           month >=1 && month <= 12 &&
                           day >= 1 && day <= 31
                }

                return false
            } catch (error) {
                return false
            }
        })

        const absolutePaths = dateFolders.map(folderName => 
            path.resolve(path.join(root, folderName))
        )
        absolutePaths.sort()
        return absolutePaths
    } catch (error) {
        console.error('Ошибка при сканирование директории: ', error)
    }
}

module.exports = { getDatesFolders }