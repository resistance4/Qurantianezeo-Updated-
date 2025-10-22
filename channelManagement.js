
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class ChannelManager {
    constructor(client, serverConfigs) {
        this.client = client;
        this.serverConfigs = serverConfigs || new Map();
    }

    isAuthorized(message) {
        const BOT_OWNER_ID = process.env.BOT_OWNER_ID || '1327564898460242015';
        const OWNER_CHANNEL_ID = '1410011813398974626';
        const serverConfig = this.serverConfigs?.get?.(message.guild.id) || {};
        const adminChannelId = serverConfig.adminChannelId || OWNER_CHANNEL_ID;
        
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.author.id === message.guild.ownerId;
        const hasAdminRole = message.member && message.member.permissions.has('Administrator');
        const isInOwnerChannel = message.channel.id === OWNER_CHANNEL_ID;
        const isInAdminChannel = message.channel.id === adminChannelId;

        // Bot owner can use commands anywhere
        if (isBotOwner) {
            return true;
        }

        // Server owner can use commands anywhere
        if (isServerOwner) {
            return true;
        }

        // Admins can use commands in owner channel or admin channel
        if (hasAdminRole && (isInOwnerChannel || isInAdminChannel)) {
            return true;
        }

        return false;
    }

    async sendLogMessage(guild, embed) {
        try {
            const LOGS_CHANNEL_ID = '1410019894568681617';
            const logsChannel = guild.channels.cache.get(LOGS_CHANNEL_ID);
            if (logsChannel) {
                await logsChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error sending channel log:', error);
        }
    }

    async handleCommand(message, command, args) {
        if (!this.isAuthorized(message)) {
            await message.reply('❌ You are not authorized to use this command.');
            return true;
        }

        switch(command) {
            // Text Channel Commands
            case 'lock':
            case 'locktext':
                return await this.lockChannel(message);
            case 'unlock':
            case 'unlocktext':
            case 'open':
            case 'opentext':
                return await this.unlockChannel(message);
            case 'hide':
            case 'hidechannel':
                return await this.hideChannel(message);
            case 'show':
            case 'showchannel':
            case 'reveal':
                return await this.showChannel(message);
            case 'slowmode':
            case 'slow':
                return await this.setSlowmode(message, args);
            case 'rename':
            case 'renamechannel':
                return await this.renameChannel(message, args);
            case 'topic':
            case 'settopic':
                return await this.setTopic(message, args);

            // Voice Channel Commands
            case 'lockvc':
            case 'lockvoice':
            case 'mutevc':
                return await this.lockVoiceChannel(message, args);
            case 'unlockvc':
            case 'unlockvoice':
            case 'openvc':
                return await this.unlockVoiceChannel(message, args);
            case 'hidevc':
            case 'hidevoice':
                return await this.hideVoiceChannel(message, args);
            case 'showvc':
            case 'showvoice':
            case 'revealvc':
                return await this.showVoiceChannel(message, args);
            case 'limit':
            case 'userlimit':
                return await this.setUserLimit(message, args);
            case 'bitrate':
            case 'setbitrate':
                return await this.setBitrate(message, args);

            // J2C Commands
            case 'j2c':
            case 'join2create':
            case 'setupj2c':
                return await this.setupJ2C(message, args);
            case 'removej2c':
            case 'disablej2c':
                return await this.removeJ2C(message);

            // Info Commands
            case 'permissions':
            case 'perms':
                return await this.checkPermissions(message, args);
            case 'channels':
            case 'listchannels':
                return await this.listChannels(message);

            default:
                return false;
        }
    }

    // Text Channel Methods
    async lockChannel(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            const lockEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Channel Locked')
                .setDescription(`Channel ${message.channel} has been locked`)
                .addFields(
                    { name: '👮 Locked By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [lockEmbed] });
            await this.sendLogMessage(message.guild, lockEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to lock channel: ' + error.message);
            return true;
        }
    }

    async unlockChannel(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null
            });

            const unlockEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`Channel ${message.channel} has been unlocked`)
                .addFields(
                    { name: '👮 Unlocked By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [unlockEmbed] });
            await this.sendLogMessage(message.guild, unlockEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to unlock channel: ' + error.message);
            return true;
        }
    }

    async hideChannel(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: false
            });

            const hideEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('👁️ Channel Hidden')
                .setDescription(`Channel has been hidden from @everyone`)
                .addFields(
                    { name: '👮 Hidden By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [hideEmbed] });
            await this.sendLogMessage(message.guild, hideEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to hide channel: ' + error.message);
            return true;
        }
    }

    async showChannel(message) {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: null
            });

            const showEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('👁️ Channel Revealed')
                .setDescription(`Channel is now visible to @everyone`)
                .addFields(
                    { name: '👮 Revealed By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [showEmbed] });
            await this.sendLogMessage(message.guild, showEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to show channel: ' + error.message);
            return true;
        }
    }

    async setSlowmode(message, args) {
        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            await message.reply('❌ Please provide a valid number between 0 and 21600 seconds.');
            return true;
        }

        try {
            await message.channel.setRateLimitPerUser(seconds);
            
            const slowmodeEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏰ Slowmode Updated')
                .setDescription(`Slowmode set to ${seconds} seconds`)
                .addFields(
                    { name: '👮 Set By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true },
                    { name: '⏱️ Duration', value: `${seconds}s`, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [slowmodeEmbed] });
            await this.sendLogMessage(message.guild, slowmodeEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to set slowmode: ' + error.message);
            return true;
        }
    }

    async renameChannel(message, args) {
        const newName = args.join('-').toLowerCase();
        if (!newName) {
            await message.reply('❌ Please provide a new channel name.');
            return true;
        }

        try {
            const oldName = message.channel.name;
            await message.channel.setName(newName);

            const renameEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📝 Channel Renamed')
                .setDescription(`Channel name updated`)
                .addFields(
                    { name: '👮 Renamed By', value: message.author.username, inline: true },
                    { name: '📍 Old Name', value: oldName, inline: true },
                    { name: '📍 New Name', value: newName, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [renameEmbed] });
            await this.sendLogMessage(message.guild, renameEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to rename channel: ' + error.message);
            return true;
        }
    }

    async setTopic(message, args) {
        const topic = args.join(' ');
        if (!topic) {
            await message.reply('❌ Please provide a topic.');
            return true;
        }

        try {
            await message.channel.setTopic(topic);

            const topicEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📋 Topic Updated')
                .setDescription(`Channel topic has been set`)
                .addFields(
                    { name: '👮 Set By', value: message.author.username, inline: true },
                    { name: '📍 Channel', value: message.channel.name, inline: true },
                    { name: '📋 Topic', value: topic, inline: false }
                )
                .setTimestamp();

            await message.reply({ embeds: [topicEmbed] });
            await this.sendLogMessage(message.guild, topicEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to set topic: ' + error.message);
            return true;
        }
    }

    // Voice Channel Methods
    async lockVoiceChannel(message, args) {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: false
            });

            const lockEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Voice Channel Locked')
                .setDescription(`Voice channel has been locked`)
                .addFields(
                    { name: '👮 Locked By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [lockEmbed] });
            await this.sendLogMessage(message.guild, lockEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to lock voice channel: ' + error.message);
            return true;
        }
    }

    async unlockVoiceChannel(message, args) {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                Connect: null
            });

            const unlockEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Voice Channel Unlocked')
                .setDescription(`Voice channel has been unlocked`)
                .addFields(
                    { name: '👮 Unlocked By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [unlockEmbed] });
            await this.sendLogMessage(message.guild, unlockEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to unlock voice channel: ' + error.message);
            return true;
        }
    }

    async hideVoiceChannel(message, args) {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: false
            });

            const hideEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('👁️ Voice Channel Hidden')
                .setDescription(`Voice channel hidden from @everyone`)
                .addFields(
                    { name: '👮 Hidden By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [hideEmbed] });
            await this.sendLogMessage(message.guild, hideEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to hide voice channel: ' + error.message);
            return true;
        }
    }

    async showVoiceChannel(message, args) {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                ViewChannel: null
            });

            const showEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('👁️ Voice Channel Revealed')
                .setDescription(`Voice channel visible to @everyone`)
                .addFields(
                    { name: '👮 Revealed By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [showEmbed] });
            await this.sendLogMessage(message.guild, showEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to show voice channel: ' + error.message);
            return true;
        }
    }

    async setUserLimit(message, args) {
        const channel = message.mentions.channels.first();
        const limit = parseInt(args[1]);

        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        if (isNaN(limit) || limit < 0 || limit > 99) {
            await message.reply('❌ Please provide a valid limit between 0 and 99.');
            return true;
        }

        try {
            await channel.setUserLimit(limit);

            const limitEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('👥 User Limit Set')
                .setDescription(`Voice channel user limit updated`)
                .addFields(
                    { name: '👮 Set By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true },
                    { name: '👥 Limit', value: limit === 0 ? 'Unlimited' : `${limit} users`, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [limitEmbed] });
            await this.sendLogMessage(message.guild, limitEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to set user limit: ' + error.message);
            return true;
        }
    }

    async setBitrate(message, args) {
        const channel = message.mentions.channels.first();
        const bitrate = parseInt(args[1]) * 1000;

        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel.');
            return true;
        }

        if (isNaN(bitrate) || bitrate < 8000 || bitrate > 384000) {
            await message.reply('❌ Please provide a valid bitrate between 8 and 384 kbps.');
            return true;
        }

        try {
            await channel.setBitrate(bitrate);

            const bitrateEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🎵 Bitrate Updated')
                .setDescription(`Voice channel bitrate has been set`)
                .addFields(
                    { name: '👮 Set By', value: message.author.username, inline: true },
                    { name: '🎤 Channel', value: channel.name, inline: true },
                    { name: '🎵 Bitrate', value: `${bitrate / 1000} kbps`, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [bitrateEmbed] });
            await this.sendLogMessage(message.guild, bitrateEmbed);
            return true;
        } catch (error) {
            await message.reply('❌ Failed to set bitrate: ' + error.message);
            return true;
        }
    }

    async setupJ2C(message, args) {
        const channel = message.mentions.channels.first();
        if (!channel || channel.type !== 2) {
            await message.reply('❌ Please mention a valid voice channel for Join-to-Create.');
            return true;
        }

        const config = this.serverConfigs.get(message.guild.id) || {};
        config.j2cChannelId = channel.id;
        this.serverConfigs.set(message.guild.id, config);

        const j2cEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Join-to-Create Enabled')
            .setDescription(`Users joining this channel will get their own temporary voice channel`)
            .addFields(
                { name: '👮 Set By', value: message.author.username, inline: true },
                { name: '🎤 Trigger Channel', value: channel.name, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [j2cEmbed] });
        await this.sendLogMessage(message.guild, j2cEmbed);
        return true;
    }

    async removeJ2C(message) {
        const config = this.serverConfigs.get(message.guild.id) || {};
        if (!config.j2cChannelId) {
            await message.reply('❌ Join-to-Create is not enabled on this server.');
            return true;
        }

        delete config.j2cChannelId;
        this.serverConfigs.set(message.guild.id, config);

        const removeEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('❌ Join-to-Create Disabled')
            .setDescription(`Join-to-Create system has been disabled`)
            .addFields(
                { name: '👮 Disabled By', value: message.author.username, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [removeEmbed] });
        await this.sendLogMessage(message.guild, removeEmbed);
        return true;
    }

    async checkPermissions(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            await message.reply('❌ User not found.');
            return true;
        }

        const permissions = message.channel.permissionsFor(member);
        const keyPerms = [];

        if (permissions.has(PermissionFlagsBits.Administrator)) keyPerms.push('Administrator');
        if (permissions.has(PermissionFlagsBits.ManageChannels)) keyPerms.push('Manage Channels');
        if (permissions.has(PermissionFlagsBits.ManageRoles)) keyPerms.push('Manage Roles');
        if (permissions.has(PermissionFlagsBits.ManageMessages)) keyPerms.push('Manage Messages');
        if (permissions.has(PermissionFlagsBits.SendMessages)) keyPerms.push('Send Messages');
        if (permissions.has(PermissionFlagsBits.ViewChannel)) keyPerms.push('View Channel');

        const permEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🔑 Channel Permissions')
            .setDescription(`Permissions for ${user.username} in ${message.channel}`)
            .addFields(
                { name: '👤 User', value: user.username, inline: true },
                { name: '📍 Channel', value: message.channel.name, inline: true },
                { name: '🔑 Key Permissions', value: keyPerms.length > 0 ? keyPerms.join(', ') : 'No special permissions', inline: false }
            )
            .setTimestamp();

        await message.reply({ embeds: [permEmbed] });
        return true;
    }

    async listChannels(message) {
        const textChannels = message.guild.channels.cache.filter(c => c.type === 0);
        const voiceChannels = message.guild.channels.cache.filter(c => c.type === 2);
        const categories = message.guild.channels.cache.filter(c => c.type === 4);

        const channelEmbed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📋 Server Channels')
            .setDescription(`Channel overview for ${message.guild.name}`)
            .addFields(
                { name: '💬 Text Channels', value: `${textChannels.size}`, inline: true },
                { name: '🎤 Voice Channels', value: `${voiceChannels.size}`, inline: true },
                { name: '📁 Categories', value: `${categories.size}`, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [channelEmbed] });
        return true;
    }

    // Handle slash commands
    async handleSlashCommand(interaction) {
        if (!this.isAuthorizedSlash(interaction)) {
            return await interaction.reply({ content: '❌ Unauthorized', ephemeral: true });
        }

        const { commandName } = interaction;

        try {
            switch(commandName) {
                case 'lock':
                    return await this.lockChannelSlash(interaction);
                case 'unlock':
                    return await this.unlockChannelSlash(interaction);
                case 'hide':
                    return await this.hideChannelSlash(interaction);
                case 'show':
                    return await this.showChannelSlash(interaction);
                case 'lockvc':
                    return await this.lockVoiceChannelSlash(interaction);
                case 'unlockvc':
                    return await this.unlockVoiceChannelSlash(interaction);
                case 'locklinks':
                    return await this.lockLinksSlash(interaction);
                case 'unlocklinks':
                    return await this.unlockLinksSlash(interaction);
                case 'lockembeds':
                    return await this.lockEmbedsSlash(interaction);
                case 'unlockembeds':
                    return await this.unlockEmbedsSlash(interaction);
                case 'lockattachments':
                    return await this.lockAttachmentsSlash(interaction);
                case 'unlockattachments':
                    return await this.unlockAttachmentsSlash(interaction);
                case 'lockreactions':
                    return await this.lockReactionsSlash(interaction);
                case 'unlockreactions':
                    return await this.unlockReactionsSlash(interaction);
                case 'lockall':
                    return await this.lockAllChannelsSlash(interaction);
                case 'unlockall':
                    return await this.unlockAllChannelsSlash(interaction);
                case 'nuke':
                    return await this.nukeChannelSlash(interaction);
                case 'clone':
                    return await this.cloneChannelSlash(interaction);
                case 'setnsfw':
                    return await this.setNSFWSlash(interaction);
                case 'announce':
                    return await this.announceSlash(interaction);
                default:
                    await interaction.reply({ content: '❌ Unknown channel command', ephemeral: true });
            }
        } catch (error) {
            console.error('Error in channel slash command:', error);
            const reply = { content: '❌ Error: ' + error.message, ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    isAuthorizedSlash(interaction) {
        const BOT_OWNER_ID = process.env.BOT_OWNER_ID || '1327564898460242015';
        const isBotOwner = interaction.user.id === BOT_OWNER_ID;
        const isServerOwner = interaction.user.id === interaction.guild.ownerId;
        const isInOwnerChannel = interaction.channel.id === '1410011813398974626';

        return isBotOwner || (isServerOwner && isInOwnerChannel);
    }

    async lockChannelSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Channel Locked')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock channel', ephemeral: true });
        }
    }

    async unlockChannelSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Channel Unlocked')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock channel', ephemeral: true });
        }
    }

    async hideChannelSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('👁️ Channel Hidden')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.name, inline: true },
                    { name: '👮 Hidden By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to hide channel', ephemeral: true });
        }
    }

    async showChannelSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('👁️ Channel Revealed')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Revealed By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to show channel', ephemeral: true });
        }
    }

    async lockVoiceChannelSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== 2) {
            return await interaction.reply({ content: '❌ Please select a valid voice channel', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                Connect: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Voice Channel Locked')
                .addFields(
                    { name: '🎤 Channel', value: channel.name, inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock voice channel', ephemeral: true });
        }
    }

    async unlockVoiceChannelSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== 2) {
            return await interaction.reply({ content: '❌ Please select a valid voice channel', ephemeral: true });
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                Connect: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Voice Channel Unlocked')
                .addFields(
                    { name: '🎤 Channel', value: channel.name, inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock voice channel', ephemeral: true });
        }
    }

    async lockLinksSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                EmbedLinks: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔗 Links Locked')
                .setDescription('Users cannot send clickable links in this channel')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock links', ephemeral: true });
        }
    }

    async unlockLinksSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                EmbedLinks: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔗 Links Unlocked')
                .setDescription('Users can now send clickable links')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock links', ephemeral: true });
        }
    }

    async lockEmbedsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                EmbedLinks: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('📎 Embeds Locked')
                .setDescription('Link previews and embeds are disabled')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock embeds', ephemeral: true });
        }
    }

    async unlockEmbedsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                EmbedLinks: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('📎 Embeds Unlocked')
                .setDescription('Link previews and embeds are enabled')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock embeds', ephemeral: true });
        }
    }

    async lockAttachmentsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                AttachFiles: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('📁 Attachments Locked')
                .setDescription('Users cannot upload files')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock attachments', ephemeral: true });
        }
    }

    async unlockAttachmentsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                AttachFiles: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('📁 Attachments Unlocked')
                .setDescription('Users can now upload files')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock attachments', ephemeral: true });
        }
    }

    async lockReactionsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                AddReactions: false
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('😶 Reactions Locked')
                .setDescription('Users cannot add reactions')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Locked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to lock reactions', ephemeral: true });
        }
    }

    async unlockReactionsSlash(interaction) {
        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                AddReactions: null
            });

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('😀 Reactions Unlocked')
                .setDescription('Users can now add reactions')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to unlock reactions', ephemeral: true });
        }
    }

    async lockAllChannelsSlash(interaction) {
        await interaction.deferReply();
        try {
            const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);
            let locked = 0;

            for (const [id, channel] of textChannels) {
                try {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: false
                    });
                    locked++;
                } catch (err) {
                    console.error(`Failed to lock ${channel.name}:`, err);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔒 Server Lockdown')
                .setDescription(`Locked ${locked}/${textChannels.size} text channels`)
                .addFields(
                    { name: '👮 Locked By', value: interaction.user.username, inline: true },
                    { name: '📊 Status', value: 'Server in lockdown', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to lock all channels', ephemeral: true });
        }
    }

    async unlockAllChannelsSlash(interaction) {
        await interaction.deferReply();
        try {
            const textChannels = interaction.guild.channels.cache.filter(c => c.type === 0);
            let unlocked = 0;

            for (const [id, channel] of textChannels) {
                try {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: null
                    });
                    unlocked++;
                } catch (err) {
                    console.error(`Failed to unlock ${channel.name}:`, err);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Lockdown Ended')
                .setDescription(`Unlocked ${unlocked}/${textChannels.size} text channels`)
                .addFields(
                    { name: '👮 Unlocked By', value: interaction.user.username, inline: true },
                    { name: '📊 Status', value: 'Server unlocked', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to unlock all channels', ephemeral: true });
        }
    }

    async nukeChannelSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const oldChannel = interaction.channel;
            const position = oldChannel.position;

            const newChannel = await oldChannel.clone({
                name: oldChannel.name,
                type: oldChannel.type,
                parent: oldChannel.parent,
                position: position,
                reason: `Channel nuked by ${interaction.user.username}`
            });

            await oldChannel.delete();

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('💥 Channel Nuked')
                .setDescription('Channel has been nuked and recreated')
                .addFields(
                    { name: '👮 Nuked By', value: interaction.user.username, inline: true },
                    { name: '📍 Channel', value: newChannel.toString(), inline: true }
                )
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to nuke channel: ' + error.message });
        }
    }

    async cloneChannelSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const cloned = await interaction.channel.clone({
                reason: `Channel cloned by ${interaction.user.username}`
            });

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📋 Channel Cloned')
                .addFields(
                    { name: '👮 Cloned By', value: interaction.user.username, inline: true },
                    { name: '📍 Original', value: interaction.channel.toString(), inline: true },
                    { name: '📍 Clone', value: cloned.toString(), inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.editReply({ content: '❌ Failed to clone channel: ' + error.message });
        }
    }

    async setNSFWSlash(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        try {
            await interaction.channel.setNSFW(enabled);

            const embed = new EmbedBuilder()
                .setColor(enabled ? '#FF0000' : '#00FF00')
                .setTitle(enabled ? '🔞 NSFW Enabled' : '✅ NSFW Disabled')
                .addFields(
                    { name: '📍 Channel', value: interaction.channel.toString(), inline: true },
                    { name: '👮 Set By', value: interaction.user.username, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to set NSFW status', ephemeral: true });
        }
    }

    async announceSlash(interaction) {
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const color = interaction.options.getString('color') || '#0099FF';

        try {
            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle('📢 ' + title)
                .setDescription(message)
                .addFields(
                    { name: '👤 Announced By', value: interaction.user.username, inline: true },
                    { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setTimestamp();

            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Announcement sent!', ephemeral: true });
            await this.sendLogMessage(interaction.guild, embed);
        } catch (error) {
            await interaction.reply({ content: '❌ Failed to send announcement', ephemeral: true });
        }
    }
}

module.exports = ChannelManager;
