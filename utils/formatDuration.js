function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds ?? 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const paddedMinutes = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
}

module.exports = {formatDuration};
