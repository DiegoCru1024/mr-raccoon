jest.mock('../models/reminderSchema', () => ({
    reminderModel: Object.assign(jest.fn(), {find: jest.fn(), deleteOne: jest.fn()})
}));
jest.mock('../utils/logger', () => ({
    info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

const {reminderModel} = require('../models/reminderSchema');
const {createReminder, getDueReminders, deleteReminder} = require('./reminderController');

describe('reminderController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        reminderModel.mockImplementation(function (data) {
            Object.assign(this, data);
            this.save = jest.fn().mockResolvedValue(this);
        });
    });

    it('creates and saves a reminder', async () => {
        const remindAt = new Date('2024-01-01');
        const reminder = await createReminder('u1', 'g1', 'c1', 'hola', remindAt);

        expect(reminder.message).toBe('hola');
        expect(reminder.save).toHaveBeenCalled();
    });

    it('queries reminders due at or before now', async () => {
        reminderModel.find.mockResolvedValue([{message: 'due'}]);

        const reminders = await getDueReminders();

        expect(reminderModel.find).toHaveBeenCalledWith({remindAt: {$lte: expect.any(Date)}});
        expect(reminders).toEqual([{message: 'due'}]);
    });

    it('deletes a reminder by id', async () => {
        reminderModel.deleteOne.mockResolvedValue({});

        await deleteReminder('r1');

        expect(reminderModel.deleteOne).toHaveBeenCalledWith({_id: 'r1'});
    });
});
