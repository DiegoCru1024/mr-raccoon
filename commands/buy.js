const {SlashCommandBuilder} = require('discord.js');
const {buyItem} = require("../controllers/shopController");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la tienda del servidor.')
        .addStringOption(option => option.setName('id').setDescription('ID del artículo (visto en /shop)').setRequired(true)),
    async execute(interaction) {
        try {
            const itemId = interaction.options.getString('id');
            const item = await buyItem(interaction.guild.id, interaction.user.id, itemId, interaction.member);

            return interaction.reply(`Compraste **${item.name}** por ${item.price} Cosmic Coins.`);
        } catch (error) {
            if (['El artículo no existe en la tienda de este servidor.', 'Ya tienes ese artículo.', 'Saldo insuficiente.', 'El usuario no está registrado.'].includes(error.message)) {
                return interaction.reply(error.message);
            }

            console.error('Error al procesar el comando "buy":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
