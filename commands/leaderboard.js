const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {getLevelFromExperience} = require("../controllers/levelController");

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
                return interaction.reply('Todavía no hay datos suficientes para mostrar una clasificación.');
            }

            const description = (await Promise.all(topUsers.map(async (guildUserData, index) => {
                const member = await interaction.guild.members.fetch(guildUserData.userId).catch(() => null);
                const name = member ? member.user.username : `Usuario ${guildUserData.userId}`;
                const value = sortField === 'currency'
                    ? `${guildUserData.currency} Cosmic Coins`
                    : `Nivel ${getLevelFromExperience(guildUserData.experience)} (${guildUserData.experience} XP)`;

                return `**${index + 1}.** ${name} — ${value}`;
            }))).join('\n');

            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(`Clasificación de ${interaction.guild.name} — ${tipo === 'monedas' ? 'Monedas' : 'Experiencia'}`)
                .setDescription(description);

            return interaction.reply({embeds: [leaderboardEmbed]});
        } catch (error) {
            console.error('Error al procesar el comando "leaderboard":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
