const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const token = process.env.TOKEN;
const clientId = "1473402977745109052";
const guildIds = ["1107309126171770912", "1453149447541227624"];
const voiceChannelId = "1473329740688392378";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('use it to dm members')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('your message')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('image or GIF link (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
        }
        console.log('Commands registered successfully.');
    } catch (error) {
        console.error(error);
    }
})();

function joinVoice(guild) {
    try {
        const channel = guild.channels.cache.get(voiceChannelId);
        if (!channel) return;
        const connection = joinVoiceChannel({
            channelId: voiceChannelId,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });
        connection.on('error', () => {
            setTimeout(() => joinVoice(guild), 5000);
        });
    } catch (e) {}
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.guilds.cache.forEach(guild => joinVoice(guild));
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.id === client.user.id && !newState.channelId) {
        setTimeout(() => {
            joinVoice(oldState.guild);
        }, 3000);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'dm') {
        const text = interaction.options.getString('message');
        const imageUrl = interaction.options.getString('image');

        await interaction.reply({ content: 'جاري إرسال الرسائل... ⏳', ephemeral: true });

        const members = await interaction.guild.members.fetch();
        let successCount = 0;

        for (const [, member] of members) {
            if (!member.user.bot) {
                try {
                    const messageData = { content: text };
                    if (imageUrl) messageData.files = [imageUrl];
                    await member.send(messageData);
                    successCount++;
                } catch {}
            }
        }

        await interaction.editReply({ content: `تم إرسال الرسالة لـ ${successCount} عضو ✅` });
    }
});
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});
client.login(token);