const {SlashCommandBuilder} = require('discord.js');
const {getQueue, stop} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la música y vacía la cola.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        stop(interaction.guild.id);
        return interaction.reply(t(interaction.appLocale, 'music.stopped'));
    },
};
