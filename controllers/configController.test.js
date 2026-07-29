jest.mock('../models/guildConfigSchema', () => ({
    guildConfigModel: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn()
    }
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {guildConfigModel} = require('../models/guildConfigSchema');
const {getGuildConfig, updateGuildConfig, addLevelRole} = require('./configController');

describe('configController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getGuildConfig', () => {
        it('returns defaults when no document exists', async () => {
            guildConfigModel.findOne.mockResolvedValue(null);

            const config = await getGuildConfig('g1');

            expect(config.welcome.enabled).toBe(false);
            expect(config.leveling.levelRoles).toEqual([]);
            expect(config.moderation.logChannelId).toBeNull();
        });

        it('merges a partial document over the defaults', async () => {
            guildConfigModel.findOne.mockResolvedValue({
                toObject: () => ({
                    welcome: {enabled: true, channelId: 'c1'}
                })
            });

            const config = await getGuildConfig('g1');

            expect(config.welcome).toEqual({enabled: true, channelId: 'c1', message: expect.any(String)});
            expect(config.farewell.enabled).toBe(false);
        });
    });

    describe('updateGuildConfig', () => {
        it('upserts using dot-notation fields per module', async () => {
            guildConfigModel.findOneAndUpdate.mockResolvedValue({
                toObject: () => ({welcome: {enabled: true, channelId: 'c1'}})
            });

            await updateGuildConfig('g1', {welcome: {enabled: true, channelId: 'c1'}});

            expect(guildConfigModel.findOneAndUpdate).toHaveBeenCalledWith(
                {guildId: 'g1'},
                {$set: {'welcome.enabled': true, 'welcome.channelId': 'c1'}},
                {upsert: true, new: true, setDefaultsOnInsert: true}
            );
        });
    });

    describe('addLevelRole', () => {
        it('removes any existing entry for the level then pushes the new one', async () => {
            guildConfigModel.updateOne.mockResolvedValue({});
            guildConfigModel.findOneAndUpdate.mockResolvedValue({
                toObject: () => ({leveling: {levelRoles: [{level: 5, roleId: 'r1'}]}})
            });

            const config = await addLevelRole('g1', 5, 'r1');

            expect(guildConfigModel.updateOne).toHaveBeenCalledWith(
                {guildId: 'g1'},
                {$pull: {'leveling.levelRoles': {level: 5}}},
                {upsert: true}
            );
            expect(guildConfigModel.findOneAndUpdate).toHaveBeenCalledWith(
                {guildId: 'g1'},
                {$push: {'leveling.levelRoles': {level: 5, roleId: 'r1'}}},
                {upsert: true, new: true}
            );
            expect(config.leveling.levelRoles).toEqual([{level: 5, roleId: 'r1'}]);
        });
    });
});
