const mongoose = require('mongoose')

const levelRoleSchema = new mongoose.Schema({
    level: {type: Number, required: true},
    roleId: {type: String, required: true}
}, {_id: false})

const guildConfigSchema = new mongoose.Schema({
    guildId: {type: String, required: true, unique: true},
    welcome: {
        enabled: {type: Boolean},
        channelId: {type: String},
        message: {type: String}
    },
    farewell: {
        enabled: {type: Boolean},
        channelId: {type: String},
        message: {type: String}
    },
    moderation: {
        logChannelId: {type: String}
    },
    leveling: {
        announceLevelUp: {type: Boolean},
        levelUpChannelId: {type: String},
        levelRoles: {type: [levelRoleSchema]}
    }
})

const guildConfigModel = mongoose.model("guildConfig", guildConfigSchema)

module.exports = {guildConfigModel}
