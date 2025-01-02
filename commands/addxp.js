const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')
const db = require('../helper/databaseHelper')
const cacheHelper = require('../helper/cacheHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addxp')
		.setDescription('Adds XP to a user.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to add XP to.')
			.setRequired(true)
		)
		.addIntegerOption(option => option
			.setName('xp')
			.setDescription('The amount of XP to add.')
			.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user', true),
			xp = interaction.options.getInteger('xp', true),
			serverId = interaction.guild.id,
			cacheKey = `user_${serverId}_${user.id}`
		try {
			await db.query('UPDATE users SET xp = xp + ? WHERE user_id = ? AND server_id = ?', [xp, user.id, serverId])
			let cachedUser = await cacheHelper.get(cacheKey)
			if (cachedUser) {
				cachedUser.xp += xp
				await cacheHelper.set(cacheKey, cachedUser)
			}
			const messageHelper = new MessageHelper('ADD_XP'),
				response = messageHelper.build({ user: user.username, xp })
			return await interaction.reply(response)
		} catch (error) {
			logHelper()
				.text(`Error adding XP: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_ADDING_XP'),
				response = messageHelper.build({})
			return await interaction.reply({ ...response, ephemeral: true })
		}
	}
}