const {Events} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const logger = require("../utils/logger")

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const config = await getGuildConfig(member.guild.id)
            if (!config.welcome.enabled || !config.welcome.channelId) return

            const channel = await member.guild.channels.fetch(config.welcome.channelId).catch(() => null)
            if (!channel) return

            const message = config.welcome.message
                .replaceAll('{user}', `${member}`)
                .replaceAll('{username}', member.user.username)
                .replaceAll('{server}', member.guild.name)

            await channel.send(message)
        } catch (error) {
            logger.error('Error al manejar el evento guildMemberAdd:', error)
        }
    },
}
