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
		const messageConfig = config.MESSAGES[this.messageType] || config.ERRORS[this.messageType]
		if (!messageConfig) throw new Error(`Message type ${this.messageType} not found in config`)
		const messageType = (messageConfig.type || 'embed').toLowerCase()

		if (messageType === 'embed') {
			this.setTitle(messageConfig.EMBED.title)
			this.fields = messageConfig.EMBED.fields.map(field => ({
				name: field.name,
				value: field.value.replace(/{(\w+)}/g, (_, key) => data[key] || '')
			}))
			const embedMessage = this.createEmbedMessage(messageConfig.EMBED)
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
		content = content.replace(/{(\w+)}/g, (_, key) => data[key] || '')
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