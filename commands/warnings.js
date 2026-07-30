const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const {getCases} = require('../controllers/moderationController');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Muestra el historial de moderación de un usuario.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar').setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const cases = await getCases(interaction.guild.id, targetUser.id);

            if (!cases.length) {
                return interaction.reply(t(interaction.appLocale, 'warnings.empty', {user: `${targetUser}`}));
            }

            const historyEmbed = new EmbedBuilder()
                .setColor(0xc80000)
                .setTitle(t(interaction.appLocale, 'warnings.title', {username: targetUser.username}))
                .setDescription(cases.map(moderationCase =>
                    `**${moderationCase.type.toUpperCase()}** — ${moderationCase.reason} (<@${moderationCase.moderatorId}>, ${moderationCase.createdAt.toLocaleDateString(interaction.appLocale)})`
                ).join('\n'));

            return interaction.reply({embeds: [historyEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "warnings":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
