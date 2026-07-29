require('dotenv/config');
const {REST, Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const foldersPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(foldersPath);

for (const file of commandFiles) {
    if (file.endsWith('.js')) {
        const filePath = path.join(foldersPath, file);
        const command = require(filePath);

        if (command && 'data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] El comando en ${file} está faltando la propiedad "data" o "execute" requerida.`);
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    try {
        const args = process.argv.slice(2);

        const deployGlobal = args.includes('-global');
        const deployGuild = args.includes('-guild');

        if (!deployGlobal && !deployGuild) {
            console.log('Ningún objetivo especificado. Usa "-global" y/o "-guild".');
            return;
        }

        if (deployGlobal) {
            console.log('Eliminando comandos de guild existentes antes de publicar en global...');

            const existingGuildCommands = await rest.get(
                Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD)
            );

            await Promise.all(existingGuildCommands.map(command =>
                rest.delete(Routes.applicationGuildCommand(process.env.CLIENT, process.env.GUILD, command.id))
            ));

            console.log('Comandos de guild eliminados.');
            console.log(`Publicando ${commands.length} comandos (/) globalmente...`);

            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT),
                {body: commands},
            );

            console.log(`${data.length} comandos (/) publicados globalmente.`);
        }

        if (deployGuild) {
            console.log(`Publicando ${commands.length} comandos (/) en el guild...`);

            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD),
                {body: commands},
            );

            console.log(`${data.length} comandos (/) publicados en el guild.`);
        }
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
})();
