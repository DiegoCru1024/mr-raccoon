const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const {getQueue} = require('../utils/musicPlayer');
const {formatDuration} = require('../utils/formatDuration');
const {t} = require('../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Muestra la canción que se está reproduciendo.'),
    async execute(interaction) {
        const queue = getQueue(interaction.guild.id);

        if (!queue || !queue.current) {
            return interaction.reply(t(interaction.appLocale, 'music.nothingPlaying'));
        }

        const nowPlayingEmbed = new EmbedBuilder()
            .setColor(0x6400c8)
            .setTitle(t(interaction.appLocale, 'music.nowPlayingTitle'))
            .setDescription(`[${queue.current.title}](${queue.current.url})`)
            .addFields(
                {name: t(interaction.appLocale, 'music.duration'), value: formatDuration(queue.current.durationInSec), inline: true},
                {name: t(interaction.appLocale, 'music.requestedBy'), value: `<@${queue.current.requestedBy}>`, inline: true},
            );

        return interaction.reply({embeds: [nowPlayingEmbed]});
    },
};
