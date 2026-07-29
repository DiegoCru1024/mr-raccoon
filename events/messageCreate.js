const {Events} = require('discord.js')
const {verifyUser} = require("../controllers/userController");
const {xpController} = require("../controllers/xpController");
const logger = require("../utils/logger");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot || !message.guild) return

            await verifyUser(message.client, message.guild.id, message.author.id)
            await xpController(message.guild.id, message.author.id)
        } catch (error) {
            logger.error('Error al manejar el evento messageCreate:', error)
        }
    },
}
