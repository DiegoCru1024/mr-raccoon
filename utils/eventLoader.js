const {loadDirectory} = require('./fileLoader');

function loadEvents(botClient) {
    loadDirectory('events', 'Evento', event => {
        if (!event || !event.name || !event.execute) {
            return 'Error: Estructura de evento inválida';
        }

        if (event.once) {
            botClient.once(event.name, (...args) => event.execute(...args));
        } else {
            botClient.on(event.name, (...args) => event.execute(...args));
        }

        return 'Éxito';
    });
}

module.exports = {loadEvents};
