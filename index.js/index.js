const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const token = process.env.TOKEN;
const clientId = "1473402977745109052";
const guildIds = ["1107309126171770912", "1453149447541227624"];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
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
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        
        // ✅ التصحيح: سجل الأوامر لكل سيرفر
        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`Commands registered for guild: ${guildId}`);
        }

        console.log('Successfully reloaded application (/) commands.');
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

        // ✅ تحسين: رد فوري عشان ما ينتهي وقت التفاعل
        await interaction.reply({ content: 'جاري إرسال الرسائل... ⏳', ephemeral: true });

        const members = await interaction.guild.members.fetch();
        let successCount = 0;

        for (const [, member] of members) {
            if (!member.user.bot) {
                try {
                    await member.send(text);
                    successCount++;
                } catch {}
            }
        }

        // ✅ تحديث الرد بعد الانتهاء
        await interaction.editReply({ content: `تم إرسال الرسالة لـ ${successCount} عضو ✅` });
    }
});

client.login(token);