const {SlashCommandBuilder} = require('discord.js');
const {transferCurrency} = require("../controllers/economyController");

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
                return interaction.reply('No puedes transferirte monedas a ti mismo.');
            }

            if (targetUser.bot) {
                return interaction.reply('No puedes transferirle monedas a un bot.');
            }

            await transferCurrency(interaction.guild.id, interaction.user.id, targetUser.id, amount);

            return interaction.reply(`Transferiste ${amount} Cosmic Coins a ${targetUser}.`);
        } catch (error) {
            if (error.message === 'Saldo insuficiente.' || error.message === 'El usuario no está registrado.') {
                return interaction.reply(error.message);
            }

            console.error('Error al procesar el comando "pay":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
