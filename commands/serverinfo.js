const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

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
                    {name: 'Dueño', value: `<@${guild.ownerId}>`, inline: true},
                    {name: 'Miembros', value: `${guild.memberCount}`, inline: true},
                    {name: 'Boosts', value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true},
                    {name: 'Canales', value: `${guild.channels.cache.size}`, inline: true},
                    {name: 'Roles', value: `${guild.roles.cache.size}`, inline: true},
                    {name: 'Creado', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true}
                );

            return interaction.reply({embeds: [serverinfoEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "serverinfo":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
