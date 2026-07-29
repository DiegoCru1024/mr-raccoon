const mongoose = require('mongoose')

const shopItemSchema = new mongoose.Schema({
    guildId: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    roleId: {type: String, required: true}
})

const shopItemModel = mongoose.model("shopItem", shopItemSchema)

module.exports = {shopItemModel}
