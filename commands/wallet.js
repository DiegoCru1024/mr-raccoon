const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");

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
                return interaction.reply('Todavía no estás registrado. Usá algún comando de economía primero.');
            }

            const walletEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(`Billetera de ${interaction.user.username}`)
                .setDescription(`Tienes ${guildUserData.currency} Cosmic Coins :raccoon:`)
                .setThumbnail(interaction.user.avatarURL())
            return interaction.reply({embeds: [walletEmbed]})
        } catch (error) {
            console.error('Error al procesar el comando "wallet":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};