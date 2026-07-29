const {SlashCommandBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");

const WORK_COOLDOWN = 2 * 60 * 60 * 1000;
const WORK_MESSAGES = [
    'Trabajaste reciclando latas y ganaste',
    'Ayudaste a limpiar el bosque y ganaste',
    'Hiciste unas changas en el pueblo y ganaste',
    'Encontraste monedas mientras revisabas la basura y ganaste'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabaja para ganar Cosmic Coins.'),
    async execute(interaction) {
        try {
            const userData = await guildUserModel.findOne({guildId: interaction.guild.id, userId: interaction.user.id});
            const lastWorkTime = userData?.lastWork || 0;
            const elapsedTime = Date.now() - lastWorkTime;

            if (elapsedTime < WORK_COOLDOWN) {
                const remainingTime = WORK_COOLDOWN - elapsedTime;
                const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
                const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply(`Ya trabajaste recientemente. Vuelve en ${remainingHours} horas y ${remainingMinutes} minutos.`);
            }

            const currencyReward = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
            const message = WORK_MESSAGES[Math.floor(Math.random() * WORK_MESSAGES.length)];

            userData.currency += currencyReward;
            userData.lastWork = Date.now();
            await userData.save();

            return interaction.reply(`${message} ${currencyReward} Cosmic Coins.`);
        } catch (error) {
            console.error('Error al procesar el comando "work":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
