const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')
const db = require('../helper/databaseHelper')
const cacheHelper = require('../helper/cacheHelper')
const logHelper = require('../helper/logHelper')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpoints')
        .setDescription('Adds points to a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to add points to.')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('points')
            .setDescription('The number of points to add.')
            .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user', true),
            points = interaction.options.getInteger('points', true),
            serverId = interaction.guild.id,
            cacheKey = `user_${serverId}_${user.id}`
        try {
            await db.query('UPDATE users SET points = points + ? WHERE user_id = ? AND server_id = ?', [points, user.id, serverId])
            let cachedUser = await cacheHelper.get(cacheKey)
            if (cachedUser) {
                cachedUser.points += points
                await cacheHelper.set(cacheKey, cachedUser)
            }
            const messageHelper = new MessageHelper('ADD_POINTS'),
                response = messageHelper.build({ user: user.username, points })
            return await interaction.reply(response)
        } catch (error) {
            logHelper()
                .text(`Error adding points: ${error.message}`)
                .error()
            const messageHelper = new MessageHelper('ERROR_ADDING_POINTS'),
                response = messageHelper.build({})
            return await interaction.reply({ ...response, ephemeral: true })
        }
    }
}