const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {getQueue} = require('../utils/musicPlayer');
const {formatDuration} = require('../utils/formatDuration');
const {t} = require('../utils/i18n');

const MAX_LISTED_TRACKS = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la cola de reproducción actual.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue || (!queue.current && queue.tracks.length === 0)) {
            return interaction.reply(t(interaction.appLocale, 'music.queueEmpty'));
        }

        const upcoming = queue.tracks.slice(0, MAX_LISTED_TRACKS)
            .map((track, index) => `${index + 1}. ${track.title} (${formatDuration(track.durationInSec)})`)
            .join('\n');

        const queueEmbed = new EmbedBuilder()
            .setColor(0x6400c8)
            .setTitle(t(interaction.appLocale, 'music.queueTitle'))
            .setDescription(queue.current
                ? t(interaction.appLocale, 'music.queueNowPlaying', {title: queue.current.title, duration: formatDuration(queue.current.durationInSec)})
                : t(interaction.appLocale, 'music.queueEmpty'));

        if (upcoming) {
            queueEmbed.addFields({name: t(interaction.appLocale, 'music.queueUpcoming'), value: upcoming});
        }

        if (queue.tracks.length > MAX_LISTED_TRACKS) {
            queueEmbed.setFooter({text: t(interaction.appLocale, 'music.queueMore', {count: queue.tracks.length - MAX_LISTED_TRACKS})});
        }

        return interaction.reply({embeds: [queueEmbed]});
    },
};
