const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {createCase} = require('../controllers/moderationController');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a banear').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Razón del baneo').setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon');
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (targetMember && !targetMember.bannable) {
                return interaction.reply(t(interaction.appLocale, 'ban.notBannable'));
            }

            await interaction.guild.members.ban(targetUser.id, {reason});
            await createCase(interaction.client, interaction.guild.id, targetUser.id, interaction.user.id, 'ban', reason);

            return interaction.reply(t(interaction.appLocale, 'ban.success', {user: `${targetUser}`, reason}));
        } catch (error) {
            console.error('Error al procesar el comando "ban":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
