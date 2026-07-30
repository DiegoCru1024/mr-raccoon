const {SlashCommandBuilder, PermissionFlagsBits} = require('discord.js');
const {resolveQuery} = require('../controllers/musicController');
const {getQueue, createQueue, enqueue} = require('../utils/musicPlayer');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción o playlist de YouTube o Spotify en el canal de voz.')
        .addStringOption(option => option.setName('busqueda')
            .setDescription('Link de YouTube/Spotify, o término de búsqueda')
            .setRequired(true)),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply(t(interaction.appLocale, 'music.noVoiceChannel'));
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
            return interaction.reply(t(interaction.appLocale, 'music.missingPermissions'));
        }

        const existingQueue = getQueue(interaction.guild.id);
        if (existingQueue && existingQueue.connection.joinConfig.channelId !== voiceChannel.id) {
            return interaction.reply(t(interaction.appLocale, 'music.alreadyPlayingElsewhere'));
        }

        await interaction.deferReply();

        try {
            const query = interaction.options.getString('busqueda');
            const {tracks, isPlaylist, sourceTitle} = await resolveQuery(query, interaction.user.id);

            if (tracks.length === 0) {
                return interaction.editReply(t(interaction.appLocale, 'music.noResults'));
            }

            const queue = existingQueue ?? createQueue(interaction.guild, voiceChannel, interaction.channel);
            const wasIdle = !queue.current && queue.tracks.length === 0;
            enqueue(queue, tracks);

            if (isPlaylist) {
                return interaction.editReply(t(interaction.appLocale, 'music.playlistAdded', {title: sourceTitle, count: tracks.length}));
            }

            if (wasIdle) {
                return interaction.editReply(t(interaction.appLocale, 'music.nowPlaying', {title: tracks[0].title}));
            }

            return interaction.editReply(t(interaction.appLocale, 'music.trackAdded', {title: tracks[0].title}));
        } catch (error) {
            if (error.message === 'SPOTIFY_NOT_CONFIGURED') {
                return interaction.editReply(t(interaction.appLocale, 'music.spotifyNotConfigured'));
            }
            if (error.message === 'NO_RESULTS') {
                return interaction.editReply(t(interaction.appLocale, 'music.noResults'));
            }

            console.error('Error al procesar el comando "play":', error);
            return interaction.editReply(t(interaction.appLocale, 'common.genericError'));
        }
    },
};
