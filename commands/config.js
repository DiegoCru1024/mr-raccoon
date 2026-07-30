const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType} = require('discord.js');
const {getGuildConfig, updateGuildConfig, addLevelRole, setGuildLocale} = require('../controllers/configController');
const {addItem, removeItem} = require('../controllers/shopController');
const {t} = require('../utils/i18n');

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
            .setName('language')
            .setDescription('Configura el idioma del bot para este servidor.')
            .addStringOption(option => option.setName('idioma')
                .setDescription('Idioma a utilizar')
                .setRequired(true)
                .addChoices(
                    {name: 'English', value: 'en'},
                    {name: 'Español', value: 'es'}
                )))
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
                const welcomeStatus = t(interaction.appLocale, activo ? 'config.enabled' : 'config.disabled');
                return interaction.reply(t(interaction.appLocale, 'config.welcomeUpdated', {status: welcomeStatus, channel: `${canal}`}));
            }

            if (subcommand === 'farewell') {
                const canal = interaction.options.getChannel('canal');
                const mensaje = interaction.options.getString('mensaje');
                const activo = interaction.options.getBoolean('activo');

                await updateGuildConfig(guildId, {farewell: {enabled: activo, channelId: canal.id, message: mensaje}});
                const farewellStatus = t(interaction.appLocale, activo ? 'config.enabled' : 'config.disabled');
                return interaction.reply(t(interaction.appLocale, 'config.farewellUpdated', {status: farewellStatus, channel: `${canal}`}));
            }

            if (subcommand === 'logs') {
                const canal = interaction.options.getChannel('canal');

                await updateGuildConfig(guildId, {moderation: {logChannelId: canal.id}});
                return interaction.reply(t(interaction.appLocale, 'config.logsUpdated', {channel: `${canal}`}));
            }

            if (subcommand === 'levelrole') {
                const nivel = interaction.options.getInteger('nivel');
                const rol = interaction.options.getRole('rol');

                await addLevelRole(guildId, nivel, rol.id);
                return interaction.reply(t(interaction.appLocale, 'config.levelRoleUpdated', {role: `${rol}`, level: nivel}));
            }

            if (subcommand === 'language') {
                const idioma = interaction.options.getString('idioma');

                await setGuildLocale(guildId, idioma);
                const languageName = t(idioma, `config.languageNames.${idioma}`);
                return interaction.reply(t(idioma, 'config.languageUpdated', {language: languageName}));
            }

            if (subcommand === 'view') {
                const config = await getGuildConfig(guildId);
                const locale = interaction.appLocale;
                const none = t(locale, 'common.none');

                const configEmbed = new EmbedBuilder()
                    .setColor(0x6400c8)
                    .setTitle(t(locale, 'config.viewTitle', {guild: interaction.guild.name}))
                    .addFields(
                        {name: t(locale, 'config.viewWelcome'), value: `${t(locale, 'config.active')}: ${config.welcome.enabled}\n${t(locale, 'config.channel')}: ${config.welcome.channelId ? `<#${config.welcome.channelId}>` : none}\n${t(locale, 'config.message')}: ${config.welcome.message}`},
                        {name: t(locale, 'config.viewFarewell'), value: `${t(locale, 'config.active')}: ${config.farewell.enabled}\n${t(locale, 'config.channel')}: ${config.farewell.channelId ? `<#${config.farewell.channelId}>` : none}\n${t(locale, 'config.message')}: ${config.farewell.message}`},
                        {name: t(locale, 'config.viewModeration'), value: `${t(locale, 'config.logChannel')}: ${config.moderation.logChannelId ? `<#${config.moderation.logChannelId}>` : none}`},
                        {name: t(locale, 'config.viewLeveling'), value: `${t(locale, 'config.announcements')}: ${config.leveling.announceLevelUp}\n${t(locale, 'config.levelRoles')}: ${config.leveling.levelRoles.length ? config.leveling.levelRoles.map(levelRole => `${t(locale, 'rank.level')} ${levelRole.level} → <@&${levelRole.roleId}>`).join('\n') : none}`},
                        {name: t(locale, 'config.viewLanguage'), value: t(locale, `config.languageNames.${locale}`)}
                    );

                return interaction.reply({embeds: [configEmbed]});
            }

            if (subcommand === 'shop-add') {
                const nombre = interaction.options.getString('nombre');
                const precio = interaction.options.getInteger('precio');
                const rol = interaction.options.getRole('rol');
                const descripcion = interaction.options.getString('descripcion');

                const item = await addItem(guildId, nombre, descripcion, precio, rol.id);
                return interaction.reply(t(interaction.appLocale, 'config.itemAdded', {name: item.name, id: item._id}));
            }

            if (subcommand === 'shop-remove') {
                const itemId = interaction.options.getString('id');

                const item = await removeItem(guildId, itemId);
                return interaction.reply(t(interaction.appLocale, 'config.itemRemoved', {name: item.name}));
            }
        } catch (error) {
            if (error.message === 'ITEM_NOT_FOUND') {
                return interaction.reply(t(interaction.appLocale, 'buy.itemNotFound'));
            }

            console.error('Error al procesar el comando "config":', error);
            return interaction.reply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
