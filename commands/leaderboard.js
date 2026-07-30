const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {getLevelFromExperience} = require("../controllers/levelController");
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Muestra la tabla de clasificación del servidor.')
        .addStringOption(option => option.setName('tipo')
            .setDescription('Clasificar por experiencia o monedas')
            .addChoices(
                {name: 'Experiencia', value: 'xp'},
                {name: 'Monedas', value: 'monedas'}
            )),
    async execute(interaction) {
        try {
            const tipo = interaction.options.getString('tipo') ?? 'xp';
            const sortField = tipo === 'monedas' ? 'currency' : 'experience';

            const topUsers = await guildUserModel
                .find({guildId: interaction.guild.id})
                .sort({[sortField]: -1})
                .limit(10);

            if (!topUsers.length) {
                return interaction.reply(t(interaction.appLocale, 'leaderboard.empty'));
            }

            const description = (await Promise.all(topUsers.map(async (guildUserData, index) => {
                const member = await interaction.guild.members.fetch(guildUserData.userId).catch(() => null);
                const name = member ? member.user.username : `${t(interaction.appLocale, 'common.unknown')} ${guildUserData.userId}`;
                const value = sortField === 'currency'
                    ? `${guildUserData.currency} Cosmic Coins`
                    : t(interaction.appLocale, 'leaderboard.levelEntry', {level: getLevelFromExperience(guildUserData.experience), xp: guildUserData.experience});

                return `**${index + 1}.** ${name} — ${value}`;
            }))).join('\n');

            const typeLabel = t(interaction.appLocale, tipo === 'monedas' ? 'leaderboard.typeCurrency' : 'leaderboard.typeXp');
            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(t(interaction.appLocale, 'leaderboard.title', {guild: interaction.guild.name, type: typeLabel}))
                .setDescription(description);

            return interaction.reply({embeds: [leaderboardEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "leaderboard":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
