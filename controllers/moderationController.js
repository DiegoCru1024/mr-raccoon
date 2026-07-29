const {EmbedBuilder} = require('discord.js')
const {moderationCaseModel} = require("../models/moderationCaseSchema")
const {getGuildConfig} = require("./configController")
const logger = require("../utils/logger")

async function logModerationCase(client, guildId, moderationCase) {
    try {
        const config = await getGuildConfig(guildId)
        if (!config.moderation.logChannelId) return

        const guild = client.guilds.cache.get(guildId)
        if (!guild) return

        const logChannel = await guild.channels.fetch(config.moderation.logChannelId).catch(() => null)
        if (!logChannel) return

        const logEmbed = new EmbedBuilder()
            .setColor(0xc80000)
            .setTitle(`Caso de moderación: ${moderationCase.type.toUpperCase()}`)
            .addFields(
                {name: 'Usuario', value: `<@${moderationCase.userId}>`, inline: true},
                {name: 'Moderador', value: `<@${moderationCase.moderatorId}>`, inline: true},
                {name: 'Razón', value: moderationCase.reason}
            )
            .setTimestamp(moderationCase.createdAt)

        await logChannel.send({embeds: [logEmbed]})
    } catch (error) {
        logger.warn(`No se pudo enviar el log de moderación: ${error.message}`)
    }
}

async function createCase(client, guildId, userId, moderatorId, type, reason) {
    try {
        const moderationCase = await new moderationCaseModel({guildId, userId, moderatorId, type, reason}).save()
        await logModerationCase(client, guildId, moderationCase)
        return moderationCase
    } catch (error) {
        logger.error('Error al crear el caso de moderación:', error)
        throw error
    }
}

async function getCases(guildId, userId) {
    try {
        return await moderationCaseModel.find({guildId, userId}).sort({createdAt: -1})
    } catch (error) {
        logger.error('Error al obtener los casos de moderación:', error)
        throw error
    }
}

module.exports = {createCase, getCases}
