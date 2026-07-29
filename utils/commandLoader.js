const {Collection} = require('discord.js');
const {loadDirectory} = require('./fileLoader');

function loadCommands(botClient) {
    botClient.commands = new Collection();

    loadDirectory('commands', 'Comando', command => {
        if (!command || !('data' in command) || !('execute' in command)) {
            return 'Error: Estructura de comando inválida';
        }

        botClient.commands.set(command.data.name, command);
        return 'Éxito';
    });
}

module.exports = {loadCommands};
