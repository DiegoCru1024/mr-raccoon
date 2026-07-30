const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    StreamType,
} = require('@discordjs/voice');
const play = require('play-dl');
const {getGuildConfig} = require('../controllers/configController');
const {t} = require('./i18n');
const logger = require('./logger');

const IDLE_TIMEOUT_MS = 60_000;
const MAX_TRACK_RETRIES = 1;
const RATE_LIMIT_BACKOFF_MS = 5_000;

const queues = new Map();

function getQueue(guildId) {
    return queues.get(guildId);
}

function createQueue(guild, voiceChannel, textChannel) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const queue = {
        connection,
        player,
        textChannel,
        tracks: [],
        current: null,
        idleTimer: null,
        loop: false,
    };

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch {
            destroyQueue(guild.id);
        }
    });

    player.on(AudioPlayerStatus.Idle, () => {
        queue.current = null;
        playNext(guild.id).catch(error => logger.error(`Error al avanzar la cola del guild ${guild.id}:`, error));
    });

    player.on('error', error => {
        logger.error(`Error de reproducción en el guild ${guild.id}:`, error);
        queue.current = null;
        playNext(guild.id).catch(nextError => logger.error(`Error al avanzar la cola del guild ${guild.id}:`, nextError));
    });

    queues.set(guild.id, queue);
    return queue;
}

function clearIdleTimer(queue) {
    if (queue.idleTimer) {
        clearTimeout(queue.idleTimer);
        queue.idleTimer = null;
    }
}

function scheduleIdleLeave(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return;

    clearIdleTimer(queue);
    queue.idleTimer = setTimeout(() => destroyQueue(guildId), IDLE_TIMEOUT_MS);
}

function destroyQueue(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return;

    clearIdleTimer(queue);
    queue.player.stop(true);
    try {
        queue.connection.destroy();
    } catch {
        // La conexión ya pudo haber sido destruida.
    }
    queues.delete(guildId);
}

async function notifyChannel(queue, guildId, key, params) {
    if (!queue.textChannel) return;

    try {
        const config = await getGuildConfig(guildId);
        await queue.textChannel.send(t(config.locale, key, params));
    } catch (error) {
        logger.warn(`No se pudo notificar al canal de texto del guild ${guildId}: ${error.message}`);
    }
}

async function playTrack(guildId, track, attempt = 0) {
    const queue = getQueue(guildId);
    if (!queue) return;

    clearIdleTimer(queue);
    queue.current = track;

    try {
        const source = await play.stream(track.url);
        const resource = createAudioResource(source.stream, {
            inputType: source.type ?? StreamType.Arbitrary,
        });
        queue.player.play(resource);
    } catch (error) {
        const isRateLimited = /429/.test(error.message ?? '');

        if (isRateLimited && attempt < MAX_TRACK_RETRIES) {
            logger.warn(`Límite de solicitudes de YouTube alcanzado, reintentando "${track.title}" en ${RATE_LIMIT_BACKOFF_MS}ms...`);
            setTimeout(() => {
                playTrack(guildId, track, attempt + 1).catch(retryError => logger.error(`Error al reintentar "${track.title}":`, retryError));
            }, RATE_LIMIT_BACKOFF_MS);
            return;
        }

        logger.error(`Error al reproducir "${track.title}":`, error);
        await notifyChannel(queue, guildId, isRateLimited ? 'music.rateLimited' : 'music.trackFailed', {title: track.title});
        await playNext(guildId);
    }
}

async function playNext(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return;

    if (queue.loop && queue.current) {
        queue.tracks.unshift(queue.current);
    }

    const track = queue.tracks.shift();
    if (!track) {
        queue.current = null;
        scheduleIdleLeave(guildId);
        return;
    }

    if (!track.url) {
        logger.warn(`Se omitió "${track.title}" por no tener una URL válida.`);
        return playNext(guildId);
    }

    return playTrack(guildId, track);
}

function enqueue(queue, tracks) {
    queue.tracks.push(...tracks);
    if (!queue.current) {
        const guildId = queue.connection.joinConfig.guildId;
        playNext(guildId).catch(error => logger.error(`Error al iniciar la reproducción en el guild ${guildId}:`, error));
    }
}

function skip(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return false;
    queue.player.stop(true);
    return true;
}

function stop(guildId) {
    const queue = getQueue(guildId);
    if (!queue) return false;
    queue.tracks = [];
    destroyQueue(guildId);
    return true;
}

function pause(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return false;
    return queue.player.pause();
}

function resume(guildId) {
    const queue = getQueue(guildId);
    if (!queue || !queue.current) return false;
    return queue.player.unpause();
}

module.exports = {getQueue, createQueue, enqueue, playNext, skip, stop, pause, resume, destroyQueue};
