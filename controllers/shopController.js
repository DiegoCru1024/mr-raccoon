const {shopItemModel} = require("../models/shopItemSchema")
const {subtractCurrency} = require("./economyController")
const logger = require("../utils/logger")

async function listItems(guildId) {
    try {
        return await shopItemModel.find({guildId})
    } catch (error) {
        logger.error('Error al listar los artículos de la tienda:', error)
        throw error
    }
}

async function addItem(guildId, name, description, price, roleId) {
    try {
        return await new shopItemModel({guildId, name, description, price, roleId}).save()
    } catch (error) {
        logger.error('Error al agregar el artículo a la tienda:', error)
        throw error
    }
}

async function removeItem(guildId, itemId) {
    try {
        const deleted = await shopItemModel.findOneAndDelete({_id: itemId, guildId})
        if (!deleted) {
            throw new Error('ITEM_NOT_FOUND')
        }
        return deleted
    } catch (error) {
        logger.error('Error al eliminar el artículo de la tienda:', error)
        throw error
    }
}

async function buyItem(guildId, userId, itemId, member) {
    try {
        const item = await shopItemModel.findOne({_id: itemId, guildId})
        if (!item) {
            throw new Error('ITEM_NOT_FOUND')
        }

        if (member.roles.cache.has(item.roleId)) {
            throw new Error('ALREADY_OWNED')
        }

        await subtractCurrency(guildId, userId, item.price)
        await member.roles.add(item.roleId)

        return item
    } catch (error) {
        logger.error('Error al comprar el artículo:', error)
        throw error
    }
}

module.exports = {listItems, addItem, removeItem, buyItem}
