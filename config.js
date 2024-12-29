const path = require('path')
const fs = require('fs')

const configPath = path.join(__dirname, 'config.json'),
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

const required = ['VARIABLES.BOT_TOKEN', 'VARIABLES.DATABASE.type']
for (const key of required) {
    const keys = key.split('.')
    let value = config
    for (const k of keys) {
        value = value[k]
        if (value === undefined) {
            console.error(`Missing required key "${key}" in config.json. Please provide a valid value.`)
            process.exit(1)
        }
    }
}

switch (config.VARIABLES.DATABASE.type) {
    case 'mysql':
        required.push('VARIABLES.DATABASE.mysql.host', 'VARIABLES.DATABASE.mysql.user', 'VARIABLES.DATABASE.mysql.password', 'VARIABLES.DATABASE.name')
        break
    case 'sqlite':
        required.push('VARIABLES.DATABASE.sqlite.path')
        break
    default:
        console.error('Unsupported database type. Please use "mysql" or "sqlite".')
        process.exit(1)
}

for (const key of required) {
    const keys = key.split('.')
    let value = config
    for (const k of keys) {
        value = value[k]
        if (value === undefined) {
            console.error(`Missing required key "${key}" in config.json. Please provide a valid value.`)
            process.exit(1)
        }
    }
}

module.exports = config