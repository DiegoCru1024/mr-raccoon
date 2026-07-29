const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = async () => {
    await mongoose.connect(process.env.DB_URL);
    logger.info('Conexión exitosa a la base de datos.');
};