const {SlashCommandBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina el número definido de mensajes.')
        .addIntegerOption(option => option.setName('cantidad').setDescription('Cantidad de mensajes a eliminar').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply('¡No tienes permisos para usar este comando!');
        }

        const cantidad = interaction.options.getInteger('cantidad')
        const canal = interaction.channel

        await canal.bulkDelete(cantidad).then(messages => {
            interaction.reply(`Se eliminaron ${messages.size} mensajes.`)
        }).catch((error) => {
            if (error.rawError.code === 50034) {
                interaction.reply('Solo pueden borrarse mensajes con menos de 14 días de antigüedad.')
                return
            }

            interaction.reply('Ha ocurrido un error al borrar los mensajes.')
        })
    },
};