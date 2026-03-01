const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

const token = process.env.TOKEN;
const clientId = "1473402977745109052";
const guildIds = ["1107309126171770912", "1453149447541227624"];
const voiceChannelId = "1473329740688392378";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

const warnings = new Map();

const commands = [
    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Send a DM to all members')
        .addStringOption(o => o.setName('message').setDescription('Your message').setRequired(true))
        .addStringOption(o => o.setName('image').setDescription('Image or GIF link (optional)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member')
        .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a member')
        .addStringOption(o => o.setName('userid').setDescription('User ID to unban').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a member')
        .addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a member')
        .addUserOption(o => o.setName('user').setDescription('User to unmute').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member')
        .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
        .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a member')
        .addUserOption(o => o.setName('user').setDescription('User to untimeout').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages')
        .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Give a role to a member')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .addRoleOption(o => o.setName('role').setDescription('Role to give').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Remove a role from a member')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member')
        .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove last warning from a member')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Show warnings of a member')
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show all commands'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        for (const guildId of guildIds) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
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

client.once('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.guilds.cache.forEach(guild => joinVoice(guild));
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.member.id === client.user.id && !newState.channelId) {
        setTimeout(() => joinVoice(oldState.guild), 3000);
    }
});

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'dm') {
        const text = interaction.options.getString('message');
        const imageUrl = interaction.options.getString('image');
        await interaction.reply({ content: 'جاري إرسال الرسائل... ⏳', flags: 64 });
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

    if (commandName === 'kick') {
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason';
        try {
            await user.kick(reason);
            await interaction.reply({ content: `تم طرد ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل الطرد ❌', flags: 64 });
        }
    }

    if (commandName === 'ban') {
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason';
        try {
            await user.ban({ reason });
            await interaction.reply({ content: `تم بان ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل البان ❌', flags: 64 });
        }
    }

    if (commandName === 'unban') {
        const userId = interaction.options.getString('userid');
        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `تم رفع البان ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل رفع البان ❌', flags: 64 });
        }
    }

    if (commandName === 'mute') {
        const user = interaction.options.getMember('user');
        try {
            await user.timeout(28 * 24 * 60 * 60 * 1000);
            await interaction.reply({ content: `تم ميوت ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل الميوت ❌', flags: 64 });
        }
    }

    if (commandName === 'unmute') {
        const user = interaction.options.getMember('user');
        try {
            await user.timeout(null);
            await interaction.reply({ content: `تم رفع الميوت عن ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل رفع الميوت ❌', flags: 64 });
        }
    }

    if (commandName === 'timeout') {
        const user = interaction.options.getMember('user');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason';
        try {
            await user.timeout(minutes * 60 * 1000, reason);
            await interaction.reply({ content: `تم تايم اوت ${user.user.tag} لمدة ${minutes} دقيقة ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل التايم اوت ❌', flags: 64 });
        }
    }

    if (commandName === 'untimeout') {
        const user = interaction.options.getMember('user');
        try {
            await user.timeout(null);
            await interaction.reply({ content: `تم رفع التايم اوت عن ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل رفع التايم اوت ❌', flags: 64 });
        }
    }

    if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `تم حذف ${amount} رسالة ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل الحذف ❌', flags: 64 });
        }
    }

    if (commandName === 'lock') {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            await interaction.reply({ content: 'تم قفل القناة 🔒' });
        } catch {
            await interaction.reply({ content: 'فشل القفل ❌', flags: 64 });
        }
    }

    if (commandName === 'unlock') {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            await interaction.reply({ content: 'تم فتح القناة 🔓' });
        } catch {
            await interaction.reply({ content: 'فشل الفتح ❌', flags: 64 });
        }
    }

    if (commandName === 'giverole') {
        const user = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        try {
            await user.roles.add(role);
            await interaction.reply({ content: `تم إعطاء رول ${role.name} لـ ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل إعطاء الرول ❌', flags: 64 });
        }
    }

    if (commandName === 'removerole') {
        const user = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        try {
            await user.roles.remove(role);
            await interaction.reply({ content: `تم إزالة رول ${role.name} من ${user.user.tag} ✅`, flags: 64 });
        } catch {
            await interaction.reply({ content: 'فشل إزالة الرول ❌', flags: 64 });
        }
    }

    if (commandName === 'warn') {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        if (!warnings.has(user.id)) warnings.set(user.id, []);
        warnings.get(user.id).push({ reason, date: new Date().toLocaleDateString() });
        await interaction.reply({ content: `تم تحذير ${user.tag} بسبب: ${reason} ✅`, flags: 64 });
    }

    if (commandName === 'unwarn') {
        const user = interaction.options.getUser('user');
        if (warnings.has(user.id) && warnings.get(user.id).length > 0) {
            warnings.get(user.id).pop();
            await interaction.reply({ content: `تم حذف آخر تحذير من ${user.tag} ✅`, flags: 64 });
        } else {
            await interaction.reply({ content: 'لا يوجد تحذيرات ❌', flags: 64 });
        }
    }

    if (commandName === 'warnings') {
        const user = interaction.options.getUser('user');
        const userWarnings = warnings.get(user.id) || [];
        if (userWarnings.length === 0) {
            await interaction.reply({ content: `${user.tag} ليس لديه تحذيرات ✅`, flags: 64 });
        } else {
            const embed = new EmbedBuilder()
                .setTitle(`تحذيرات ${user.tag}`)
                .setColor('Red')
                .setDescription(userWarnings.map((w, i) => `**${i + 1}.** ${w.reason} - ${w.date}`).join('\n'));
            await interaction.reply({ embeds: [embed], flags: 64 });
        }
    }

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('📋 قائمة الأوامر')
            .setColor('Blue')
            .addFields(
                { name: '📨 /dm', value: 'إرسال رسالة لجميع الأعضاء' },
                { name: '👢 /kick', value: 'طرد عضو' },
                { name: '🔨 /ban', value: 'بان عضو' },
                { name: '✅ /unban', value: 'رفع البان' },
                { name: '🔇 /mute', value: 'ميوت عضو' },
                { name: '🔊 /unmute', value: 'رفع الميوت' },
                { name: '⏱️ /timeout', value: 'تايم اوت عضو' },
                { name: '✅ /untimeout', value: 'رفع التايم اوت' },
                { name: '🗑️ /clear', value: 'حذف رسائل' },
                { name: '🔒 /lock', value: 'قفل القناة' },
                { name: '🔓 /unlock', value: 'فتح القناة' },
                { name: '🎭 /giverole', value: 'إعطاء رول' },
                { name: '❌ /removerole', value: 'إزالة رول' },
                { name: '⚠️ /warn', value: 'تحذير عضو' },
                { name: '✅ /unwarn', value: 'حذف تحذير' },
                { name: '📋 /warnings', value: 'عرض تحذيرات عضو' }
            );
        await interaction.reply({ embeds: [embed] });
    }
});

client.login(token);