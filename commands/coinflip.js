const {SlashCommandBuilder} = require('discord.js');
const {addCurrency, subtractCurrency} = require("../controllers/economyController");
const {t} = require('../utils/i18n');

const EDGE_PROBABILITY = 0.001;
const EDGE_PAYOUT_RATIO = 10;
const WIN_PAYOUT_RATIO = 1;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Apuesta Cosmic Coins en un lanzamiento de moneda.')
        .addIntegerOption(option => option.setName('apuesta').setDescription('Cantidad a apostar').setRequired(true).setMinValue(10))
        .addStringOption(option => option.setName('lado')
            .setDescription('Elige un lado')
            .setRequired(true)
            .addChoices(
                {name: 'Cara', value: 'cara'},
                {name: 'Cruz', value: 'cruz'}
            )),
    async execute(interaction) {
        try {
            const apuesta = interaction.options.getInteger('apuesta');
            const lado = interaction.options.getString('lado');

            if (Math.random() < EDGE_PROBABILITY) {
                const winnings = Math.floor(apuesta * EDGE_PAYOUT_RATIO);
                await addCurrency(interaction.guild.id, interaction.user.id, winnings);
                return interaction.reply(t(interaction.appLocale, 'coinflip.edge', {amount: winnings}));
            }

            const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
            const resultadoLabel = t(interaction.appLocale, resultado === 'cara' ? 'coinflip.heads' : 'coinflip.tails');

            if (resultado === lado) {
                const winnings = Math.floor(apuesta * WIN_PAYOUT_RATIO);
                await addCurrency(interaction.guild.id, interaction.user.id, winnings);
                return interaction.reply(t(interaction.appLocale, 'coinflip.win', {result: resultadoLabel, amount: winnings}));
            }

            await subtractCurrency(interaction.guild.id, interaction.user.id, apuesta);
            return interaction.reply(t(interaction.appLocale, 'coinflip.lose', {result: resultadoLabel, amount: apuesta}));
        } catch (error) {
            if (error.message === 'INSUFFICIENT_FUNDS') {
                return interaction.reply(t(interaction.appLocale, 'common.insufficientFunds'));
            }
            if (error.message === 'NOT_REGISTERED') {
                return interaction.reply(t(interaction.appLocale, 'common.notRegistered'));
            }

            console.error('Error al procesar el comando "coinflip":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
