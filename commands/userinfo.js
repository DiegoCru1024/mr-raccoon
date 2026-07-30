const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información de un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar')),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario') ?? interaction.user;
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            const userinfoEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(t(interaction.appLocale, 'userinfo.title', {username: targetUser.username}))
                .setThumbnail(targetUser.avatarURL())
                .addFields(
                    {name: t(interaction.appLocale, 'userinfo.id'), value: targetUser.id, inline: true},
                    {name: t(interaction.appLocale, 'userinfo.accountCreated'), value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true}
                );

            if (targetMember) {
                userinfoEmbed.addFields(
                    {name: t(interaction.appLocale, 'userinfo.joinedServer'), value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:F>`, inline: true},
                    {name: t(interaction.appLocale, 'userinfo.roles'), value: targetMember.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => `${role}`).join(' ') || t(interaction.appLocale, 'common.none')}
                );
            }

            return interaction.reply({embeds: [userinfoEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "userinfo":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
