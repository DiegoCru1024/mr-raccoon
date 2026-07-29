const {Events} = require('discord.js')
const {verifyUser} = require("../controllers/userController");
const {xpController} = require("../controllers/xpController");
const {handleLevelUp} = require("../controllers/levelController");
const logger = require("../utils/logger");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot || !message.guild) return

            await verifyUser(message.client, message.guild.id, message.author.id)
            const xpResult = await xpController(message.guild.id, message.author.id)

            if (xpResult) {
                await handleLevelUp({
                    client: message.client,
                    guildId: message.guild.id,
                    userId: message.author.id,
                    previousExperience: xpResult.previousExperience,
                    newExperience: xpResult.experience,
                    fallbackChannel: message.channel
                })
            }
        } catch (error) {
            logger.error('Error al manejar el evento messageCreate:', error)
        }
    },
}
