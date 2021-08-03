import { ChannelMentionRegex, SnowflakeRegex } from '@sapphire/discord-utilities';
import type { Guild, GuildChannel } from 'discord.js';
import { err, ok, Result } from '../parsers/Result';

export function resolveGuildChannel(parameter: string, guild: Guild): Result<GuildChannel, string> {
	const channel = resolveById(parameter, guild) ?? resolveByQuery(parameter, guild);
	if (channel) return ok(channel);
	return err('The argument did not resolve to a guild channel.');
}

function resolveById(argument: string, guild: Guild): GuildChannel | null {
	const channelId = ChannelMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);
	return channelId ? guild.channels.cache.get(channelId[1]) ?? null : null;
}

function resolveByQuery(argument: string, guild: Guild): GuildChannel | null {
	const lowerCaseArgument = argument.toLowerCase();
	return guild.channels.cache.find((channel) => channel.name.toLowerCase() === lowerCaseArgument) ?? null;
}
