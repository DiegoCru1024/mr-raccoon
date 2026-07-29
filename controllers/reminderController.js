const {reminderModel} = require("../models/reminderSchema")
const logger = require("../utils/logger")

async function createReminder(userId, guildId, channelId, message, remindAt) {
    try {
        return await new reminderModel({userId, guildId, channelId, message, remindAt}).save()
    } catch (error) {
        logger.error('Error al crear el recordatorio:', error)
        throw error
    }
}

async function getDueReminders() {
    try {
        return await reminderModel.find({remindAt: {$lte: new Date()}})
    } catch (error) {
        logger.error('Error al obtener los recordatorios vencidos:', error)
        throw error
    }
}

async function deleteReminder(reminderId) {
    try {
        await reminderModel.deleteOne({_id: reminderId})
    } catch (error) {
        logger.error('Error al eliminar el recordatorio:', error)
        throw error
    }
}

module.exports = {createReminder, getDueReminders, deleteReminder}
