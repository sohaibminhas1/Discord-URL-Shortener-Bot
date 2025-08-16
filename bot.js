const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, MessageFlags } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

class LocalURLShortener {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async shortenURL(originalURL, discordUserId, code = null) {
        try {
            console.log(`Calling ${this.baseURL}/api/discord/shorten`); 

            const payload = { 
                url: originalURL,
                discordUserId: discordUserId 
            };
            if (code) payload.custom = code;

            const response = await axios.post(`${this.baseURL}/api/discord/shorten`, payload, { 
                headers: { 'Content-Type': "application/json" },
                timeout: 10000
            });

            console.log("Success", response.data);
            return response.data;
        } catch (error) {
            console.error("Error", error.response?.data || error.message);

            if (error.code === "ECONNREFUSED") {
                throw new Error("Can't connect to localhost:8001 - Is URL-Shortener running?");
            }
            throw new Error(error.response?.data?.error || error.response?.data?.message || error.message);
        }
    }
}

const urlAPI = new LocalURLShortener(process.env.API_BASE_URL);

const commands = [
    new SlashCommandBuilder()
        .setName("shortenurl")
        .setDescription("Shorten your required URL using your localhost API")
        .addStringOption(option =>
            option.setName("url")
                .setDescription("The URL to shorten")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("custom")
                .setDescription("Custom Short Code")
                .setRequired(false)
        )
].map(command => command.toJSON());

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    try {
        await axios.get(`${process.env.API_BASE_URL}/health`);
        console.log("Connected to the Localhost URL Shortener");
    } catch {
        console.log("Can't connect to localhost API");
        console.log("Make sure that your URL Shortener is running on", process.env.API_BASE_URL);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log("Slash commands registered successfully");
    } catch (error) {
        console.error("Error registering commands", error);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "shortenurl") {
        const url = interaction.options.getString("url");
        const custom = interaction.options.getString("custom");

        await interaction.deferReply();
        try {
            console.log('Discord User ID being sent:', interaction.user.id);
            const result = await urlAPI.shortenURL(url, interaction.user.id, custom); 

            const shortURL = result.shortUrl || result.shortURL || result.short_url || result.url; 
            const originalURL = result.redirectUrl || result.originalURL || result.original_url || url;

            const embed = {
                color: 0x00ff00,
                title: 'URL Shortened!',
                fields: [
                    { name: 'Original', value: originalURL, inline: false },
                    { name: 'Shortened', value: shortURL, inline: false },
                    { name: 'Via', value: 'Your Localhost API', inline: true },
                    { name: 'Total Clicks', value: `${result.totalClicks || 0}`, inline: true } 
                ],
                footer: { text: 'Powered by your Local URL shortener' },
                timestamp: new Date().toISOString()
            };
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.log('Full error:', error); 
            
            
            let errorMessage = `❌ **Error:** ${error.message}`;
            
            
            if (error.message.includes('Validation Failed') || error.message.includes('validation')) {
                try {
                    
                    const errorData = JSON.parse(error.message.replace('Error: ', ''));
                    if (errorData.error === 'Validation Failed' && errorData.details) {
                        const validationErrors = errorData.details.map(detail => 
                            `• **${detail.path}:** ${detail.msg}${detail.value ? ` (You entered: "${detail.value}")` : ''}`
                        ).join('\n');
                        
                        errorMessage = `❌ **Validation Error:**\n${validationErrors}`;
                    }
                } catch (parseError) {
                    
                    errorMessage = `❌ **Validation Error:** Please check your input format.`;
                }
            }

            
            await interaction.editReply({
                content: errorMessage + `\n\n**💡 Tips:**\n• Make sure URLs start with http:// or https://\n• Check that the URL is complete (e.g., https://google.com not https://google.)\n• Custom codes must be 3-20 characters (letters, numbers, hyphens, underscores only)`
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);