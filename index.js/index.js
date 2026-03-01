const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

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
        await interaction.reply({ content: 'Sending messages... ⏳' });
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
        await interaction.editReply({ content: `Message sent to ${successCount} members ✅` });
    }

    if (commandName === 'kick') {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        try {
            try { await member.send(`You have been **kicked** from **${interaction.guild.name}**\n**Reason:** ${reason}`); } catch {}
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('Member Kicked')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: 'Failed to kick ❌' });
        }
    }

    if (commandName === 'ban') {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        try {
            try { await member.send(`You have been **banned** from **${interaction.guild.name}**\n**Reason:** ${reason}`); } catch {}
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Member Banned')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: 'Failed to ban ❌' });
        }
    }

    if (commandName === 'unban') {
        const userId = interaction.options.getString('userid');
        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `User unbanned successfully ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to unban ❌' });
        }
    }

    if (commandName === 'mute') {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        try {
            try { await member.send(`You have been **muted** in **${interaction.guild.name}**\n**Reason:** ${reason}`); } catch {}
            await member.timeout(28 * 24 * 60 * 60 * 1000, reason);
            const embed = new EmbedBuilder()
                .setColor('Grey')
                .setTitle('Member Muted')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: 'Failed to mute ❌' });
        }
    }

    if (commandName === 'unmute') {
        const member = interaction.options.getMember('user');
        try {
            await member.timeout(null);
            try { await member.send(`You have been **unmuted** in **${interaction.guild.name}**`); } catch {}
            await interaction.reply({ content: `${member.user.tag} has been unmuted ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to unmute ❌' });
        }
    }

    if (commandName === 'timeout') {
        const member = interaction.options.getMember('user');
        const minutes = interaction.options.getInteger('minutes');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        try {
            try { await member.send(`You have been **timed out** in **${interaction.guild.name}** for **${minutes} minutes**\n**Reason:** ${reason}`); } catch {}
            await member.timeout(minutes * 60 * 1000, reason);
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('Member Timed Out')
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Duration', value: `${minutes} minutes`, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: 'Failed to timeout ❌' });
        }
    }

    if (commandName === 'untimeout') {
        const member = interaction.options.getMember('user');
        try {
            await member.timeout(null);
            try { await member.send(`Your **timeout** has been removed in **${interaction.guild.name}**`); } catch {}
            await interaction.reply({ content: `Timeout removed from ${member.user.tag} ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to remove timeout ❌' });
        }
    }

    if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Deleted ${amount} messages ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to delete messages ❌' });
        }
    }

    if (commandName === 'lock') {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            await interaction.reply({ content: '🔒 Channel locked' });
        } catch {
            await interaction.reply({ content: 'Failed to lock ❌' });
        }
    }

    if (commandName === 'unlock') {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            await interaction.reply({ content: '🔓 Channel unlocked' });
        } catch {
            await interaction.reply({ content: 'Failed to unlock ❌' });
        }
    }

    if (commandName === 'giverole') {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        try {
            await member.roles.add(role);
            await interaction.reply({ content: `Role **${role.name}** given to ${member.user.tag} ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to give role ❌' });
        }
    }

    if (commandName === 'removerole') {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        try {
            await member.roles.remove(role);
            await interaction.reply({ content: `Role **${role.name}** removed from ${member.user.tag} ✅` });
        } catch {
            await interaction.reply({ content: 'Failed to remove role ❌' });
        }
    }

    if (commandName === 'warn') {
        const member = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');
        if (!warnings.has(member.user.id)) warnings.set(member.user.id, []);
        warnings.get(member.user.id).push({ reason, date: new Date().toLocaleDateString() });
        const totalWarnings = warnings.get(member.user.id).length;
        try { 
            await member.send(`⚠️ You have received a **warning** in **${interaction.guild.name}**\n**Reason:** ${reason}\n**Total warnings:** ${totalWarnings}`); 
        } catch {}
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('Member Warned')
            .addFields(
                { name: 'User', value: `${member.user.tag}`, inline: true },
                { name: 'Reason', value: reason, inline: true },
                { name: 'Total Warnings', value: `${totalWarnings}`, inline: true }
            );
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'unwarn') {
        const member = interaction.options.getMember('user');
        if (warnings.has(member.user.id) && warnings.get(member.user.id).length > 0) {
            warnings.get(member.user.id).pop();
            await interaction.reply({ content: `Last warning removed from ${member.user.tag} ✅` });
        } else {
            await interaction.reply({ content: 'This user has no warnings ❌' });
        }
    }

    if (commandName === 'warnings') {
        const member = interaction.options.getMember('user');
        const userWarnings = warnings.get(member.user.id) || [];
        if (userWarnings.length === 0) {
            await interaction.reply({ content: `${member.user.tag} has no warnings ✅` });
        } else {
            const embed = new EmbedBuilder()
                .setTitle(`Warnings - ${member.user.tag}`)
                .setColor('Red')
                .setDescription(userWarnings.map((w, i) => `**${i + 1}.** ${w.reason} - ${w.date}`).join('\n'));
            await interaction.reply({ embeds: [embed] });
        }
    }

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('📋 Commands List')
            .setColor('Blue')
            .addFields(
                { name: '📨 /dm', value: 'Send a message to all members' },
                { name: '👢 /kick', value: 'Kick a member' },
                { name: '🔨 /ban', value: 'Ban a member' },
                { name: '✅ /unban', value: 'Unban a member' },
                { name: '🔇 /mute', value: 'Mute a member' },
                { name: '🔊 /unmute', value: 'Unmute a member' },
                { name: '⏱️ /timeout', value: 'Timeout a member' },
                { name: '✅ /untimeout', value: 'Remove timeout' },
                { name: '🗑️ /clear', value: 'Delete messages' },
                { name: '🔒 /lock', value: 'Lock the channel' },
                { name: '🔓 /unlock', value: 'Unlock the channel' },
                { name: '🎭 /giverole', value: 'Give a role' },
                { name: '❌ /removerole', value: 'Remove a role' },
                { name: '⚠️ /warn', value: 'Warn a member' },
                { name: '✅ /unwarn', value: 'Remove a warning' },
                { name: '📋 /warnings', value: 'Show member warnings' }
            );
        await interaction.reply({ embeds: [embed] });
    }
});

client.login(token);