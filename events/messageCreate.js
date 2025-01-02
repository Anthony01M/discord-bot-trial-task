const cacheHelper = require('../helper/cacheHelper')
const db = require('../helper/databaseHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return
        if (message.channel.type === 'DM') return
        const userId = message.author.id,
            serverId = message.guild.id,
            cacheKey = `user_${serverId}_${userId}`
        try {
            let user = await cacheHelper.get(cacheKey)
            if (!user) {
                const result = await db.query('SELECT xp, level FROM users WHERE user_id = ? AND server_id = ?', [userId, serverId])
                if (!result || result.length === 0) {
                    await db.query('INSERT INTO users (user_id, server_id, xp, level) VALUES (?, ?, ?, ?)', [userId, serverId, 0, 1])
                    user = { xp: 0, level: 1 }
                } else {
                    user = result[0]
                }
                await cacheHelper.set(cacheKey, user)
            }
            let { xp, level } = user
            const xpToAdd = Math.floor(Math.random() * 10) + 15
            xp += xpToAdd
            const xpForNextLevel = level * 100
            if (xp >= xpForNextLevel) {
                level += 1
                xp -= xpForNextLevel
                await message.reply(`Congratulations ${message.author.username}, you have leveled up to level ${level}!`)
            }
            await cacheHelper.set(cacheKey, { xp, level })
        } catch (error) {
            logHelper()
                .text(`Error updating XP: ${error.message}`)
                .error()
        }
    }
}