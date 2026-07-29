const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {listItems} = require("../controllers/shopController");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra la tienda de este servidor.'),
    async execute(interaction) {
        try {
            const items = await listItems(interaction.guild.id);

            if (!items.length) {
                return interaction.reply('Este servidor todavía no tiene artículos en la tienda.');
            }

            const shopEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(`Tienda de ${interaction.guild.name}`)
                .setDescription(items.map(item =>
                    `**${item.name}** — ${item.price} Cosmic Coins\nID: \`${item._id}\`${item.description ? `\n${item.description}` : ''}`
                ).join('\n\n'));

            return interaction.reply({embeds: [shopEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "shop":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
