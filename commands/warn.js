const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {createCase} = require('../controllers/moderationController');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a advertir').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Razón de la advertencia').setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon');

            await createCase(interaction.client, interaction.guild.id, targetUser.id, interaction.user.id, 'warn', reason);

            return interaction.reply(t(interaction.appLocale, 'warn.success', {user: `${targetUser}`, reason}));
        } catch (error) {
            console.error('Error al procesar el comando "warn":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
