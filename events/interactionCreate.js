const {Events} = require('discord.js')
const {verifyUser} = require("../controllers/userController")
const {getGuildLocale} = require("../controllers/configController")
const {t} = require("../utils/i18n")
const logger = require("../utils/logger")

module.exports = {
    name: Events.InteractionCreate,
    async execute(interactionEvent) {
        if (!interactionEvent.isChatInputCommand()) return

        const command = interactionEvent.client.commands.get(interactionEvent.commandName)

        if (!command) {
            logger.warn(`Comando desconocido recibido: ${interactionEvent.commandName}`)
            return
        }

        try {
            interactionEvent.appLocale = await getGuildLocale(interactionEvent.guild)
            await verifyUser(interactionEvent.client, interactionEvent.guild.id, interactionEvent.user.id)
            await command.execute(interactionEvent)
        } catch (error) {
            logger.error(`Error al ejecutar el comando "${interactionEvent.commandName}":`, error)

            const errorReply = {content: t(interactionEvent.appLocale, 'common.genericError'), ephemeral: true}
            if (interactionEvent.deferred || interactionEvent.replied) {
                await interactionEvent.editReply(errorReply)
            } else {
                await interactionEvent.reply(errorReply)
            }
        }
    }
}