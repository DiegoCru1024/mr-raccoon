function info(message) {
    console.log(`[LOG] ${message}`);
}

function warn(message) {
    console.warn(`[WARN] ${message}`);
}

function error(message, err) {
    console.error(`[ERROR] ${message}`, err ?? '');
}

module.exports = {info, warn, error};
