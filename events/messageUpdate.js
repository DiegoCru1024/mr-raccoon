const {Events, EmbedBuilder} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const {t} = require('../utils/i18n')
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
                .setTitle(t(config.locale, 'messageLog.editedTitle'))
                .addFields(
                    {name: t(config.locale, 'messageLog.author'), value: `<@${newMessage.author.id}>`, inline: true},
                    {name: t(config.locale, 'messageLog.channel'), value: `${newMessage.channel}`, inline: true},
                    {name: t(config.locale, 'messageLog.before'), value: oldMessage.content || t(config.locale, 'common.noTextContent')},
                    {name: t(config.locale, 'messageLog.after'), value: newMessage.content || t(config.locale, 'common.noTextContent')}
                )
                .setTimestamp()

            await logChannel.send({embeds: [logEmbed]})
        } catch (error) {
            logger.error('Error al manejar el evento messageUpdate:', error)
        }
    },
}
