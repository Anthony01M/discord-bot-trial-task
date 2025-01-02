const mysql = require('mysql2/promise')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const fs = require('fs')

const config = require('../config')
const logHelper = require('./logHelper')

let db

async function initialize() {
	switch (config.VARIABLES.DATABASE.type) {
		case 'mysql':
			db = await mysql.createConnection({
				host: config.VARIABLES.DATABASE.mysql.host,
				user: config.VARIABLES.DATABASE.mysql.user,
				password: config.VARIABLES.DATABASE.mysql.password,
				database: config.VARIABLES.DATABASE.mysql.database
			})
			await createTables()
			break
		case 'sqlite':
			const dbPath = config.VARIABLES.DATABASE.sqlite.path,
				dbDir = path.dirname(dbPath)
			if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
			if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '')
			db = await open({
				filename: dbPath,
				driver: sqlite3.Database
			})
			await createTables()
			break
		default:
			logHelper()
				.text('Unsupported database type. Please use "mysql" or "sqlite".')
				.error()
			process.exit(1)
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
	const createUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT NOT NULL,
			server_id TEXT NOT NULL,
			points INTEGER DEFAULT 0,
			level INTEGER DEFAULT 1,
			xp INTEGER DEFAULT 0
		)
	`
	await query(createUsersTable)
	const createModerationLogsTable = `
		CREATE TABLE IF NOT EXISTS moderation_logs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT NOT NULL,
			server_id TEXT NOT NULL,
			action TEXT NOT NULL,
			reason TEXT,
			moderator_id TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`
	await query(createModerationLogsTable)
}

async function query(sql, params) {
	switch (config.VARIABLES.DATABASE.type) {
		case 'mysql':
			const [results,] = await db.execute(sql, params)
			return results
		case 'sqlite':
			return await db.all(sql, params)
	}
}

async function close() {
	switch (config.VARIABLES.DATABASE.type) {
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