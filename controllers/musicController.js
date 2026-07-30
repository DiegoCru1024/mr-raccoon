const play = require('play-dl');
const logger = require('../utils/logger');

const MAX_PLAYLIST_TRACKS = 100;
const SEARCH_CHUNK_SIZE = 5;

let spotifyReady = false;

async function ensureSpotifyReady() {
    if (spotifyReady) return true;
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) return false;

    try {
        await play.setToken({
            spotify: {
                client_id: process.env.SPOTIFY_CLIENT_ID,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET,
                market: 'US',
            },
        });
        spotifyReady = true;
        return true;
    } catch (error) {
        logger.error('Error al inicializar la integración con Spotify:', error);
        return false;
    }
}

function toTrack({title, url, durationInSec, requestedBy}) {
    return {title: title || 'Unknown', url, durationInSec: durationInSec ?? 0, requestedBy};
}

async function searchYoutube(query) {
    const results = await play.search(query, {limit: 1, source: {youtube: 'video'}});
    return results[0] ?? null;
}

async function resolveSpotifyTracksToYoutube(spotifyTracks, requestedBy) {
    const tracks = [];

    for (let i = 0; i < spotifyTracks.length; i += SEARCH_CHUNK_SIZE) {
        const chunk = spotifyTracks.slice(i, i + SEARCH_CHUNK_SIZE);
        const results = await Promise.all(chunk.map(async spotifyTrack => {
            const artistNames = spotifyTrack.artists?.map(artist => artist.name).join(' ') ?? '';
            const query = `${spotifyTrack.name} ${artistNames}`.trim();

            try {
                const match = await searchYoutube(query);
                if (!match) return null;
                return toTrack({title: `${spotifyTrack.name} - ${artistNames}`, url: match.url, durationInSec: spotifyTrack.durationInSec, requestedBy});
            } catch (error) {
                logger.warn(`No se pudo resolver la canción de Spotify "${query}": ${error.message}`);
                return null;
            }
        }));

        tracks.push(...results.filter(Boolean));
    }

    return tracks;
}

async function resolveQuery(query, requestedBy) {
    const youtubeType = play.yt_validate(query);

    if (youtubeType === 'video') {
        const info = await play.video_basic_info(query);
        const details = info.video_details;
        return {isPlaylist: false, tracks: [toTrack({title: details.title, url: details.url, durationInSec: details.durationInSec, requestedBy})]};
    }

    if (youtubeType === 'playlist') {
        const playlist = await play.playlist_info(query, {incomplete: true});
        const videos = (await playlist.all_videos()).slice(0, MAX_PLAYLIST_TRACKS);
        const tracks = videos.map(video => toTrack({title: video.title, url: video.url, durationInSec: video.durationInSec, requestedBy}));
        return {isPlaylist: true, sourceTitle: playlist.title, tracks};
    }

    const spotifyType = play.sp_validate(query);

    if (spotifyType) {
        const ready = await ensureSpotifyReady();
        if (!ready) {
            const error = new Error('SPOTIFY_NOT_CONFIGURED');
            throw error;
        }

        const spotifyData = await play.spotify(query);

        if (spotifyType === 'track') {
            const tracks = await resolveSpotifyTracksToYoutube([spotifyData], requestedBy);
            return {isPlaylist: false, tracks};
        }

        const spotifyTracks = (await spotifyData.all_tracks()).slice(0, MAX_PLAYLIST_TRACKS);
        const tracks = await resolveSpotifyTracksToYoutube(spotifyTracks, requestedBy);
        return {isPlaylist: true, sourceTitle: spotifyData.name, tracks};
    }

    const match = await searchYoutube(query);
    if (!match) {
        throw new Error('NO_RESULTS');
    }

    return {isPlaylist: false, tracks: [toTrack({title: match.title, url: match.url, durationInSec: match.durationInSec, requestedBy})]};
}

module.exports = {resolveQuery};
