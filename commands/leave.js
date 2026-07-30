const {SlashCommandBuilder} = require('discord.js');
const {getQueue, destroyQueue} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Desconecta al bot del canal de voz.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        destroyQueue(interaction.guild.id);
        return interaction.reply(t(interaction.appLocale, 'music.left'));
    },
};
