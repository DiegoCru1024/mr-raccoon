const {SlashCommandBuilder} = require('discord.js');
const {addCurrency, subtractCurrency} = require("../controllers/economyController");

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
                return interaction.reply(`${spinDisplay}\n¡Combinación perfecta! Ganaste ${winnings} Cosmic Coins.`);
            }

            if (twoMatch) {
                const winnings = Math.floor(apuesta * DOUBLE_PAYOUT_RATIO);
                await addCurrency(interaction.guild.id, interaction.user.id, winnings);
                return interaction.reply(`${spinDisplay}\nDos símbolos coincidieron. Ganaste ${winnings} Cosmic Coins.`);
            }

            return interaction.reply(`${spinDisplay}\nSin suerte esta vez. Perdiste ${apuesta} Cosmic Coins.`);
        } catch (error) {
            if (error.message === 'Saldo insuficiente.' || error.message === 'El usuario no está registrado.') {
                return interaction.reply(error.message);
            }

            console.error('Error al procesar el comando "slots":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
