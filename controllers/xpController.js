const {guildUserModel} = require("../models/guildUserSchema")
const logger = require("../utils/logger")

async function xpController(guildId, userId) {
    try {
        const guildUserData = await guildUserModel.findOne({guildId: guildId, userId: userId})
        if (guildUserData) {
            const previousExperience = guildUserData.experience
            guildUserData.experience += Math.floor(Math.random() * 100)
            await guildUserData.save()
            return {previousExperience, experience: guildUserData.experience}
        }
    } catch (error) {
        logger.error('Error al actualizar la experiencia del usuario:', error)
        throw error
    }
}

module.exports = {xpController}
