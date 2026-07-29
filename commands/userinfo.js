const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

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
                .setTitle(`Información de ${targetUser.username}`)
                .setThumbnail(targetUser.avatarURL())
                .addFields(
                    {name: 'ID', value: targetUser.id, inline: true},
                    {name: 'Cuenta creada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true}
                );

            if (targetMember) {
                userinfoEmbed.addFields(
                    {name: 'Se unió al servidor', value: `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:F>`, inline: true},
                    {name: 'Roles', value: targetMember.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => `${role}`).join(' ') || 'Ninguno'}
                );
            }

            return interaction.reply({embeds: [userinfoEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "userinfo":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
