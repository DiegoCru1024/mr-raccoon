const {Events, EmbedBuilder} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const logger = require("../utils/logger")

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        try {
            if (!newMessage.guild || newMessage.author?.bot) return
            if (oldMessage.content === newMessage.content) return

            const config = await getGuildConfig(newMessage.guild.id)
            if (!config.moderation.logChannelId) return

            const logChannel = await newMessage.guild.channels.fetch(config.moderation.logChannelId).catch(() => null)
            if (!logChannel) return

            const logEmbed = new EmbedBuilder()
                .setColor(0xc86400)
                .setTitle('Mensaje editado')
                .addFields(
                    {name: 'Autor', value: `<@${newMessage.author.id}>`, inline: true},
                    {name: 'Canal', value: `${newMessage.channel}`, inline: true},
                    {name: 'Antes', value: oldMessage.content || '*Sin contenido de texto*'},
                    {name: 'Después', value: newMessage.content || '*Sin contenido de texto*'}
                )
                .setTimestamp()

            await logChannel.send({embeds: [logEmbed]})
        } catch (error) {
            logger.error('Error al manejar el evento messageUpdate:', error)
        }
    },
}
