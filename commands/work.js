const {SlashCommandBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {t} = require('../utils/i18n');

const WORK_COOLDOWN = 2 * 60 * 60 * 1000;

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
                return interaction.reply(t(interaction.appLocale, 'work.cooldown', {hours: remainingHours, minutes: remainingMinutes}));
            }

            const currencyReward = Math.floor(Math.random() * (100 - 30 + 1)) + 30;
            const workMessages = t(interaction.appLocale, 'work.messages');
            const message = workMessages[Math.floor(Math.random() * workMessages.length)];

            userData.currency += currencyReward;
            userData.lastWork = Date.now();
            await userData.save();

            return interaction.reply(t(interaction.appLocale, 'work.result', {message, amount: currencyReward}));
        } catch (error) {
            console.error('Error al procesar el comando "work":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
