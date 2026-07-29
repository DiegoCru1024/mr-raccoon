const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar de un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar')),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario') ?? interaction.user;

            const avatarEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(`Avatar de ${targetUser.username}`)
                .setImage(targetUser.avatarURL({size: 1024}));

            return interaction.reply({embeds: [avatarEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "avatar":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
