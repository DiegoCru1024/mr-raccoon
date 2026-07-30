const {SlashCommandBuilder} = require('discord.js');
const {getQueue, skip} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción de la cola.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue || !queue.current) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        const skippedTitle = queue.current.title;
        skip(interaction.guild.id);
        return interaction.reply(t(interaction.appLocale, 'music.skipped', {title: skippedTitle}));
    },
};
