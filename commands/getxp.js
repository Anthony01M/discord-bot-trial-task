const { SlashCommandBuilder } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')
const db = require('../helper/databaseHelper')
const cacheHelper = require('../helper/cacheHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getxp')
		.setDescription('Gets the XP of a user.')
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to get XP for.')
			.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user', true),
			serverId = interaction.guild.id,
			cacheKey = `user_${serverId}_${user.id}`
		try {
			let cachedUser = await cacheHelper.get(cacheKey)
			if (!cachedUser) {
				const result = await db.query('SELECT xp FROM users WHERE user_id = ? AND server_id = ?', [user.id, serverId])
				cachedUser = result[0] || { xp: 0 }
				await cacheHelper.set(cacheKey, cachedUser)
			}
			const xp = cachedUser.xp,
				messageHelper = new MessageHelper('GET_XP'),
				response = messageHelper.build({ user: user.username, xp })
			return await interaction.reply(response)
		} catch (error) {
			logHelper()
				.text(`Error getting XP: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_GETTING_XP'),
				response = messageHelper.build({})
			return await interaction.reply({ ...response, ephemeral: true })
		}
	}
}