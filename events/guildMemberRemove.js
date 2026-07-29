const {Events} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const logger = require("../utils/logger")

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        try {
            const config = await getGuildConfig(member.guild.id)
            if (!config.farewell.enabled || !config.farewell.channelId) return

            const channel = await member.guild.channels.fetch(config.farewell.channelId).catch(() => null)
            if (!channel) return

            const message = config.farewell.message
                .replaceAll('{user}', `${member}`)
                .replaceAll('{username}', member.user.username)
                .replaceAll('{server}', member.guild.name)

            await channel.send(message)
        } catch (error) {
            logger.error('Error al manejar el evento guildMemberRemove:', error)
        }
    },
}
