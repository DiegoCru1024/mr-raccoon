const {Events, EmbedBuilder} = require('discord.js')
const {getGuildConfig} = require("../controllers/configController")
const {t} = require('../utils/i18n')
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
                .setTitle(t(config.locale, 'messageLog.deletedTitle'))
                .addFields(
                    {name: t(config.locale, 'messageLog.author'), value: message.author ? `<@${message.author.id}>` : t(config.locale, 'common.unknown'), inline: true},
                    {name: t(config.locale, 'messageLog.channel'), value: `${message.channel}`, inline: true},
                    {name: t(config.locale, 'messageLog.content'), value: message.content || t(config.locale, 'common.noTextContent')}
                )
                .setTimestamp()

            await logChannel.send({embeds: [logEmbed]})
        } catch (error) {
            logger.error('Error al manejar el evento messageDelete:', error)
        }
    },
}
