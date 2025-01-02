const { SlashCommandBuilder } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')
const cacheHelper = require('../helper/cacheHelper')
const db = require('../helper/databaseHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the top users by points and levels.'),
	async execute(interaction) {
		const serverId = interaction.guild.id
		try {
			const keys = await cacheHelper.keys(`users_${serverId}_*`)
			let users = []
			for (const key of keys) {
				const user = await cacheHelper.get(key)
				if (user && (user.points || user.xp || user.level)) {
					const userId = key.split('_')[2]
					users.push({ user_id: userId, points: user.points || 0, xp: user.xp || 0, level: user.level || 1 })
				}
			}
			const result = await db.query('SELECT user_id, points, xp, level FROM users WHERE server_id = ? ORDER BY points DESC, xp DESC, level DESC LIMIT 20', [serverId])
			if (result && result.length > 0) {
				for (const row of result) {
					const existingUser = users.find(user => user.user_id === row.user_id)
					if (existingUser) {
						existingUser.points = Math.max(existingUser.points, row.points)
						existingUser.xp = Math.max(existingUser.xp, row.xp)
						existingUser.level = Math.max(existingUser.level, row.level)
					} else {
						users.push(row)
					}
				}
			}
			const topPointsUsers = [...users].sort((a, b) => b.points - a.points),
				topLevelUsers = [...users].sort((a, b) => b.level - a.level || b.xp - a.xp)
			if (users.length === 0) {
				const messageHelper = new MessageHelper('EMPTY_LEADERBOARD'),
					response = messageHelper.build({})
				return await interaction.reply({ ...response, ephemeral: true })
			}
			const topPointsLeaderboard = topPointsUsers.map((row, index) => `${index + 1}. <@${row.user_id}> - ${row.points} point${row.points === 1 ? '' : 's'}`).join('\n'),
				topLevelLeaderboard = topLevelUsers.map((row, index) => `${index + 1}. <@${row.user_id}> - Level ${row.level}, ${row.xp} XP`).join('\n'),
				messageHelper = new MessageHelper('LEADERBOARD'),
				response = messageHelper.build({
					topPointsLeaderboard,
					topLevelLeaderboard
				})
			return await interaction.reply(response)
		} catch (error) {
			logHelper()
				.text(`Error getting leaderboard: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_GETTING_LEADERBOARD'),
				response = messageHelper.build({})
			await interaction.reply({ ...response, ephemeral: true })
		}
	}
}