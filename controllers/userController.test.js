jest.mock('../models/guildUserSchema', () => ({
    guildUserModel: Object.assign(jest.fn(), {findOne: jest.fn()})
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {guildUserModel} = require('../models/guildUserSchema');
const {verifyUser} = require('./userController');

function fakeClient({member} = {}) {
    return {
        guilds: {
            cache: {
                get: jest.fn().mockReturnValue({
                    members: {cache: {get: jest.fn().mockReturnValue(member)}}
                })
            }
        }
    };
}

describe('verifyUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        guildUserModel.mockImplementation(function (data) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue(undefined);
        });
    });

    it('does nothing when the user already has a record', async () => {
        guildUserModel.findOne.mockResolvedValue({guildId: 'g1', userId: 'u1'});
        const client = fakeClient();

        await verifyUser(client, 'g1', 'u1');

        expect(guildUserModel).not.toHaveBeenCalled();
    });

    it('creates a record when the member is in the guild', async () => {
        guildUserModel.findOne.mockResolvedValue(null);
        const joinedAt = new Date('2024-01-01');
        const client = fakeClient({member: {joinedAt}});

        await verifyUser(client, 'g1', 'u1');

        expect(guildUserModel).toHaveBeenCalledWith(expect.objectContaining({
            guildId: 'g1',
            userId: 'u1',
            joinDate: joinedAt,
            experience: 0,
            currency: 0
        }));
    });

    it('throws when the member is not in the guild', async () => {
        guildUserModel.findOne.mockResolvedValue(null);
        const client = fakeClient({member: undefined});

        await expect(verifyUser(client, 'g1', 'u1')).rejects.toThrow('El usuario no se encuentra en el servidor.');
    });
});
