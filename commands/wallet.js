const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Te muestra la información de tu billetera.'),
    async execute(interaction) {
        try {
            const guildUserData = await guildUserModel.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            });

            if (!guildUserData) {
                return interaction.reply(t(interaction.appLocale, 'wallet.notRegistered'));
            }

            const walletEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(t(interaction.appLocale, 'wallet.title', {username: interaction.user.username}))
                .setDescription(t(interaction.appLocale, 'wallet.description', {currency: guildUserData.currency}))
                .setThumbnail(interaction.user.avatarURL())
            return interaction.reply({embeds: [walletEmbed]})
        } catch (error) {
            console.error('Error al procesar el comando "wallet":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};