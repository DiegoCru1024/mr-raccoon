jest.mock('../models/guildUserSchema', () => ({
    guildUserModel: {findOne: jest.fn()}
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {guildUserModel} = require('../models/guildUserSchema');
const {xpController} = require('./xpController');

describe('xpController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        Math.random.mockRestore();
    });

    it('increments experience and saves when the user exists', async () => {
        const save = jest.fn().mockResolvedValue(undefined);
        const guildUserData = {experience: 10, save};
        guildUserModel.findOne.mockResolvedValue(guildUserData);

        await xpController('guild-1', 'user-1');

        expect(guildUserModel.findOne).toHaveBeenCalledWith({guildId: 'guild-1', userId: 'user-1'});
        expect(guildUserData.experience).toBe(10 + Math.floor(0.5 * 100));
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the user does not exist', async () => {
        guildUserModel.findOne.mockResolvedValue(null);

        await expect(xpController('guild-1', 'user-1')).resolves.toBeUndefined();
    });

    it('propagates errors from the database', async () => {
        guildUserModel.findOne.mockRejectedValue(new Error('db down'));

        await expect(xpController('guild-1', 'user-1')).rejects.toThrow('db down');
    });
});
