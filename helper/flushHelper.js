const cacheHelper = require('./cacheHelper')
const db = require('./databaseHelper')
const logHelper = require('./logHelper')

async function flushCacheToDatabase() {
	try {
		const keys = await cacheHelper.keys('user_*')
		for (const key of keys) {
			const user = await cacheHelper.get(key)
			if (user) {
				const [_, serverId, userId] = key.split('_')
				await db.query('UPDATE users SET xp = ?, level = ? WHERE user_id = ? AND server_id = ?', [user.xp, user.level, userId, serverId])
				await cacheHelper.del(key)
			}
		}
	} catch (error) {
		logHelper()
			.text(`Error flushing cache to database: ${error.message}`)
			.error()
	}
}

module.exports = { flushCacheToDatabase }