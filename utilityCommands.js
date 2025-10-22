
const { EmbedBuilder } = require('discord.js');

class UtilityCommands {
    constructor(client) {
        this.client = client;
    }

    async handleCommand(message, command, args) {
        switch(command) {
            case 'ping':
                return this.handlePing(message);
            case 'dev':
                return this.handleDev(message);
            case 'ui':
            case 'userinfo':
                return this.handleUserInfo(message, args);
            case 'dm':
                return this.handleDM(message, args);
            case 'fck':
                return this.handleFck(message);
            default:
                return false;
        }
    }

    async handlePing(message) {
        const botLatency = Date.now() - message.createdTimestamp;
        const apiLatency = Math.round(this.client.ws.ping);

        const pingEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🏓 Pong!')
            .setDescription('**Bot Performance Metrics**')
            .addFields(
                { name: '🤖 Bot Latency', value: `${botLatency}ms`, inline: true },
                { name: '📡 API Latency', value: `${apiLatency}ms`, inline: true },
                { name: '⚡ Status', value: botLatency < 200 ? '✅ Excellent' : botLatency < 500 ? '🟡 Good' : '🔴 Poor', inline: true }
            )
            .setFooter({ text: 'Performance Monitor' })
            .setTimestamp();

        await message.reply({ embeds: [pingEmbed] });
        return true;
    }

    async handleDev(message) {
        const devEmbed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setTitle('✿ Developer Information')
            .setDescription(`**About the Developer**\n\n` +
                `discord.gg/scriptspace was developed by made with love ᡣ𐭩 at scriptspace\n\n` +
                `**✿ Website:** https://scriptspace.in/\n\n` +
                `discord.gg/scriptspace is a highly engineered discord server with AI Integrations, NextGen Quarantine Systems, NextGen Interim Role Management Systems And Temporary Voice Channel management systems everything was made possible by script.agi\n\n` +
                `**ᯓᡣ𐭩 Technical Features**\n` +
                `ᡣ𐭩 God-Level Protection System\n` +
                `ᡣ𐭩 AI-Powered Integrations\n` +
                `ᡣ𐭩 NextGen Quarantine Management\n` +
                `ᡣ𐭩 Advanced Interim Role System\n` +
                `ᡣ𐭩 Voice Channel Management\n` +
                `ᡣ𐭩 Real-time Security Monitoring\n\n` +
                `**✿ Built with Script.AGI Technology**`
            )
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage('https://cdn.discordapp.com/attachments/1377710452653424711/1410001205639254046/a964ff33-1eaf-49ed-b487-331b3ffe3ebd.gif')
            .setFooter({
                text: 'Developer Information • Made with ❤️ at ScriptSpace',
                iconURL: 'https://cdn.discordapp.com/attachments/1377710452653424711/1410001205639254046/a964ff33-1eaf-49ed-b487-331b3ffe3ebd.gif'
            })
            .setTimestamp();

        await message.reply({ embeds: [devEmbed] });
        return true;
    }

    async handleUserInfo(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            await message.reply('❌ User not found in this server.');
            return true;
        }

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        const userInfoEmbed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#FFFFFF')
            .setTitle(`👤 User Information: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: roles.length > 0 ? roles.join(', ') : 'No roles', inline: false },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '👑 Server Owner', value: message.guild.ownerId === user.id ? 'Yes' : 'No', inline: true }
            )
            .setFooter({ text: 'User Information' })
            .setTimestamp();

        await message.reply({ embeds: [userInfoEmbed] });
        return true;
    }

    async handleDM(message, args) {
        const user = message.mentions.users.first();
        if (!user) {
            await message.reply('❌ Please mention a user to send a DM.');
            return true;
        }

        const dmMessage = args.slice(1).join(' ');
        if (!dmMessage) {
            await message.reply('❌ Please provide a message to send.');
            return true;
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📧 Direct Message from Server Staff')
                .setDescription(dmMessage)
                .addFields(
                    { name: '🏠 Server', value: message.guild.name, inline: true },
                    { name: '👤 From', value: message.author.username, inline: true }
                )
                .setFooter({ text: 'This is an official message from server staff' })
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
            await message.reply(`✅ DM sent successfully to ${user.username}`);
        } catch (error) {
            await message.reply('❌ Could not send DM. User may have DMs disabled.');
        }
        return true;
    }

    async handleFck(message) {
        const fckEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🚨 FUCK YOU MOTHERFUCKER')
            .setDescription(`Fuck You MotherFucker, don't even think about nuking discord.gg/scriptspace even in your dream you will be brutally fucked by script.agi`)
            .setImage('https://cdn.discordapp.com/attachments/1377710452653424711/1411748251920765018/have-a-nice-day-fuck-you.gif')
            .setFooter({ text: 'Script.AGI Maximum Security System' })
            .setTimestamp();

        await message.reply({ embeds: [fckEmbed] });
        return true;
    }

    async handleSlashCommand(interaction) {
        const { commandName } = interaction;

        try {
            switch(commandName) {
                case 'serverinfo':
                    return await this.serverInfoSlash(interaction);
                case 'avatar':
                    return await this.avatarSlash(interaction);
                case 'banner':
                    return await this.bannerSlash(interaction);
                case 'rolecolor':
                    return await this.roleColorSlash(interaction);
                case 'membercount':
                    return await this.memberCountSlash(interaction);
                case 'botstats':
                    return await this.botStatsSlash(interaction);
                case 'invite':
                    return await this.inviteSlash(interaction);
                case 'uptime':
                    return await this.uptimeSlash(interaction);
                case 'emojis':
                    return await this.emojisSlash(interaction);
                case 'stickers':
                    return await this.stickersSlash(interaction);
                case 'boosters':
                    return await this.boostersSlash(interaction);
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error in utility slash command:', error);
            const reply = { content: '❌ Error: ' + error.message, ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    async serverInfoSlash(interaction) {
        const guild = interaction.guild;
        await guild.members.fetch();

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle(`🏰 ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🎨 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🎪 Stickers', value: `${guild.stickers.cache.size}`, inline: true },
                { name: '💎 Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
                { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true }
            )
            .setTimestamp();

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        await interaction.reply({ embeds: [embed] });
    }

    async avatarSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle(`🖼️ ${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '🔗 Links', value: `[PNG](${user.displayAvatarURL({ extension: 'png', size: 1024 })}) | [JPG](${user.displayAvatarURL({ extension: 'jpg', size: 1024 })}) | [WEBP](${user.displayAvatarURL({ extension: 'webp', size: 1024 })})`, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async bannerSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const fetchedUser = await user.fetch(true);

        if (!fetchedUser.bannerURL()) {
            return await interaction.reply({ content: '❌ This user has no banner set', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(fetchedUser.accentColor || '#0099FF')
            .setTitle(`🎨 ${user.username}'s Banner`)
            .setImage(fetchedUser.bannerURL({ size: 1024 }))
            .addFields(
                { name: '🔗 Links', value: `[PNG](${fetchedUser.bannerURL({ extension: 'png', size: 1024 })}) | [JPG](${fetchedUser.bannerURL({ extension: 'jpg', size: 1024 })}) | [WEBP](${fetchedUser.bannerURL({ extension: 'webp', size: 1024 })})`, inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async roleColorSlash(interaction) {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setColor(role.color || '#000000')
            .setTitle(`🎨 ${role.name} Color`)
            .addFields(
                { name: '🔢 Hex', value: role.hexColor, inline: true },
                { name: '🔢 RGB', value: `${(role.color >> 16) & 255}, ${(role.color >> 8) & 255}, ${role.color & 255}`, inline: true },
                { name: '🔢 Integer', value: `${role.color}`, inline: true },
                { name: '👥 Members', value: `${role.members.size}`, inline: true },
                { name: '📊 Position', value: `${role.position}`, inline: true },
                { name: '🔹 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async memberCountSlash(interaction) {
        const guild = interaction.guild;
        await guild.members.fetch();

        const total = guild.memberCount;
        const humans = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = guild.members.cache.filter(m => m.user.bot).size;
        const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
        const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('📊 Member Statistics')
            .addFields(
                { name: '👥 Total Members', value: `${total}`, inline: true },
                { name: '👤 Humans', value: `${humans}`, inline: true },
                { name: '🤖 Bots', value: `${bots}`, inline: true },
                { name: '🟢 Online', value: `${online}`, inline: true },
                { name: '🟡 Idle', value: `${idle}`, inline: true },
                { name: '🔴 DND', value: `${dnd}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async botStatsSlash(interaction) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🤖 Bot Statistics')
            .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
                { name: '📡 Ping', value: `${Math.round(this.client.ws.ping)}ms`, inline: true },
                { name: '🏰 Servers', value: `${this.client.guilds.cache.size}`, inline: true },
                { name: '👥 Users', value: `${this.client.users.cache.size}`, inline: true },
                { name: '💬 Channels', value: `${this.client.channels.cache.size}`, inline: true },
                { name: '💾 Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true }
            )
            .setFooter({ text: 'Made with ❤️ at ScriptSpace' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async inviteSlash(interaction) {
        const invite = `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`;

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🔗 Invite Bot')
            .setDescription(`[Click here to invite ${this.client.user.username}](${invite})`)
            .addFields(
                { name: '🔑 Permissions', value: 'Administrator', inline: true },
                { name: '📊 Servers', value: `${this.client.guilds.cache.size}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async uptimeSlash(interaction) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('⏰ Bot Uptime')
            .setDescription(`**${days}** days, **${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`)
            .addFields(
                { name: '📅 Started', value: `<t:${Math.floor((Date.now() - uptime * 1000) / 1000)}:F>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async emojisSlash(interaction) {
        const emojis = interaction.guild.emojis.cache;

        if (emojis.size === 0) {
            return await interaction.reply({ content: '❌ No custom emojis in this server', ephemeral: true });
        }

        const emojiList = emojis.map(e => `${e} \`:${e.name}:\``).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle(`🎨 Server Emojis (${emojis.size})`)
            .setDescription(emojiList.substring(0, 4096))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async stickersSlash(interaction) {
        const stickers = interaction.guild.stickers.cache;

        if (stickers.size === 0) {
            return await interaction.reply({ content: '❌ No custom stickers in this server', ephemeral: true });
        }

        const stickerList = stickers.map(s => `**${s.name}** - ${s.description || 'No description'}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle(`🎪 Server Stickers (${stickers.size})`)
            .setDescription(stickerList.substring(0, 4096))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }

    async boostersSlash(interaction) {
        const boosters = interaction.guild.members.cache.filter(m => m.premiumSince);

        if (boosters.size === 0) {
            return await interaction.reply({ content: '❌ No server boosters', ephemeral: true });
        }

        const boosterList = boosters.map(m => `${m.user.username} - Boosting since <t:${Math.floor(m.premiumSince.getTime() / 1000)}:R>`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle(`💎 Server Boosters (${boosters.size})`)
            .setDescription(boosterList.substring(0, 4096))
            .addFields(
                { name: '🚀 Boost Level', value: `Level ${interaction.guild.premiumTier}`, inline: true },
                { name: '💫 Total Boosts', value: `${interaction.guild.premiumSubscriptionCount || 0}`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = UtilityCommands;
