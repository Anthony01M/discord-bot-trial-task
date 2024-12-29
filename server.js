const { Client, GatewayIntentBits, Events, Collection } = require("discord.js")
const path = require("path")
const fs = require("fs")

const config = require('./config')
const logHelper = require('./helper/logHelper')

const startTime = performance.now()
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.commands = new Collection()
client.events = new Collection()

const commands = [],
    commandFolderPath = path.join(__dirname, "commands"),
    commandFiles = fs.readdirSync(commandFolderPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandFolderPath, file),
        command = require(filePath)
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
        commands.push(command.data.toJSON())
        logHelper()
            .text(`Loaded command ${command.data.name} from ${filePath}`)
            .info()
    } else {
        logHelper()
            .text(`The command at ${filePath} is missing a required "data" or "execute" property.`)
            .info()
    }
}

const eventFolderPath = path.join(__dirname, "events"),
    eventFiles = fs.readdirSync(eventFolderPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventFolderPath, file),
        event = require(filePath)
    if ('name' in event && 'execute' in event) {
        client.events.set(event.name, event)
        if ('once' in event && event.once) {
            client.once(event.name, (...args) => event.execute(...args, client))
        } else {
            client.on(event.name, (...args) => event.execute(...args, client))
        }
        logHelper()
            .text(`Loaded event ${event.name} from ${filePath}`)
            .info()
    } else {
        logHelper()
            .text(`The event at ${filePath} is missing a required "name" or "execute" property.`)
            .info()
    }
}

client
    .on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return
            try {
                await command.execute(interaction)
                const options = interaction.options.data.map(option => ({
                    name: option.name,
                    value: option.value
                }))
                logHelper()
                    .text('DISCORD COMMAND', (c) => c.blue)
                    .text(':')
                    .text(`/${interaction.commandName}`, (c) => c.green)
                    .text(`@${interaction.user.username}`, (c) => c.cyan)
                    .text(JSON.stringify(options), (c) => c.magenta)
                    .text(`(${(performance.now() - startTime).toFixed(1)}ms)`, (c) => c.gray)
                    .info()
            } catch (error) {
                if (error instanceof DiscordAPIError) if (error.code === 10062) return
                if (typeof error !== 'string')
                    logger()
                        .text('Discord Command Error')
                        .text('\n')
                        .text(error.stack ?? error.toString(), (c) => c.red)
                        .error()

                try {
                    await interaction[interaction.deferred ? 'editReply' : 'reply']({
                        ephemeral: true,
                        content: typeof error === 'string' ? error : '`⚠️` An error occurred while processing the command.'
                    })
                } catch { /* silent error */ }
            }
        }
    })
    .login(config.VARIABLES.BOT_TOKEN).then(async () => {
        await client.application?.commands.set(commands)
        logHelper()
            .text(`REGISTERED ${commands.length} COMMANDS`)
            .info()
    }).catch((error) => {
        logHelper()
            .text(`Error logging in to Discord: ${error.message}`)
            .error()
    })