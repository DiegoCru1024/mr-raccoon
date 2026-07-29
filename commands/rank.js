const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {getLevelFromExperience, getExperienceForLevel} = require("../controllers/levelController");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra tu nivel y experiencia.')
        .addUserOption(option => option.setName('usuario').setDescription('Usuario a consultar')),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario') ?? interaction.user;
            const guildUserData = await guildUserModel.findOne({guildId: interaction.guild.id, userId: targetUser.id});

            if (!guildUserData) {
                return interaction.reply('Ese usuario todavía no tiene experiencia registrada.');
            }

            const level = getLevelFromExperience(guildUserData.experience);
            const experienceForNextLevel = getExperienceForLevel(level + 1);
            const experienceMissing = experienceForNextLevel - guildUserData.experience;

            const rankEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(`Rango de ${targetUser.username}`)
                .setThumbnail(targetUser.avatarURL())
                .addFields(
                    {name: 'Nivel', value: `${level}`, inline: true},
                    {name: 'Experiencia', value: `${guildUserData.experience}`, inline: true},
                    {name: 'Para el siguiente nivel', value: `${experienceMissing}`, inline: true}
                );

            return interaction.reply({embeds: [rankEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "rank":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
