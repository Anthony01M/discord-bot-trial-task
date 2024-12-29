const { SlashCommandBuilder } = require('discord.js')

const MessageHelper = require('../helper/messageHelper')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input.')
        .addStringOption(option => option
            .setName('input')
            .setDescription('The input to echo back.')
            .setMaxLength(500)
            .setRequired(true)
        ),
    async execute(interaction) {
        const inputMessage = interaction.options.getString('input', true),
            sanitizedMessage = inputMessage.replace(/[`@#*]/g, '\\$&'),
            reversedMessage = sanitizedMessage.split('').reverse().join(''),
            messageHelper = new MessageHelper('ECHO'),
            response = messageHelper.build({
                original: sanitizedMessage,
                reversed: reversedMessage
            })
        await interaction.reply(response)
    }
}