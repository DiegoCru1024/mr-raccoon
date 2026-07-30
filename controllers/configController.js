const {guildConfigModel} = require("../models/guildConfigSchema")
const {DEFAULT_GUILD_CONFIG} = require("../utils/defaultGuildConfig")
const {mapDiscordLocale} = require("../utils/i18n")
const logger = require("../utils/logger")

function mergeWithDefaults(guildConfigDoc) {
    const doc = guildConfigDoc ? guildConfigDoc.toObject() : {}

    return {
        locale: doc.locale ?? DEFAULT_GUILD_CONFIG.locale,
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

async function getGuildLocale(guild) {
    try {
        const guildConfigDoc = await guildConfigModel.findOne({guildId: guild.id})
        if (guildConfigDoc?.locale) return guildConfigDoc.locale

        const detected = mapDiscordLocale(guild.preferredLocale)
        await guildConfigModel.findOneAndUpdate(
            {guildId: guild.id},
            {$set: {locale: detected}},
            {upsert: true, setDefaultsOnInsert: true}
        )

        return detected
    } catch (error) {
        logger.error('Error al obtener el idioma del guild:', error)
        throw error
    }
}

async function setGuildLocale(guildId, locale) {
    try {
        const guildConfigDoc = await guildConfigModel.findOneAndUpdate(
            {guildId},
            {$set: {locale}},
            {upsert: true, new: true, setDefaultsOnInsert: true}
        )

        return mergeWithDefaults(guildConfigDoc)
    } catch (error) {
        logger.error('Error al configurar el idioma del guild:', error)
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

module.exports = {getGuildConfig, updateGuildConfig, addLevelRole, getGuildLocale, setGuildLocale}
