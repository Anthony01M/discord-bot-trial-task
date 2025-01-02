const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')
const { time } = require('@rjweb/utils')

const MessageHelper = require('../helper/messageHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Removes a specified role from a user.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
		.addUserOption(option => option
			.setName('user')
			.setDescription('The user to remove the role from.')
			.setRequired(true)
		)
		.addRoleOption(option => option
			.setName('role')
			.setDescription('The role to remove.')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('reason')
			.setDescription('The reason for removing the role.')
		)
		.addStringOption(option => option
			.setName('duration')
			.setDescription('The duration in minutes to remove the role temporarily. (e.g 1h, 1d, 1w)')
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user', true),
			role = interaction.options.getRole('role', true),
			reason = interaction.options.getString('reason') || 'No reason provided',
			duration = interaction.options.getString('duration'),
			member = interaction.guild.members.cache.get(user.id)
		if (!member) {
			const messageHelper = new MessageHelper('USER_NOT_FOUND'),
				response = messageHelper.build({ user: user.username })
			return await interaction.reply({ ...response, ephemeral: true })
		}
		if (!member.roles.cache.has(role.id)) {
			const messageHelper = new MessageHelper('USER_DOES_NOT_HAVE_ROLE'),
				response = messageHelper.build({ user: user.username, role: role.name })
			return await interaction.reply({ ...response, ephemeral: true })
		}
		const botMember = await interaction.guild.members.fetch(interaction.client.user.id)
		if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
			const messageHelper = new MessageHelper('NO_PERMISSION'),
				response = messageHelper.build({})
			return await interaction.editReply({ ...response, ephemeral: true })
		}
		if (duration && !time.parse(duration)) {
			const messageHelper = new MessageHelper('INVALID_DURATION'),
				response = messageHelper.build({ duration })
			return await interaction.reply({ ...response, ephemeral: true })
		}
		try {
			await member.roles.remove(role, reason)
			const messageHelper = new MessageHelper('REMOVEROLE'),
				response = messageHelper.build({
					role: role.name,
					user: user.username
				})
			await interaction.reply(response)
			if (duration) {
				setTimeout(async () => {
					await member.roles.add(role)
					const restoreMessageHelper = new MessageHelper('RESTOREROLE'),
						restoreResponse = restoreMessageHelper.build({
							role: role.name,
							user: user.username
						})
					return await interaction.followUp(restoreResponse)
				}, time.parse(duration))
			}
		} catch (error) {
			logHelper()
				.text(`Error removing role: ${error.message}`)
				.error()
			const messageHelper = new MessageHelper('ERROR_REMOVING_ROLE'),
				response = messageHelper.build({})
			return await interaction.reply({ ...response, ephemeral: true })
		}
	}
}