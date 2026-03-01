const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const token = process.env.TOKEN;
const clientId = "1473402977745109052";
const guildIds = ["1107309126171770912", "1453149447541227624"];

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
        .toJSON(),
    new SlashCommandBuilder()
        .setName('join')
        .setDescription('join your voice channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
    new SlashCommandBuilder()
        .setName('leave')
        .setDescription('leave the voice channel')
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

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
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

    if (interaction.commandName === 'join') {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'يجب أن تكون في مكالمة صوتية أولاً!', ephemeral: true });
        }
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        await interaction.reply({ content: 'دخلت المكالمة ✅', ephemeral: true });
    }

    if (interaction.commandName === 'leave') {
        const connection = require('@discordjs/voice').getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
            await interaction.reply({ content: 'خرجت من المكالمة ✅', ephemeral: true });
        } else {
            await interaction.reply({ content: 'البوت مو في مكالمة!', ephemeral: true });
        }
    }
});

client.login(token);