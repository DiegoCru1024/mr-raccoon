const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType} = require('discord.js');
const {getGuildConfig, updateGuildConfig, addLevelRole} = require('../controllers/configController');
const {addItem, removeItem} = require('../controllers/shopController');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configura el bot para este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand => subcommand
            .setName('welcome')
            .setDescription('Configura el mensaje de bienvenida.')
            .addChannelOption(option => option.setName('canal').setDescription('Canal donde se enviará la bienvenida').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addStringOption(option => option.setName('mensaje').setDescription('Mensaje de bienvenida. Placeholders: {user} {username} {server}').setRequired(true))
            .addBooleanOption(option => option.setName('activo').setDescription('Activa o desactiva la bienvenida').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('farewell')
            .setDescription('Configura el mensaje de despedida.')
            .addChannelOption(option => option.setName('canal').setDescription('Canal donde se enviará la despedida').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addStringOption(option => option.setName('mensaje').setDescription('Mensaje de despedida. Placeholders: {user} {username} {server}').setRequired(true))
            .addBooleanOption(option => option.setName('activo').setDescription('Activa o desactiva la despedida').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('logs')
            .setDescription('Configura el canal de logs de moderación.')
            .addChannelOption(option => option.setName('canal').setDescription('Canal de logs').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('levelrole')
            .setDescription('Asigna un rol que se otorga al alcanzar un nivel.')
            .addIntegerOption(option => option.setName('nivel').setDescription('Nivel requerido').setRequired(true).setMinValue(1))
            .addRoleOption(option => option.setName('rol').setDescription('Rol a otorgar').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName('view')
            .setDescription('Muestra la configuración actual del servidor.'))
        .addSubcommand(subcommand => subcommand
            .setName('shop-add')
            .setDescription('Agrega un artículo a la tienda del servidor.')
            .addStringOption(option => option.setName('nombre').setDescription('Nombre del artículo').setRequired(true))
            .addIntegerOption(option => option.setName('precio').setDescription('Precio en Cosmic Coins').setRequired(true).setMinValue(1))
            .addRoleOption(option => option.setName('rol').setDescription('Rol que se otorga al comprarlo').setRequired(true))
            .addStringOption(option => option.setName('descripcion').setDescription('Descripción del artículo')))
        .addSubcommand(subcommand => subcommand
            .setName('shop-remove')
            .setDescription('Elimina un artículo de la tienda del servidor.')
            .addStringOption(option => option.setName('id').setDescription('ID del artículo (visto en /shop)').setRequired(true))),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const guildId = interaction.guild.id;

            if (subcommand === 'welcome') {
                const canal = interaction.options.getChannel('canal');
                const mensaje = interaction.options.getString('mensaje');
                const activo = interaction.options.getBoolean('activo');

                await updateGuildConfig(guildId, {welcome: {enabled: activo, channelId: canal.id, message: mensaje}});
                return interaction.reply(`Bienvenida ${activo ? 'activada' : 'desactivada'} en ${canal}.`);
            }

            if (subcommand === 'farewell') {
                const canal = interaction.options.getChannel('canal');
                const mensaje = interaction.options.getString('mensaje');
                const activo = interaction.options.getBoolean('activo');

                await updateGuildConfig(guildId, {farewell: {enabled: activo, channelId: canal.id, message: mensaje}});
                return interaction.reply(`Despedida ${activo ? 'activada' : 'desactivada'} en ${canal}.`);
            }

            if (subcommand === 'logs') {
                const canal = interaction.options.getChannel('canal');

                await updateGuildConfig(guildId, {moderation: {logChannelId: canal.id}});
                return interaction.reply(`Canal de logs de moderación configurado en ${canal}.`);
            }

            if (subcommand === 'levelrole') {
                const nivel = interaction.options.getInteger('nivel');
                const rol = interaction.options.getRole('rol');

                await addLevelRole(guildId, nivel, rol.id);
                return interaction.reply(`El rol ${rol} se otorgará al alcanzar el nivel ${nivel}.`);
            }

            if (subcommand === 'view') {
                const config = await getGuildConfig(guildId);

                const configEmbed = new EmbedBuilder()
                    .setColor(0x6400c8)
                    .setTitle(`Configuración de ${interaction.guild.name}`)
                    .addFields(
                        {name: 'Bienvenida', value: `Activo: ${config.welcome.enabled}\nCanal: ${config.welcome.channelId ? `<#${config.welcome.channelId}>` : 'Ninguno'}\nMensaje: ${config.welcome.message}`},
                        {name: 'Despedida', value: `Activo: ${config.farewell.enabled}\nCanal: ${config.farewell.channelId ? `<#${config.farewell.channelId}>` : 'Ninguno'}\nMensaje: ${config.farewell.message}`},
                        {name: 'Moderación', value: `Canal de logs: ${config.moderation.logChannelId ? `<#${config.moderation.logChannelId}>` : 'Ninguno'}`},
                        {name: 'Niveles', value: `Anuncios: ${config.leveling.announceLevelUp}\nRoles por nivel: ${config.leveling.levelRoles.length ? config.leveling.levelRoles.map(levelRole => `Nivel ${levelRole.level} → <@&${levelRole.roleId}>`).join('\n') : 'Ninguno'}`}
                    );

                return interaction.reply({embeds: [configEmbed]});
            }

            if (subcommand === 'shop-add') {
                const nombre = interaction.options.getString('nombre');
                const precio = interaction.options.getInteger('precio');
                const rol = interaction.options.getRole('rol');
                const descripcion = interaction.options.getString('descripcion');

                const item = await addItem(guildId, nombre, descripcion, precio, rol.id);
                return interaction.reply(`Artículo **${item.name}** agregado a la tienda (ID: \`${item._id}\`).`);
            }

            if (subcommand === 'shop-remove') {
                const itemId = interaction.options.getString('id');

                const item = await removeItem(guildId, itemId);
                return interaction.reply(`Artículo **${item.name}** eliminado de la tienda.`);
            }
        } catch (error) {
            console.error('Error al procesar el comando "config":', error);
            return interaction.reply('Ocurrió un error al procesar el comando.');
        }
    },
};
