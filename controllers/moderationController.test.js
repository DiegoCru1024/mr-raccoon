jest.mock('../models/moderationCaseSchema', () => ({
    moderationCaseModel: Object.assign(jest.fn(), {find: jest.fn()})
}));
jest.mock('./configController', () => ({
    getGuildConfig: jest.fn()
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {moderationCaseModel} = require('../models/moderationCaseSchema');
const {getGuildConfig} = require('./configController');
const {createCase, getCases} = require('./moderationController');

describe('moderationController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        moderationCaseModel.mockImplementation(function (data) {
            Object.assign(this, data);
            this.createdAt = new Date('2024-01-01');
            this.save = jest.fn().mockResolvedValue(this);
        });
    });

    describe('createCase', () => {
        it('saves the case and skips logging when no log channel is configured', async () => {
            getGuildConfig.mockResolvedValue({moderation: {logChannelId: null}});
            const client = {guilds: {cache: {get: jest.fn()}}};

            const moderationCase = await createCase(client, 'g1', 'u1', 'mod1', 'warn', 'spam');

            expect(moderationCase.type).toBe('warn');
            expect(client.guilds.cache.get).not.toHaveBeenCalled();
        });

        it('sends a log embed when a log channel is configured', async () => {
            getGuildConfig.mockResolvedValue({moderation: {logChannelId: 'log1'}});
            const send = jest.fn().mockResolvedValue(undefined);
            const guild = {channels: {fetch: jest.fn().mockResolvedValue({send})}};
            const client = {guilds: {cache: {get: jest.fn().mockReturnValue(guild)}}};

            await createCase(client, 'g1', 'u1', 'mod1', 'ban', 'raid');

            expect(guild.channels.fetch).toHaveBeenCalledWith('log1');
            expect(send).toHaveBeenCalled();
        });

        it('does not throw when sending the log fails', async () => {
            getGuildConfig.mockResolvedValue({moderation: {logChannelId: 'log1'}});
            const guild = {channels: {fetch: jest.fn().mockRejectedValue(new Error('missing perms'))}};
            const client = {guilds: {cache: {get: jest.fn().mockReturnValue(guild)}}};

            await expect(createCase(client, 'g1', 'u1', 'mod1', 'kick', 'toxic')).resolves.toBeDefined();
        });
    });

    describe('getCases', () => {
        it('returns cases sorted by most recent', async () => {
            const sort = jest.fn().mockResolvedValue([{type: 'warn'}]);
            moderationCaseModel.find.mockReturnValue({sort});

            const cases = await getCases('g1', 'u1');

            expect(moderationCaseModel.find).toHaveBeenCalledWith({guildId: 'g1', userId: 'u1'});
            expect(sort).toHaveBeenCalledWith({createdAt: -1});
            expect(cases).toEqual([{type: 'warn'}]);
        });
    });
});
