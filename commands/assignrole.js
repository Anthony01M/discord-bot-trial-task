const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const { time } = require('@rjweb/utils')

const MessageHelper = require('../helper/messageHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assignrole')
		.setDescription('Assigns a specified role to a user.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to assign the role to.')
			.setRequired(true)
		)
		.addRoleOption(option => option
			.setName('role')
			.setDescription('The role to assign.')
			.setRequired(true)
		)
		.addIntegerOption(option => option
			.setName('messages')
			.setDescription('The number of messages to check if the user has sent.')
		)
		.addStringOption(option => option
			.setName('since')
			.setDescription('The duration the user has been in the server (e.g 1h, 1d, 1w).')
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true })
		const user = interaction.options.getUser('user', true),
			role = interaction.options.getRole('role', true),
			messages = interaction.options.getInteger('messages'),
			since = interaction.options.getString('since'),
			member = interaction.guild.members.cache.get(user.id)
		if (!member) {
			const messageHelper = new MessageHelper('USER_NOT_FOUND'),
				response = messageHelper.build({ user: user.username })
			return interaction.editReply({ ...response, ephemeral: true })
		}
		if (member.roles.cache.has(role.id)) {
			const messageHelper = new MessageHelper('USER_ALREADY_HAS_ROLE'),
				response = messageHelper.build({ user: user.username, role: role.name })
			return interaction.editReply({ ...response, ephemeral: true })
		}
		const botMember = await interaction.guild.members.fetch(interaction.client.user.id)
		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			const messageHelper = new MessageHelper('NO_PERMISSION'),
				response = messageHelper.build({})
			return interaction.editReply({ ...response, ephemeral: true })
		}
		if (messages) {
			let userMessageCount = 0
			let lastMessageId = null
			const maxFetches = 100
			for (let i = 0; i < maxFetches && userMessageCount < messages; i++) {
				const options = { limit: 100 }
				if (lastMessageId) options.before = lastMessageId
				const fetchedMessages = await interaction.channel.messages.fetch(options)
				if (fetchedMessages.size === 0) break
				const userMessages = fetchedMessages.filter(message => message.author.id === user.id)
				userMessageCount += userMessages.size
				lastMessageId = fetchedMessages.last().id
				await new Promise(resolve => setTimeout(resolve, 1000))
			}
			if (userMessageCount < messages) {
				const messageHelper = new MessageHelper('USER_NOT_ENOUGH_MESSAGES'),
					response = messageHelper.build({ messages })
				return interaction.editReply({ ...response, ephemeral: true })
			}
		}
		if (since) {
			const duration = time.parse(since)
			if (!duration) {
				const messageHelper = new MessageHelper('INVALID_DURATION'),
					response = messageHelper.build({ duration: since })
				return interaction.editReply({ ...response, ephemeral: true })
			}
			const memberSince = new Date(member.joinedTimestamp),
				now = new Date()
			if (now - memberSince < duration) {
				const messageHelper = new MessageHelper('USER_NOT_LONG_ENOUGH'),
					response = messageHelper.build({ since })
				return interaction.editReply({ ...response, ephemeral: true })
			}
		}
		try {
			await member.roles.add(role)
			const messageHelper = new MessageHelper('ASSIGNROLE'),
				response = messageHelper.build({
					role: role.name,
					user: user.username
				})
			await interaction.editReply(response)
		} catch (error) {
			logHelper()
				.text(`Error assigning role: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_ASSIGNING_ROLE'),
				response = messageHelper.build({})
			await interaction.editReply({ ...response, ephemeral: true })
		}
	}
}