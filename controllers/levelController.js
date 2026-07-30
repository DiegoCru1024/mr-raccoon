const {getGuildConfig} = require("./configController")
const {t} = require('../utils/i18n')
const logger = require("../utils/logger")

function getLevelFromExperience(experience) {
    return Math.floor(Math.sqrt(experience / 50))
}

function getExperienceForLevel(level) {
    return Math.pow(level, 2) * 50
}

async function handleLevelUp({client, guildId, userId, previousExperience, newExperience, fallbackChannel}) {
    const previousLevel = getLevelFromExperience(previousExperience)
    const newLevel = getLevelFromExperience(newExperience)

    if (newLevel <= previousLevel) return

    try {
        const config = await getGuildConfig(guildId)
        const guild = client.guilds.cache.get(guildId)
        if (!guild) return

        const member = await guild.members.fetch(userId).catch(() => null)

        if (member) {
            const rolesToGrant = config.leveling.levelRoles.filter(levelRole => levelRole.level <= newLevel && !member.roles.cache.has(levelRole.roleId))
            for (const levelRole of rolesToGrant) {
                await member.roles.add(levelRole.roleId).catch(error => logger.warn(`No se pudo asignar el rol de nivel ${levelRole.roleId}: ${error.message}`))
            }
        }

        if (config.leveling.announceLevelUp) {
            const targetChannel = config.leveling.levelUpChannelId
                ? await guild.channels.fetch(config.leveling.levelUpChannelId).catch(() => null)
                : fallbackChannel

            if (targetChannel) {
                const content = t(config.locale, 'levelUp.announcement', {user: `<@${userId}>`, level: newLevel})
                await targetChannel.send(content).catch(error => logger.warn(`No se pudo anunciar la subida de nivel: ${error.message}`))
            }
        }
    } catch (error) {
        logger.error('Error al procesar la subida de nivel:', error)
    }
}

module.exports = {getLevelFromExperience, getExperienceForLevel, handleLevelUp}
