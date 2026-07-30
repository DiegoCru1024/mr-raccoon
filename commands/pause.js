const {SlashCommandBuilder} = require('discord.js');
const {getQueue, pause} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa la reproducción actual.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue || !queue.current) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        pause(interaction.guild.id);
        return interaction.reply(t(interaction.appLocale, 'music.paused'));
    },
};
