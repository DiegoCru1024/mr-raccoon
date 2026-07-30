const {SlashCommandBuilder} = require('discord.js');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Te contesta con Pong!'),
    async execute(interaction) {
        await interaction.reply(t(interaction.appLocale, 'ping.response'));
    },
};