"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/extensions/discord/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_discord3 = require("src/core/source/plugin-sdk/discord");

// src/core/extensions/discord/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_discord = require("src/core/source/plugin-sdk/discord");

// src/core/extensions/discord/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } = (0, import_compat.createPluginRuntimeStore)("Discord runtime not initialized");

// src/core/extensions/discord/src/channel.ts
var meta = (0, import_discord.getChatChannelMeta)("discord");
var discordMessageActions = {
  listActions: (ctx) => getDiscordRuntime().channel.discord.messageActions?.listActions?.(ctx) ?? [],
  extractToolSend: (ctx) => getDiscordRuntime().channel.discord.messageActions?.extractToolSend?.(ctx) ?? null,
  handleAction: async (ctx) => {
    const ma = getDiscordRuntime().channel.discord.messageActions;
    if (!ma?.handleAction) {
      throw new Error("Discord message actions not available");
    }
    return ma.handleAction(ctx);
  }
};
var discordConfigAccessors = (0, import_compat3.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => (0, import_discord.resolveDiscordAccount)({ cfg, accountId }),
  resolveAllowFrom: (account) => account.config.dm?.allowFrom,
  formatAllowFrom: (allowFrom) => (0, import_compat3.formatAllowFromLowercase)({ allowFrom }),
  resolveDefaultTo: (account) => account.config.defaultTo
});
var discordConfigBase = (0, import_compat2.createScopedChannelConfigBase)({
  sectionKey: "discord",
  listAccountIds: import_discord.listDiscordAccountIds,
  resolveAccount: (cfg, accountId) => (0, import_discord.resolveDiscordAccount)({ cfg, accountId }),
  inspectAccount: (cfg, accountId) => (0, import_discord.inspectDiscordAccount)({ cfg, accountId }),
  defaultAccountId: import_discord.resolveDefaultDiscordAccountId,
  clearBaseFields: ["token", "name"]
});
var discordPlugin = {
  id: "discord",
  meta: {
    ...meta
  },
  onboarding: import_discord.discordOnboardingAdapter,
  pairing: {
    idLabel: "discordUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(discord|user):/i, ""),
    notifyApproval: async ({ id }) => {
      await getDiscordRuntime().channel.discord.sendMessageDiscord(
        `user:${id}`,
        import_discord.PAIRING_APPROVED_MESSAGE
      );
    }
  },
  capabilities: {
    chatTypes: ["direct", "channel", "thread"],
    polls: true,
    reactions: true,
    threads: true,
    media: true,
    nativeCommands: true
  },
  streaming: {
    blockStreamingCoalesceDefaults: { minChars: 1500, idleMs: 1e3 }
  },
  reload: { configPrefixes: ["channels.discord"] },
  configSchema: (0, import_discord.buildChannelConfigSchema)(import_discord.DiscordConfigSchema),
  config: {
    ...discordConfigBase,
    isConfigured: (account) => Boolean(account.token?.trim()),
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.token?.trim()),
      tokenSource: account.tokenSource
    }),
    ...discordConfigAccessors
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat3.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "discord",
        accountId,
        fallbackAccountId: account.accountId ?? import_discord.DEFAULT_ACCOUNT_ID,
        policy: account.config.dm?.policy,
        allowFrom: account.config.dm?.allowFrom ?? [],
        allowFromPathSuffix: "dm.",
        normalizeEntry: (raw) => raw.replace(/^(discord|user):/i, "").replace(/^<@!?(\d+)>$/, "$1")
      });
    },
    collectWarnings: ({ account, cfg }) => {
      const guildEntries = account.config.guilds ?? {};
      const guildsConfigured = Object.keys(guildEntries).length > 0;
      const channelAllowlistConfigured = guildsConfigured;
      return (0, import_compat3.collectOpenProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.discord !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        collect: (groupPolicy) => (0, import_compat3.collectOpenGroupPolicyConfiguredRouteWarnings)({
          groupPolicy,
          routeAllowlistConfigured: channelAllowlistConfigured,
          configureRouteAllowlist: {
            surface: "Discord guilds",
            openScope: "any channel not explicitly denied",
            groupPolicyPath: "channels.discord.groupPolicy",
            routeAllowlistPath: "channels.discord.guilds.<id>.channels"
          },
          missingRouteAllowlist: {
            surface: "Discord guilds",
            openBehavior: "with no guild/channel allowlist; any channel can trigger (mention-gated)",
            remediation: 'Set channels.discord.groupPolicy="allowlist" and configure channels.discord.guilds.<id>.channels'
          }
        })
      });
    }
  },
  groups: {
    resolveRequireMention: import_discord.resolveDiscordGroupRequireMention,
    resolveToolPolicy: import_discord.resolveDiscordGroupToolPolicy
  },
  mentions: {
    stripPatterns: () => ["<@!?\\d+>"]
  },
  threading: {
    resolveReplyToMode: ({ cfg }) => cfg.channels?.discord?.replyToMode ?? "off"
  },
  agentPrompt: {
    messageToolHints: () => [
      "- Discord components: set `components` when sending messages to include buttons, selects, or v2 containers.",
      "- Forms: add `components.modal` (title, fields). Must-b adds a trigger button and routes submissions as new messages."
    ]
  },
  messaging: {
    normalizeTarget: import_discord.normalizeDiscordMessagingTarget,
    targetResolver: {
      looksLikeId: import_discord.looksLikeDiscordTargetId,
      hint: "<channelId|user:ID|channel:ID>"
    }
  },
  directory: {
    self: async () => null,
    listPeers: async (params) => (0, import_discord.listDiscordDirectoryPeersFromConfig)(params),
    listGroups: async (params) => (0, import_discord.listDiscordDirectoryGroupsFromConfig)(params),
    listPeersLive: async (params) => getDiscordRuntime().channel.discord.listDirectoryPeersLive(params),
    listGroupsLive: async (params) => getDiscordRuntime().channel.discord.listDirectoryGroupsLive(params)
  },
  resolver: {
    resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
      const account = (0, import_discord.resolveDiscordAccount)({ cfg, accountId });
      const token = account.token?.trim();
      if (!token) {
        return inputs.map((input) => ({
          input,
          resolved: false,
          note: "missing Discord token"
        }));
      }
      if (kind === "group") {
        const resolved2 = await getDiscordRuntime().channel.discord.resolveChannelAllowlist({
          token,
          entries: inputs
        });
        return resolved2.map((entry) => ({
          input: entry.input,
          resolved: entry.resolved,
          id: entry.channelId ?? entry.guildId,
          name: entry.channelName ?? entry.guildName ?? (entry.guildId && !entry.channelId ? entry.guildId : void 0),
          note: entry.note
        }));
      }
      const resolved = await getDiscordRuntime().channel.discord.resolveUserAllowlist({
        token,
        entries: inputs
      });
      return resolved.map((entry) => ({
        input: entry.input,
        resolved: entry.resolved,
        id: entry.id,
        name: entry.name,
        note: entry.note
      }));
    }
  },
  actions: discordMessageActions,
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_discord.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_discord.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "discord",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      if (input.useEnv && accountId !== import_discord.DEFAULT_ACCOUNT_ID) {
        return "DISCORD_BOT_TOKEN can only be used for the default account.";
      }
      if (!input.useEnv && !input.token) {
        return "Discord requires token (or --use-env).";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_discord.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "discord",
        accountId,
        name: input.name
      });
      const next = accountId !== import_discord.DEFAULT_ACCOUNT_ID ? (0, import_discord.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "discord"
      }) : namedConfig;
      if (accountId === import_discord.DEFAULT_ACCOUNT_ID) {
        return {
          ...next,
          channels: {
            ...next.channels,
            discord: {
              ...next.channels?.discord,
              enabled: true,
              ...input.useEnv ? {} : input.token ? { token: input.token } : {}
            }
          }
        };
      }
      return {
        ...next,
        channels: {
          ...next.channels,
          discord: {
            ...next.channels?.discord,
            enabled: true,
            accounts: {
              ...next.channels?.discord?.accounts,
              [accountId]: {
                ...next.channels?.discord?.accounts?.[accountId],
                enabled: true,
                ...input.token ? { token: input.token } : {}
              }
            }
          }
        }
      };
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: null,
    textChunkLimit: 2e3,
    pollMaxOptions: 10,
    resolveTarget: ({ to }) => (0, import_discord.normalizeDiscordOutboundTarget)(to),
    sendText: async ({ cfg, to, text, accountId, deps, replyToId, silent }) => {
      const send = deps?.sendDiscord ?? getDiscordRuntime().channel.discord.sendMessageDiscord;
      const result = await send(to, text, {
        verbose: false,
        cfg,
        replyTo: replyToId ?? void 0,
        accountId: accountId ?? void 0,
        silent: silent ?? void 0
      });
      return { channel: "discord", ...result };
    },
    sendMedia: async ({
      cfg,
      to,
      text,
      mediaUrl,
      mediaLocalRoots,
      accountId,
      deps,
      replyToId,
      silent
    }) => {
      const send = deps?.sendDiscord ?? getDiscordRuntime().channel.discord.sendMessageDiscord;
      const result = await send(to, text, {
        verbose: false,
        cfg,
        mediaUrl,
        mediaLocalRoots,
        replyTo: replyToId ?? void 0,
        accountId: accountId ?? void 0,
        silent: silent ?? void 0
      });
      return { channel: "discord", ...result };
    },
    sendPoll: async ({ cfg, to, poll, accountId, silent }) => await getDiscordRuntime().channel.discord.sendPollDiscord(to, poll, {
      cfg,
      accountId: accountId ?? void 0,
      silent: silent ?? void 0
    })
  },
  status: {
    defaultRuntime: {
      accountId: import_discord.DEFAULT_ACCOUNT_ID,
      running: false,
      connected: false,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnect: null,
      lastEventAt: null,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    collectStatusIssues: import_discord.collectDiscordStatusIssues,
    buildChannelSummary: ({ snapshot }) => (0, import_discord.buildTokenChannelStatusSummary)(snapshot, { includeMode: false }),
    probeAccount: async ({ account, timeoutMs }) => getDiscordRuntime().channel.discord.probeDiscord(account.token, timeoutMs, {
      includeApplication: true
    }),
    auditAccount: async ({ account, timeoutMs, cfg }) => {
      const { channelIds, unresolvedChannels } = (0, import_discord.collectDiscordAuditChannelIds)({
        cfg,
        accountId: account.accountId
      });
      if (!channelIds.length && unresolvedChannels === 0) {
        return void 0;
      }
      const botToken = account.token?.trim();
      if (!botToken) {
        return {
          ok: unresolvedChannels === 0,
          checkedChannels: 0,
          unresolvedChannels,
          channels: [],
          elapsedMs: 0
        };
      }
      const audit = await getDiscordRuntime().channel.discord.auditChannelPermissions({
        token: botToken,
        accountId: account.accountId,
        channelIds,
        timeoutMs
      });
      return { ...audit, unresolvedChannels };
    },
    buildAccountSnapshot: ({ account, runtime, probe, audit }) => {
      const configured = (0, import_discord.resolveConfiguredFromCredentialStatuses)(account) ?? Boolean(account.token?.trim());
      const app = runtime?.application ?? probe?.application;
      const bot = runtime?.bot ?? probe?.bot;
      const base = (0, import_discord.buildComputedAccountStatusSnapshot)({
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured,
        runtime,
        probe
      });
      return {
        ...base,
        ...(0, import_discord.projectCredentialSnapshotFields)(account),
        connected: runtime?.connected ?? false,
        reconnectAttempts: runtime?.reconnectAttempts,
        lastConnectedAt: runtime?.lastConnectedAt ?? null,
        lastDisconnect: runtime?.lastDisconnect ?? null,
        lastEventAt: runtime?.lastEventAt ?? null,
        application: app ?? void 0,
        bot: bot ?? void 0,
        audit
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const token = account.token.trim();
      let discordBotLabel = "";
      try {
        const probe = await getDiscordRuntime().channel.discord.probeDiscord(token, 2500, {
          includeApplication: true
        });
        const username = probe.ok ? probe.bot?.username?.trim() : null;
        if (username) {
          discordBotLabel = ` (@${username})`;
        }
        ctx.setStatus({
          accountId: account.accountId,
          bot: probe.bot,
          application: probe.application
        });
        const messageContent = probe.application?.intents?.messageContent;
        if (messageContent === "disabled") {
          ctx.log?.warn(
            `[${account.accountId}] Discord Message Content Intent is disabled; bot may not respond to channel messages. Enable it in Discord Dev Portal (Bot \u2192 Privileged Gateway Intents) or require mentions.`
          );
        } else if (messageContent === "limited") {
          ctx.log?.info(
            `[${account.accountId}] Discord Message Content Intent is limited; bots under 100 servers can use it without verification.`
          );
        }
      } catch (err) {
        if (getDiscordRuntime().logging.shouldLogVerbose()) {
          ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
        }
      }
      ctx.log?.info(`[${account.accountId}] starting provider${discordBotLabel}`);
      return getDiscordRuntime().channel.discord.monitorDiscordProvider({
        token,
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        mediaMaxMb: account.config.mediaMaxMb,
        historyLimit: account.config.historyLimit,
        setStatus: (patch) => ctx.setStatus({ accountId: account.accountId, ...patch })
      });
    }
  }
};

// src/core/extensions/discord/src/subagent-hooks.ts
var import_discord2 = require("src/core/source/plugin-sdk/discord");
function summarizeError(err) {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return "error";
}
function registerDiscordSubagentHooks(api) {
  const resolveThreadBindingFlags = (accountId) => {
    const account = (0, import_discord2.resolveDiscordAccount)({
      cfg: api.config,
      accountId
    });
    const baseThreadBindings = api.config.channels?.discord?.threadBindings;
    const accountThreadBindings = api.config.channels?.discord?.accounts?.[account.accountId]?.threadBindings;
    return {
      enabled: accountThreadBindings?.enabled ?? baseThreadBindings?.enabled ?? api.config.session?.threadBindings?.enabled ?? true,
      spawnSubagentSessions: accountThreadBindings?.spawnSubagentSessions ?? baseThreadBindings?.spawnSubagentSessions ?? false
    };
  };
  api.on("subagent_spawning", async (event) => {
    if (!event.threadRequested) {
      return;
    }
    const channel = event.requester?.channel?.trim().toLowerCase();
    if (channel !== "discord") {
      return;
    }
    const threadBindingFlags = resolveThreadBindingFlags(event.requester?.accountId);
    if (!threadBindingFlags.enabled) {
      return {
        status: "error",
        error: "Discord thread bindings are disabled (set channels.discord.threadBindings.enabled=true to override for this account, or session.threadBindings.enabled=true globally)."
      };
    }
    if (!threadBindingFlags.spawnSubagentSessions) {
      return {
        status: "error",
        error: "Discord thread-bound subagent spawns are disabled for this account (set channels.discord.threadBindings.spawnSubagentSessions=true to enable)."
      };
    }
    try {
      const binding = await (0, import_discord2.autoBindSpawnedDiscordSubagent)({
        accountId: event.requester?.accountId,
        channel: event.requester?.channel,
        to: event.requester?.to,
        threadId: event.requester?.threadId,
        childSessionKey: event.childSessionKey,
        agentId: event.agentId,
        label: event.label,
        boundBy: "system"
      });
      if (!binding) {
        return {
          status: "error",
          error: "Unable to create or bind a Discord thread for this subagent session. Session mode is unavailable for this target."
        };
      }
      return { status: "ok", threadBindingReady: true };
    } catch (err) {
      return {
        status: "error",
        error: `Discord thread bind failed: ${summarizeError(err)}`
      };
    }
  });
  api.on("subagent_ended", (event) => {
    (0, import_discord2.unbindThreadBindingsBySessionKey)({
      targetSessionKey: event.targetSessionKey,
      accountId: event.accountId,
      targetKind: event.targetKind,
      reason: event.reason,
      sendFarewell: event.sendFarewell
    });
  });
  api.on("subagent_delivery_target", (event) => {
    if (!event.expectsCompletionMessage) {
      return;
    }
    const requesterChannel = event.requesterOrigin?.channel?.trim().toLowerCase();
    if (requesterChannel !== "discord") {
      return;
    }
    const requesterAccountId = event.requesterOrigin?.accountId?.trim();
    const requesterThreadId = event.requesterOrigin?.threadId != null && event.requesterOrigin.threadId !== "" ? String(event.requesterOrigin.threadId).trim() : "";
    const bindings = (0, import_discord2.listThreadBindingsBySessionKey)({
      targetSessionKey: event.childSessionKey,
      ...requesterAccountId ? { accountId: requesterAccountId } : {},
      targetKind: "subagent"
    });
    if (bindings.length === 0) {
      return;
    }
    let binding;
    if (requesterThreadId) {
      binding = bindings.find((entry) => {
        if (entry.threadId !== requesterThreadId) {
          return false;
        }
        if (requesterAccountId && entry.accountId !== requesterAccountId) {
          return false;
        }
        return true;
      });
    }
    if (!binding && bindings.length === 1) {
      binding = bindings[0];
    }
    if (!binding) {
      return;
    }
    return {
      origin: {
        channel: "discord",
        accountId: binding.accountId,
        to: `channel:${binding.threadId}`,
        threadId: binding.threadId
      }
    };
  });
}

// src/core/extensions/discord/index.ts
var plugin = {
  id: "discord",
  name: "Discord",
  description: "Discord channel plugin",
  configSchema: (0, import_discord3.emptyPluginConfigSchema)(),
  register(api) {
    setDiscordRuntime(api.runtime);
    api.registerChannel({ plugin: discordPlugin });
    registerDiscordSubagentHooks(api);
  }
};
var index_default = plugin;
