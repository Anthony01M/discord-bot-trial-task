const { SlashCommandBuilder } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')
const db = require('../helper/databaseHelper')
const cacheHelper = require('../helper/cacheHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getpoints')
		.setDescription('Gets the points of a user.')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to get points for.')
			.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user', true),
			serverId = interaction.guild.id,
			cacheKey = `user_${serverId}_${user.id}`
		try {
			let cachedUser = await cacheHelper.get(cacheKey)
			if (!cachedUser) {
				const result = await db.query('SELECT points FROM users WHERE user_id = ? AND server_id = ?', [user.id, serverId])
				cachedUser = result[0] || { points: 0 }
				await cacheHelper.set(cacheKey, cachedUser)
			}
			const points = cachedUser.points,
				messageHelper = new MessageHelper('GET_POINTS'),
				response = messageHelper.build({ user: user.username, points })
			return await interaction.reply(response)
		} catch (error) {
			logHelper()
				.text(`Error getting points: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_GETTING_POINTS'),
				response = messageHelper.build({})
			return await interaction.reply({ ...response, ephemeral: true })
		}
	}
}