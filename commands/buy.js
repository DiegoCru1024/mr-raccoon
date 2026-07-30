const {SlashCommandBuilder} = require('discord.js');
const {buyItem} = require("../controllers/shopController");
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra un artículo de la tienda del servidor.')
        .addStringOption(option => option.setName('id').setDescription('ID del artículo (visto en /shop)').setRequired(true)),
    async execute(interaction) {
        try {
            const itemId = interaction.options.getString('id');
            const item = await buyItem(interaction.guild.id, interaction.user.id, itemId, interaction.member);

            return interaction.reply(t(interaction.appLocale, 'buy.success', {name: item.name, price: item.price}));
        } catch (error) {
            const errorKeys = {
                ITEM_NOT_FOUND: 'buy.itemNotFound',
                ALREADY_OWNED: 'buy.alreadyOwned',
                INSUFFICIENT_FUNDS: 'common.insufficientFunds',
                NOT_REGISTERED: 'common.notRegistered',
            };

            if (errorKeys[error.message]) {
                return interaction.reply(t(interaction.appLocale, errorKeys[error.message]));
            }

            console.error('Error al procesar el comando "buy":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
