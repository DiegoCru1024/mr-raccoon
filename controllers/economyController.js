const {guildUserModel} = require("../models/guildUserSchema")
const logger = require("../utils/logger")

async function addCurrency(guildId, userId, amount) {
    try {
        const guildUserData = await guildUserModel.findOne({guildId, userId})
        if (!guildUserData) {
            throw new Error('NOT_REGISTERED')
        }

        guildUserData.currency += amount
        await guildUserData.save()
        return guildUserData
    } catch (error) {
        logger.error('Error al agregar monedas:', error)
        throw error
    }
}

async function subtractCurrency(guildId, userId, amount) {
    try {
        const guildUserData = await guildUserModel.findOne({guildId, userId})
        if (!guildUserData) {
            throw new Error('NOT_REGISTERED')
        }

        if (guildUserData.currency < amount) {
            throw new Error('INSUFFICIENT_FUNDS')
        }

        guildUserData.currency -= amount
        await guildUserData.save()
        return guildUserData
    } catch (error) {
        logger.error('Error al descontar monedas:', error)
        throw error
    }
}

async function transferCurrency(guildId, fromUserId, toUserId, amount) {
    await subtractCurrency(guildId, fromUserId, amount)
    await addCurrency(guildId, toUserId, amount)
}

module.exports = {addCurrency, subtractCurrency, transferCurrency}
