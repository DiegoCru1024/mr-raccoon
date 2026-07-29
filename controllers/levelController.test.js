jest.mock('./configController', () => ({
    getGuildConfig: jest.fn()
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {getGuildConfig} = require('./configController');
const {getLevelFromExperience, handleLevelUp} = require('./levelController');

describe('getLevelFromExperience', () => {
    it('returns 0 for low experience', () => {
        expect(getLevelFromExperience(0)).toBe(0);
    });

    it('increases with experience', () => {
        expect(getLevelFromExperience(50 * 25)).toBe(5);
    });
});

describe('handleLevelUp', () => {
    function fakeConfig(overrides = {}) {
        return {
            leveling: {announceLevelUp: true, levelUpChannelId: null, levelRoles: [], ...overrides}
        };
    }

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does nothing when the level did not change', async () => {
        const client = {guilds: {cache: {get: jest.fn()}}};

        await handleLevelUp({client, guildId: 'g1', userId: 'u1', previousExperience: 0, newExperience: 10});

        expect(getGuildConfig).not.toHaveBeenCalled();
        expect(client.guilds.cache.get).not.toHaveBeenCalled();
    });

    it('grants configured level roles and announces on the fallback channel', async () => {
        getGuildConfig.mockResolvedValue(fakeConfig({levelRoles: [{level: 1, roleId: 'r1'}]}));

        const addRole = jest.fn().mockResolvedValue(undefined);
        const member = {roles: {cache: {has: jest.fn().mockReturnValue(false)}, add: addRole}};
        const guild = {
            members: {fetch: jest.fn().mockResolvedValue(member)},
            channels: {fetch: jest.fn()}
        };
        const client = {guilds: {cache: {get: jest.fn().mockReturnValue(guild)}}};
        const fallbackChannel = {send: jest.fn().mockResolvedValue(undefined)};

        await handleLevelUp({
            client, guildId: 'g1', userId: 'u1',
            previousExperience: 0, newExperience: 50, fallbackChannel
        });

        expect(addRole).toHaveBeenCalledWith('r1');
        expect(fallbackChannel.send).toHaveBeenCalled();
    });

    it('does not throw when the guild is not cached', async () => {
        getGuildConfig.mockResolvedValue(fakeConfig());
        const client = {guilds: {cache: {get: jest.fn().mockReturnValue(undefined)}}};

        await expect(handleLevelUp({client, guildId: 'g1', userId: 'u1', previousExperience: 0, newExperience: 50}))
            .resolves.toBeUndefined();
    });
});
