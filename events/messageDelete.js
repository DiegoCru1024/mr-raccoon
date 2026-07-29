const {Events, EmbedBuilder} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const logger = require("../utils/logger")

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        try {
            if (!message.guild || message.author?.bot) return

            const config = await getGuildConfig(message.guild.id)
            if (!config.moderation.logChannelId) return

            const logChannel = await message.guild.channels.fetch(config.moderation.logChannelId).catch(() => null)
            if (!logChannel) return

            const logEmbed = new EmbedBuilder()
                .setColor(0xc86400)
                .setTitle('Mensaje eliminado')
                .addFields(
                    {name: 'Autor', value: message.author ? `<@${message.author.id}>` : 'Desconocido', inline: true},
                    {name: 'Canal', value: `${message.channel}`, inline: true},
                    {name: 'Contenido', value: message.content || '*Sin contenido de texto*'}
                )
                .setTimestamp()

            await logChannel.send({embeds: [logEmbed]})
        } catch (error) {
            logger.error('Error al manejar el evento messageDelete:', error)
        }
    },
}
