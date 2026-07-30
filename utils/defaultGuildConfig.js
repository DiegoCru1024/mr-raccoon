const DEFAULT_GUILD_CONFIG = {
    locale: null,
    welcome: {
        enabled: false,
        channelId: null,
        message: '¡Bienvenido/a {user} a {server}!'
    },
    farewell: {
        enabled: false,
        channelId: null,
        message: '{username} ha abandonado {server}.'
    },
    moderation: {
        logChannelId: null
    },
    leveling: {
        announceLevelUp: true,
        levelUpChannelId: null,
        levelRoles: []
    }
}

module.exports = {DEFAULT_GUILD_CONFIG}
