const {SlashCommandBuilder} = require('discord.js');
const {transferCurrency} = require("../controllers/economyController");
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Transfiere Cosmic Coins a otro usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a quien transferir').setRequired(true))
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad a transferir').setRequired(true).setMinValue(1)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const amount = interaction.options.getInteger('cantidad');

            if (targetUser.id === interaction.user.id) {
                return interaction.reply(t(interaction.appLocale, 'pay.selfTransfer'));
            }

            if (targetUser.bot) {
                return interaction.reply(t(interaction.appLocale, 'pay.botTransfer'));
            }

            await transferCurrency(interaction.guild.id, interaction.user.id, targetUser.id, amount);

            return interaction.reply(t(interaction.appLocale, 'pay.success', {amount, user: `${targetUser}`}));
        } catch (error) {
            if (error.message === 'INSUFFICIENT_FUNDS') {
                return interaction.reply(t(interaction.appLocale, 'common.insufficientFunds'));
            }
            if (error.message === 'NOT_REGISTERED') {
                return interaction.reply(t(interaction.appLocale, 'common.notRegistered'));
            }

            console.error('Error al procesar el comando "pay":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
