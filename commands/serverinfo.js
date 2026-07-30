const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información del servidor.'),
    async execute(interaction) {
        try {
            const guild = interaction.guild;

            const serverinfoEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL())
                .addFields(
                    {name: t(interaction.appLocale, 'serverinfo.owner'), value: `<@${guild.ownerId}>`, inline: true},
                    {name: t(interaction.appLocale, 'serverinfo.members'), value: `${guild.memberCount}`, inline: true},
                    {name: t(interaction.appLocale, 'serverinfo.boosts'), value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true},
                    {name: t(interaction.appLocale, 'serverinfo.channels'), value: `${guild.channels.cache.size}`, inline: true},
                    {name: t(interaction.appLocale, 'serverinfo.roles'), value: `${guild.roles.cache.size}`, inline: true},
                    {name: t(interaction.appLocale, 'serverinfo.created'), value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true}
                );

            return interaction.reply({embeds: [serverinfoEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "serverinfo":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
