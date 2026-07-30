const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {listItems} = require("../controllers/shopController");
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Muestra la tienda de este servidor.'),
    async execute(interaction) {
        try {
            const items = await listItems(interaction.guild.id);

            if (!items.length) {
                return interaction.reply(t(interaction.appLocale, 'shop.empty'));
            }

            const shopEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(t(interaction.appLocale, 'shop.title', {guild: interaction.guild.name}))
                .setDescription(items.map(item =>
                    `**${item.name}** — ${item.price} Cosmic Coins\nID: \`${item._id}\`${item.description ? `\n${item.description}` : ''}`
                ).join('\n\n'));

            return interaction.reply({embeds: [shopEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "shop":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
