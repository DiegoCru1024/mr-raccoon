const play = require('play-dl');
const logger = require('./logger');

async function initPlayDlAuth() {
    if (!process.env.YOUTUBE_COOKIE) return;

    try {
        await play.setToken({youtube: {cookie: process.env.YOUTUBE_COOKIE}});
        logger.info('Cookie de YouTube configurada para play-dl.');
    } catch (error) {
        logger.error('Error al configurar la cookie de YouTube para play-dl:', error);
    }
}

module.exports = {initPlayDlAuth};
