const {SlashCommandBuilder} = require('discord.js');
const {addCurrency, subtractCurrency} = require("../controllers/economyController");

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
            const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';

            if (resultado === lado) {
                await addCurrency(interaction.guild.id, interaction.user.id, apuesta);
                return interaction.reply(`La moneda cayó en **${resultado}**. ¡Ganaste ${apuesta} Cosmic Coins!`);
            }

            await subtractCurrency(interaction.guild.id, interaction.user.id, apuesta);
            return interaction.reply(`La moneda cayó en **${resultado}**. Perdiste ${apuesta} Cosmic Coins.`);
        } catch (error) {
            if (error.message === 'Saldo insuficiente.' || error.message === 'El usuario no está registrado.') {
                return interaction.reply(error.message);
            }

            console.error('Error al procesar el comando "coinflip":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
