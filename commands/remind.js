const {SlashCommandBuilder} = require('discord.js');
const {createReminder} = require('../controllers/reminderController');
const {t} = require('../utils/i18n');

const DURATION_UNITS = {m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000};

function parseDuration(input) {
    const match = /^(\d+)(m|h|d)$/.exec(input.trim());
    if (!match) return null;

    const [, amount, unit] = match;
    return Number(amount) * DURATION_UNITS[unit];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Crea un recordatorio.')
        .addStringOption(option => option.setName('tiempo').setDescription('Ej: 10m, 2h, 1d').setRequired(true))
        .addStringOption(option => option.setName('mensaje').setDescription('Mensaje del recordatorio').setRequired(true)),
    async execute(interaction) {
        try {
            const tiempo = interaction.options.getString('tiempo');
            const mensaje = interaction.options.getString('mensaje');
            const durationMs = parseDuration(tiempo);

            if (!durationMs) {
                return interaction.reply(t(interaction.appLocale, 'remind.invalidFormat'));
            }

            const remindAt = new Date(Date.now() + durationMs);
            await createReminder(interaction.user.id, interaction.guild.id, interaction.channel.id, mensaje, remindAt);

            return interaction.reply(t(interaction.appLocale, 'remind.confirmation', {message: mensaje, timestamp: Math.floor(remindAt.getTime() / 1000)}));
        } catch (error) {
            console.error('Error al procesar el comando "remind":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
