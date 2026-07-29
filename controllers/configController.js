const {guildConfigModel} = require("../models/guildConfigSchema")
const {DEFAULT_GUILD_CONFIG} = require("../utils/defaultGuildConfig")
const logger = require("../utils/logger")

function mergeWithDefaults(guildConfigDoc) {
    const doc = guildConfigDoc ? guildConfigDoc.toObject() : {}

    return {
        welcome: {...DEFAULT_GUILD_CONFIG.welcome, ...doc.welcome},
        farewell: {...DEFAULT_GUILD_CONFIG.farewell, ...doc.farewell},
        moderation: {...DEFAULT_GUILD_CONFIG.moderation, ...doc.moderation},
        leveling: {
            ...DEFAULT_GUILD_CONFIG.leveling,
            ...doc.leveling,
            levelRoles: doc.leveling?.levelRoles ?? DEFAULT_GUILD_CONFIG.leveling.levelRoles
        }
    }
}

async function getGuildConfig(guildId) {
    try {
        const guildConfigDoc = await guildConfigModel.findOne({guildId})
        return mergeWithDefaults(guildConfigDoc)
    } catch (error) {
        logger.error('Error al obtener la configuración del guild:', error)
        throw error
    }
}

async function updateGuildConfig(guildId, partialUpdate) {
    try {
        const setFields = {}
        for (const [module, values] of Object.entries(partialUpdate)) {
            for (const [key, value] of Object.entries(values)) {
                setFields[`${module}.${key}`] = value
            }
        }

        const guildConfigDoc = await guildConfigModel.findOneAndUpdate(
            {guildId},
            {$set: setFields},
            {upsert: true, new: true, setDefaultsOnInsert: true}
        )

        return mergeWithDefaults(guildConfigDoc)
    } catch (error) {
        logger.error('Error al actualizar la configuración del guild:', error)
        throw error
    }
}

async function addLevelRole(guildId, level, roleId) {
    try {
        await guildConfigModel.updateOne(
            {guildId},
            {$pull: {'leveling.levelRoles': {level}}},
            {upsert: true}
        )

        const guildConfigDoc = await guildConfigModel.findOneAndUpdate(
            {guildId},
            {$push: {'leveling.levelRoles': {level, roleId}}},
            {upsert: true, new: true}
        )

        return mergeWithDefaults(guildConfigDoc)
    } catch (error) {
        logger.error('Error al agregar el rol de nivel:', error)
        throw error
    }
}

module.exports = {getGuildConfig, updateGuildConfig, addLevelRole}
