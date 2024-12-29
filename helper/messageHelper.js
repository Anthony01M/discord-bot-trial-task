const { EmbedBuilder } = require('discord.js')

const config = require('../config')

class MessageHelper {
    constructor(messageType) {
        this.messageType = messageType
        this.title = ''
        this.description = ''
        this.fields = []
    }

    setTitle(title) {
        this.title = title
        return this
    }

    setDescription(description) {
        this.description = description
        return this
    }

    addField(name, value) {
        this.fields.push({ name, value })
        return this
    }

    build(data) {
        const messageConfig = config.MESSAGES[this.messageType]
        const embedConfig = messageConfig.EMBED

        this.setTitle(embedConfig.title)
        this.fields = embedConfig.fields.map(field => ({
            name: field.name,
            value: field.value.replace('{original}', data.original).replace('{reversed}', data.reversed)
        }))

        if (embedConfig.enabled) {
            const embedMessage = this.createEmbedMessage(embedConfig)
            return { embeds: [embedMessage] }
        } else {
            const plainTextMessage = this.createPlainTextMessage(messageConfig.TEXT, data)
            return { content: plainTextMessage }
        }
    }

    createEmbedMessage(embedConfig) {
        const embed = new EmbedBuilder()
            .setTitle(this.title || 'Default Title')
            .setColor(embedConfig.color === 'random' ? this.getRandomColor() : embedConfig.color || '#0099ff')
        if (this.description) embed.setDescription(this.description)
        this.fields.forEach(field => {
            embed.addFields({ name: field.name, value: field.value })
        })
        return embed
    }

    createPlainTextMessage(textConfig, data) {
        let content = textConfig.content
        content = content.replace('{original}', data.original).replace('{reversed}', data.reversed)
        return content
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)]
        return color
    }
}

module.exports = MessageHelper