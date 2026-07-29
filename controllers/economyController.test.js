jest.mock('../models/guildUserSchema', () => ({
    guildUserModel: {findOne: jest.fn()}
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {guildUserModel} = require('../models/guildUserSchema');
const {addCurrency, subtractCurrency, transferCurrency} = require('./economyController');

describe('economyController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addCurrency', () => {
        it('adds the amount and saves', async () => {
            const save = jest.fn().mockResolvedValue(undefined);
            guildUserModel.findOne.mockResolvedValue({currency: 100, save});

            const result = await addCurrency('g1', 'u1', 50);

            expect(result.currency).toBe(150);
            expect(save).toHaveBeenCalledTimes(1);
        });

        it('throws when the user is not registered', async () => {
            guildUserModel.findOne.mockResolvedValue(null);

            await expect(addCurrency('g1', 'u1', 50)).rejects.toThrow('El usuario no está registrado.');
        });
    });

    describe('subtractCurrency', () => {
        it('subtracts the amount when balance is sufficient', async () => {
            const save = jest.fn().mockResolvedValue(undefined);
            guildUserModel.findOne.mockResolvedValue({currency: 100, save});

            const result = await subtractCurrency('g1', 'u1', 50);

            expect(result.currency).toBe(50);
        });

        it('throws when balance is insufficient', async () => {
            guildUserModel.findOne.mockResolvedValue({currency: 10, save: jest.fn()});

            await expect(subtractCurrency('g1', 'u1', 50)).rejects.toThrow('Saldo insuficiente.');
        });
    });

    describe('transferCurrency', () => {
        it('subtracts from sender and adds to receiver', async () => {
            const sender = {currency: 100, save: jest.fn().mockResolvedValue(undefined)};
            const receiver = {currency: 20, save: jest.fn().mockResolvedValue(undefined)};

            guildUserModel.findOne
                .mockResolvedValueOnce(sender)
                .mockResolvedValueOnce(receiver);

            await transferCurrency('g1', 'sender', 'receiver', 30);

            expect(sender.currency).toBe(70);
            expect(receiver.currency).toBe(50);
        });
    });
});
