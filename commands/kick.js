const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {createCase} = require('../controllers/moderationController');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('Razón de la expulsión').setRequired(true)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon');
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!targetMember) {
                return interaction.reply('Ese usuario no se encuentra en el servidor.');
            }

            if (!targetMember.kickable) {
                return interaction.reply('No tengo permisos para expulsar a ese usuario.');
            }

            await targetMember.kick(reason);
            await createCase(interaction.client, interaction.guild.id, targetUser.id, interaction.user.id, 'kick', reason);

            return interaction.reply(`${targetUser} ha sido expulsado. Razón: ${reason}`);
        } catch (error) {
            console.error('Error al procesar el comando "kick":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
