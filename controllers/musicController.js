const MAX_PLAYLIST_TRACKS = 100;
const SPOTIFY_PAGE_SIZE = 50;
const SPOTIFY_URL_PATTERN = /open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist)\/([a-zA-Z0-9]+)/;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function assertSpotifyCredentials() {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error('SPOTIFY_NOT_CONFIGURED');
    }
}

async function getAccessToken() {
    assertSpotifyCredentials();

    if (cachedToken && Date.now() < cachedTokenExpiresAt) {
        return cachedToken;
    }

    const basicAuth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error(`SPOTIFY_AUTH_FAILED: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    cachedTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
}

async function spotifyFetch(path) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
        headers: {Authorization: `Bearer ${token}`},
    });

    if (!response.ok) {
        throw new Error(`SPOTIFY_REQUEST_FAILED: ${response.status}`);
    }

    return response.json();
}

function toTrack(spotifyTrack, requestedBy) {
    if (!spotifyTrack || !spotifyTrack.preview_url) return null;

    const artistNames = spotifyTrack.artists?.map(artist => artist.name).join(', ') ?? '';
    return {
        title: artistNames ? `${spotifyTrack.name} - ${artistNames}` : spotifyTrack.name,
        url: spotifyTrack.preview_url,
        durationInSec: Math.round((spotifyTrack.duration_ms ?? 30_000) / 1000),
        requestedBy,
    };
}

async function fetchAllPages(firstPath, extractItems) {
    const items = [];
    let path = firstPath;

    while (path && items.length < MAX_PLAYLIST_TRACKS) {
        const page = await spotifyFetch(path);
        items.push(...extractItems(page));
        path = page.next ? page.next.replace('https://api.spotify.com/v1', '') : null;
    }

    return items.slice(0, MAX_PLAYLIST_TRACKS);
}

async function resolveQuery(query, requestedBy) {
    const spotifyMatch = query.match(SPOTIFY_URL_PATTERN);

    if (spotifyMatch) {
        const [, type, id] = spotifyMatch;

        if (type === 'track') {
            const track = await spotifyFetch(`/tracks/${id}`);
            const resolved = toTrack(track, requestedBy);
            return {isPlaylist: false, tracks: resolved ? [resolved] : []};
        }

        if (type === 'playlist') {
            const playlistInfo = await spotifyFetch(`/playlists/${id}?fields=name`);
            const rawItems = await fetchAllPages(
                `/playlists/${id}/tracks?limit=${SPOTIFY_PAGE_SIZE}`,
                page => page.items.map(item => item.track),
            );
            const tracks = rawItems.map(item => toTrack(item, requestedBy)).filter(Boolean);
            return {isPlaylist: true, sourceTitle: playlistInfo.name, tracks, skippedCount: rawItems.length - tracks.length};
        }

        const albumInfo = await spotifyFetch(`/albums/${id}?fields=name`);
        const rawItems = await fetchAllPages(
            `/albums/${id}/tracks?limit=${SPOTIFY_PAGE_SIZE}`,
            page => page.items,
        );
        const tracks = rawItems.map(item => toTrack(item, requestedBy)).filter(Boolean);
        return {isPlaylist: true, sourceTitle: albumInfo.name, tracks, skippedCount: rawItems.length - tracks.length};
    }

    const searchResult = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=5`);
    const match = searchResult.tracks?.items?.find(item => item.preview_url);
    if (!match) {
        throw new Error('NO_RESULTS');
    }

    return {isPlaylist: false, tracks: [toTrack(match, requestedBy)]};
}

module.exports = {resolveQuery};
