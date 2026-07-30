const {getDueReminders, deleteReminder} = require('../controllers/reminderController')
const {getGuildConfig} = require('../controllers/configController')
const {t} = require('./i18n')
const logger = require('./logger')

const CHECK_INTERVAL = 30 * 1000

function startReminderScheduler(client) {
    setInterval(async () => {
        try {
            const dueReminders = await getDueReminders()

            for (const reminder of dueReminders) {
                await dispatchReminder(client, reminder)
                await deleteReminder(reminder._id)
            }
        } catch (error) {
            logger.error('Error al procesar los recordatorios pendientes:', error)
        }
    }, CHECK_INTERVAL)
}

async function dispatchReminder(client, reminder) {
    try {
        const channel = await client.channels.fetch(reminder.channelId).catch(() => null)
        const config = await getGuildConfig(reminder.guildId)
        const content = t(config.locale, 'remind.deliveryContent', {user: `<@${reminder.userId}>`, message: reminder.message})

        if (channel) {
            await channel.send(content)
            return
        }

        const user = await client.users.fetch(reminder.userId).catch(() => null)
        if (user) {
            await user.send(content).catch(() => null)
        }
    } catch (error) {
        logger.warn(`No se pudo enviar el recordatorio ${reminder._id}: ${error.message}`)
    }
}

module.exports = {startReminderScheduler}
