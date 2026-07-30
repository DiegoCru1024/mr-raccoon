const {SlashCommandBuilder} = require('discord.js');
const {addCurrency, subtractCurrency} = require("../controllers/economyController");
const {t} = require('../utils/i18n');

const SYMBOLS = ['🍒', '🍋', '🔔', '⭐', '💎'];
const TRIPLE_PAYOUT_RATIO = 5;
const DOUBLE_PAYOUT_RATIO = 1.5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Apuesta Cosmic Coins en la tragamonedas.')
        .addIntegerOption(option => option.setName('apuesta').setDescription('Cantidad a apostar').setRequired(true).setMinValue(10)),
    async execute(interaction) {
        try {
            const apuesta = interaction.options.getInteger('apuesta');
            const spin = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            const spinDisplay = spin.join(' | ');

            const allMatch = spin[0] === spin[1] && spin[1] === spin[2];
            const twoMatch = !allMatch && (spin[0] === spin[1] || spin[1] === spin[2] || spin[0] === spin[2]);

            await subtractCurrency(interaction.guild.id, interaction.user.id, apuesta);

            if (allMatch) {
                const winnings = Math.floor(apuesta * TRIPLE_PAYOUT_RATIO);
                await addCurrency(interaction.guild.id, interaction.user.id, winnings);
                return interaction.reply(t(interaction.appLocale, 'slots.allMatch', {spin: spinDisplay, amount: winnings}));
            }

            if (twoMatch) {
                const winnings = Math.floor(apuesta * DOUBLE_PAYOUT_RATIO);
                await addCurrency(interaction.guild.id, interaction.user.id, winnings);
                return interaction.reply(t(interaction.appLocale, 'slots.twoMatch', {spin: spinDisplay, amount: winnings}));
            }

            return interaction.reply(t(interaction.appLocale, 'slots.noMatch', {spin: spinDisplay, amount: apuesta}));
        } catch (error) {
            if (error.message === 'INSUFFICIENT_FUNDS') {
                return interaction.reply(t(interaction.appLocale, 'common.insufficientFunds'));
            }
            if (error.message === 'NOT_REGISTERED') {
                return interaction.reply(t(interaction.appLocale, 'common.notRegistered'));
            }

            console.error('Error al procesar el comando "slots":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
