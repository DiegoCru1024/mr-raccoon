const {SlashCommandBuilder} = require('discord.js');
const {guildUserModel} = require("../models/guildUserSchema");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const MAX_CHAT_HISTORY = 1000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Inicia una conversación con Google Gemini.')
        .addStringOption(option => option.setName('message').setDescription('Ingresa tu mensaje.').setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply()

            const userData = await guildUserModel.findOne({
                guildId: interaction.guild.id,
                userId: interaction.user.id
            });

            const msg = interaction.options.getString('message')
            const modelResponse = await sendMessage(msg, userData.chatHistory)

            if (userData.chatHistory.length >= MAX_CHAT_HISTORY) {
                userData.chatHistory.splice(0, 2);
            }

            userData.chatHistory.push({
                role: 'user',
                parts: msg
            }, {
                role: 'model',
                parts: modelResponse
            })

            await userData.save()

            await interaction.editReply(modelResponse);
        } catch (error) {
            console.error('Error al procesar el comando "chat":', error);
            return interaction.editReply(`No puedo responder a esta pregunta.`);
        }
    },
};

async function sendMessage(msg, chatHistory) {
    const chat = model.startChat({
        history: chatHistory || [],
        generationConfig: {
            maxOutputTokens: 500,
        }
    })

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    return response.text()
}