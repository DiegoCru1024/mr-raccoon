jest.mock('../models/shopItemSchema', () => ({
    shopItemModel: Object.assign(jest.fn(), {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndDelete: jest.fn()
    })
}));
jest.mock('./economyController', () => ({
    subtractCurrency: jest.fn()
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {shopItemModel} = require('../models/shopItemSchema');
const {subtractCurrency} = require('./economyController');
const {listItems, addItem, removeItem, buyItem} = require('./shopController');

describe('shopController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        shopItemModel.mockImplementation(function (data) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue(this);
        });
    });

    describe('listItems', () => {
        it('lists items for the guild', async () => {
            shopItemModel.find.mockResolvedValue([{name: 'Rol VIP'}]);

            const items = await listItems('g1');

            expect(shopItemModel.find).toHaveBeenCalledWith({guildId: 'g1'});
            expect(items).toEqual([{name: 'Rol VIP'}]);
        });
    });

    describe('addItem', () => {
        it('creates and saves a new item', async () => {
            const item = await addItem('g1', 'Rol VIP', 'desc', 100, 'role1');

            expect(item.name).toBe('Rol VIP');
            expect(item.save).toHaveBeenCalled();
        });
    });

    describe('removeItem', () => {
        it('throws when the item does not exist', async () => {
            shopItemModel.findOneAndDelete.mockResolvedValue(null);

            await expect(removeItem('g1', 'i1')).rejects.toThrow('ITEM_NOT_FOUND');
        });
    });

    describe('buyItem', () => {
        function fakeMember(hasRole = false) {
            return {roles: {cache: {has: jest.fn().mockReturnValue(hasRole)}, add: jest.fn().mockResolvedValue(undefined)}};
        }

        it('throws when the item does not exist', async () => {
            shopItemModel.findOne.mockResolvedValue(null);

            await expect(buyItem('g1', 'u1', 'i1', fakeMember())).rejects.toThrow('ITEM_NOT_FOUND');
        });

        it('throws when the member already has the role', async () => {
            shopItemModel.findOne.mockResolvedValue({roleId: 'role1', price: 100});

            await expect(buyItem('g1', 'u1', 'i1', fakeMember(true))).rejects.toThrow('ALREADY_OWNED');
        });

        it('subtracts currency and grants the role', async () => {
            shopItemModel.findOne.mockResolvedValue({roleId: 'role1', price: 100});
            subtractCurrency.mockResolvedValue({});
            const member = fakeMember(false);

            await buyItem('g1', 'u1', 'i1', member);

            expect(subtractCurrency).toHaveBeenCalledWith('g1', 'u1', 100);
            expect(member.roles.add).toHaveBeenCalledWith('role1');
        });
    });
});
