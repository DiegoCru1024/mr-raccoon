const fs = require('fs');
const path = require('path');
const AsciiTable = require('ascii-table');

/**
 * Reads every .js file in a directory and requires it, reporting the outcome
 * through a callback so command/event loaders can apply their own validation.
 */
function loadDirectory(dirName, heading, onFile) {
    const table = new AsciiTable().setHeading(heading, 'Estado');
    const dirPath = path.resolve(__dirname, '..', dirName);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

    for (const file of files) {
        try {
            const module = require(path.join(dirPath, file));
            table.addRow(file, onFile(module));
        } catch (error) {
            table.addRow(file, `Error al cargar: ${error.message}`);
        }
    }

    console.log(table.toString());
}

module.exports = {loadDirectory};
