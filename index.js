require('dotenv/config')
const {Client, GatewayIntentBits} = require('discord.js')
const mongoose = require('mongoose')
const express = require('express')
const {loadCommands} = require('./utils/commandLoader')
const {loadEvents} = require('./utils/eventLoader')
const databaseConnect = require('./utils/databaseDriver')
const logger = require('./utils/logger')

const REQUIRED_ENV_VARS = ['TOKEN', 'DB_URL']
const missingEnvVars = REQUIRED_ENV_VARS.filter(name => !process.env[name])

if (missingEnvVars.length > 0) {
    logger.error(`Faltan variables de entorno requeridas: ${missingEnvVars.join(', ')}`)
    process.exit(1)
}

process.on('unhandledRejection', error => logger.error('Promesa rechazada sin manejar:', error))
process.on('uncaughtException', error => logger.error('Excepción no capturada:', error))

const app = express()
const server = app.listen(process.env.PORT || 5000, () => {
    logger.info('Servidor iniciado correctamente...')
})

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
})

async function start() {
    await databaseConnect()
    loadCommands(discordClient)
    loadEvents(discordClient)
    await discordClient.login(process.env.TOKEN)
}

start().catch(error => {
    logger.error('Error al iniciar el bot:', error)
    process.exit(1)
})

async function shutdown(signal) {
    logger.info(`Recibida señal ${signal}, cerrando...`)
    discordClient.destroy()
    await mongoose.connection.close()
    server.close(() => process.exit(0))
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
