const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {getLevelFromExperience, getExperienceForLevel} = require("../controllers/levelController");
const {t} = require('../utils/i18n');

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
                return interaction.reply(t(interaction.appLocale, 'rank.notRegistered'));
            }

            const level = getLevelFromExperience(guildUserData.experience);
            const experienceForNextLevel = getExperienceForLevel(level + 1);
            const experienceMissing = experienceForNextLevel - guildUserData.experience;

            const rankEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(t(interaction.appLocale, 'rank.title', {username: targetUser.username}))
                .setThumbnail(targetUser.avatarURL())
                .addFields(
                    {name: t(interaction.appLocale, 'rank.level'), value: `${level}`, inline: true},
                    {name: t(interaction.appLocale, 'rank.experience'), value: `${guildUserData.experience}`, inline: true},
                    {name: t(interaction.appLocale, 'rank.toNextLevel'), value: `${experienceMissing}`, inline: true}
                );

            return interaction.reply({embeds: [rankEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "rank":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
