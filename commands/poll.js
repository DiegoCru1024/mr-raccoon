const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {t} = require('../utils/i18n');

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crea una encuesta con reacciones.')
        .addStringOption(option => option.setName('pregunta').setDescription('Pregunta de la encuesta').setRequired(true))
        .addStringOption(option => option.setName('opcion1').setDescription('Primera opción').setRequired(true))
        .addStringOption(option => option.setName('opcion2').setDescription('Segunda opción').setRequired(true))
        .addStringOption(option => option.setName('opcion3').setDescription('Tercera opción'))
        .addStringOption(option => option.setName('opcion4').setDescription('Cuarta opción'))
        .addStringOption(option => option.setName('opcion5').setDescription('Quinta opción')),
    async execute(interaction) {
        try {
            const pregunta = interaction.options.getString('pregunta');
            const opciones = [1, 2, 3, 4, 5]
                .map(index => interaction.options.getString(`opcion${index}`))
                .filter(Boolean);

            const pollEmbed = new EmbedBuilder()
                .setColor(0x6400c8)
                .setTitle(pregunta)
                .setDescription(opciones.map((opcion, index) => `${NUMBER_EMOJIS[index]} ${opcion}`).join('\n'))
                .setFooter({text: t(interaction.appLocale, 'poll.createdBy', {username: interaction.user.username})});

            await interaction.reply({embeds: [pollEmbed]});
            const pollMessage = await interaction.fetchReply();

            for (let index = 0; index < opciones.length; index++) {
                await pollMessage.react(NUMBER_EMOJIS[index]);
            }
        } catch (error) {
            console.error('Error al procesar el comando "poll":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
