const mysql = require('mysql2/promise')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const config = require('../config')

let db

async function initialize() {
	switch (config.VARIABLES.DATABASE_TYPE) {
		case 'mysql':
			db = await mysql.createConnection({
				host: config.VARIABLES.DATABASE_HOST,
				user: config.VARIABLES.DATABASE_USER,
				password: config.VARIABLES.DATABASE_PASSWORD,
				database: config.VARIABLES.DATABASE_NAME
			})
			await createTables()
			break
		case 'sqlite':
			db = await open({
				filename: config.VARIABLES.DATABASE_NAME,
				driver: sqlite3.Database
			})
			await createTables()
			break
	}
}

async function createTables() {
	const createWelcomeMessagesTable = `
		CREATE TABLE IF NOT EXISTS welcome_messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			server_id TEXT NOT NULL,
			type TEXT NOT NULL,
			title TEXT,
			message TEXT
		)
	`
	await query(createWelcomeMessagesTable)
}

async function query(sql, params) {
	switch (config.VARIABLES.DATABASE_TYPE) {
		case 'mysql':
			const [results, ] = await db.execute(sql, params)
			return results
		case 'sqlite':
			return await db.all(sql, params)
	}
}

async function close() {
	switch (config.VARIABLES.DATABASE_TYPE) {
		case 'mysql':
			await db.end()
			break
		case 'sqlite':
			await db.close()
			break
	}
}

module.exports = {
	initialize,
	query,
	close
}