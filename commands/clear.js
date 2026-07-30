const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina el número definido de mensajes.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad de mensajes a eliminar').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const cantidad = interaction.options.getInteger('cantidad')
        const canal = interaction.channel

        await canal.bulkDelete(cantidad).then(messages => {
            interaction.reply(t(interaction.appLocale, 'clear.success', {count: messages.size}))
        }).catch((error) => {
            if (error.rawError.code === 50034) {
                interaction.reply(t(interaction.appLocale, 'clear.tooOld'))
                return
            }

            interaction.reply(t(interaction.appLocale, 'clear.error'))
        })
    },
};