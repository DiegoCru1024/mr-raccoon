const {SlashCommandBuilder} = require('discord.js');
const {getQueue, resume} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la reproducción pausada.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue || !queue.current) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        resume(interaction.guild.id);
        return interaction.reply(t(interaction.appLocale, 'music.resumed'));
    },
};
