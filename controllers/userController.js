const {guildUserModel} = require("../models/guildUserSchema");
const logger = require("../utils/logger");

async function verifyUser(botClient, guildId, userId) {
    try {
        const guildUserResponse = await guildUserModel.findOne({guildId: guildId, userId: userId});

        if (!guildUserResponse) {
            const guild = botClient.guilds.cache.get(guildId);
            const guildMember = guild.members.cache.get(userId);

            if (guildMember) {
                await new guildUserModel({
                    guildId: guildId,
                    userId: userId,
                    joinDate: guildMember.joinedAt,
                    experience: 0,
                    currency: 0
                }).save();
            } else {
                throw new Error('El usuario no se encuentra en el servidor.');
            }
        }
    } catch (error) {
        logger.error('Error al verificar al usuario:', error);
        throw error;
    }
}

module.exports = {verifyUser};
