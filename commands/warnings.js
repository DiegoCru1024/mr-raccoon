const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const {getCases} = require('../controllers/moderationController');

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
                return interaction.reply(`${targetUser} no tiene casos de moderación registrados.`);
            }

            const historyEmbed = new EmbedBuilder()
                .setColor(0xc80000)
                .setTitle(`Historial de moderación de ${targetUser.username}`)
                .setDescription(cases.map(moderationCase =>
                    `**${moderationCase.type.toUpperCase()}** — ${moderationCase.reason} (<@${moderationCase.moderatorId}>, ${moderationCase.createdAt.toLocaleDateString()})`
                ).join('\n'));

            return interaction.reply({embeds: [historyEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "warnings":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
