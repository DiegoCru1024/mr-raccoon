const mongoose = require('mongoose')

const guildUserSchema = new mongoose.Schema({
    guildId: {type: String, required: true},
    userId: {type: String, required: true},
    joinDate: {type: Date, required: true},
    experience: {type: Number, default: 0},
    currency: {type: Number, default: 0},
    lastDaily: {type: Date},
    chatHistory: {type: Array, default: []}
})

guildUserSchema.index({guildId: 1, userId: 1}, {unique: true})

const guildUserModel = mongoose.model("guildUser", guildUserSchema)

module.exports = {guildUserModel}