const {guildUserModel} = require("../models/guildUserSchema")
const logger = require("../utils/logger")

const XP_COOLDOWN = 45 * 1000

async function xpController(guildId, userId) {
    try {
        const guildUserData = await guildUserModel.findOne({guildId: guildId, userId: userId})
        if (guildUserData) {
            const lastXpTime = guildUserData.lastXpAt || 0
            if (Date.now() - lastXpTime < XP_COOLDOWN) {
                return null
            }

            const previousExperience = guildUserData.experience
            guildUserData.experience += Math.floor(Math.random() * 100)
            guildUserData.lastXpAt = Date.now()
            await guildUserData.save()
            return {previousExperience, experience: guildUserData.experience}
        }
    } catch (error) {
        logger.error('Error al actualizar la experiencia del usuario:', error)
        throw error
    }
}

module.exports = {xpController}
