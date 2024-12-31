
const colors = require('ansi-colors')
const path = require('path')
const fs = require('fs')

const config = require('../config')

class LogHelper {
	constructor() {
		this.logDir = path.join(__dirname, '..', 'log')
		this.content = []
	}

	text(text, color = (c) => c.reset) {
		this.content.push(color(colors)(text.toString()))
		return this
	}

	raw(content) {
		this.content.push(content)
		return this
	}

	async logToFile(level) {
		const now = new Date(),
			year = String(now.getFullYear()),
			month = String(now.getMonth() + 1).padStart(2, '0'),
			day = String(now.getDate()).padStart(2, '0'),
			logDir = path.join(this.logDir, year, month),
			logFile = path.join(logDir, `${day}.txt`)
		if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
		const logMessage = `[${now.toISOString()}] [${level}] ${this.content.join(' ')}\n`
		fs.appendFileSync(logFile, logMessage, 'utf8')
	}

	info() {
		if (config.VARIABLES.LOG_LEVEL !== 'info' && config.VARIABLES.LOG_LEVEL !== 'debug') return false
		console.info(colors.bgBlue(' INF '), colors.gray(new Date().toLocaleString()), ...this.content)
		this.logToFile('INF')
		return true
	}

	error() {
		if (config.VARIABLES.LOG_LEVEL !== 'info' && config.VARIABLES.LOG_LEVEL !== 'debug') return false
		console.error(colors.bgRed(' ERR '), colors.gray(new Date().toLocaleString()), ...this.content)
		this.logToFile('ERR')
		return true
	}

	debug() {
		if (config.VARIABLES.LOG_LEVEL !== 'debug') return false
		console.error(colors.bgYellow(' DEB '), colors.gray(new Date().toLocaleString()), ...this.content)
		this.logToFile('DEB')
		return true
	}
}

module.exports = function logHelper() {
	return new LogHelper()
}