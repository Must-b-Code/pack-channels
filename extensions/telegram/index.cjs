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

// src/core/extensions/telegram/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_telegram2 = require("src/core/source/plugin-sdk/telegram");

// src/core/extensions/telegram/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_telegram = require("src/core/source/plugin-sdk/telegram");

// src/core/extensions/telegram/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setTelegramRuntime, getRuntime: getTelegramRuntime } = (0, import_compat.createPluginRuntimeStore)("Telegram runtime not initialized");

// src/core/extensions/telegram/src/channel.ts
var meta = (0, import_telegram.getChatChannelMeta)("telegram");
function findTelegramTokenOwnerAccountId(params) {
  const normalizedAccountId = (0, import_telegram.normalizeAccountId)(params.accountId);
  const tokenOwners = /* @__PURE__ */ new Map();
  for (const id of (0, import_telegram.listTelegramAccountIds)(params.cfg)) {
    const account = (0, import_telegram.inspectTelegramAccount)({ cfg: params.cfg, accountId: id });
    const token = (account.token ?? "").trim();
    if (!token) {
      continue;
    }
    const ownerAccountId = tokenOwners.get(token);
    if (!ownerAccountId) {
      tokenOwners.set(token, account.accountId);
      continue;
    }
    if (account.accountId === normalizedAccountId) {
      return ownerAccountId;
    }
  }
  return null;
}
function formatDuplicateTelegramTokenReason(params) {
  return `Duplicate Telegram bot token: account "${params.accountId}" shares a token with account "${params.ownerAccountId}". Keep one owner account per bot token.`;
}
var telegramMessageActions = {
  listActions: (ctx) => getTelegramRuntime().channel.telegram.messageActions?.listActions?.(ctx) ?? [],
  extractToolSend: (ctx) => getTelegramRuntime().channel.telegram.messageActions?.extractToolSend?.(ctx) ?? null,
  handleAction: async (ctx) => {
    const ma = getTelegramRuntime().channel.telegram.messageActions;
    if (!ma?.handleAction) {
      throw new Error("Telegram message actions not available");
    }
    return ma.handleAction(ctx);
  }
};
var telegramConfigAccessors = (0, import_compat3.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => (0, import_telegram.resolveTelegramAccount)({ cfg, accountId }),
  resolveAllowFrom: (account) => account.config.allowFrom,
  formatAllowFrom: (allowFrom) => (0, import_compat3.formatAllowFromLowercase)({ allowFrom, stripPrefixRe: /^(telegram|tg):/i }),
  resolveDefaultTo: (account) => account.config.defaultTo
});
var telegramConfigBase = (0, import_compat2.createScopedChannelConfigBase)({
  sectionKey: "telegram",
  listAccountIds: import_telegram.listTelegramAccountIds,
  resolveAccount: (cfg, accountId) => (0, import_telegram.resolveTelegramAccount)({ cfg, accountId }),
  inspectAccount: (cfg, accountId) => (0, import_telegram.inspectTelegramAccount)({ cfg, accountId }),
  defaultAccountId: import_telegram.resolveDefaultTelegramAccountId,
  clearBaseFields: ["botToken", "tokenFile", "name"]
});
var resolveTelegramDmPolicy = (0, import_compat3.createScopedDmSecurityResolver)({
  channelKey: "telegram",
  resolvePolicy: (account) => account.config.dmPolicy,
  resolveAllowFrom: (account) => account.config.allowFrom,
  policyPathSuffix: "dmPolicy",
  normalizeEntry: (raw) => raw.replace(/^(telegram|tg):/i, "")
});
var telegramPlugin = {
  id: "telegram",
  meta: {
    ...meta,
    quickstartAllowFrom: true
  },
  onboarding: import_telegram.telegramOnboardingAdapter,
  pairing: {
    idLabel: "telegramUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(telegram|tg):/i, ""),
    notifyApproval: async ({ cfg, id }) => {
      const { token } = getTelegramRuntime().channel.telegram.resolveTelegramToken(cfg);
      if (!token) {
        throw new Error("telegram token not configured");
      }
      await getTelegramRuntime().channel.telegram.sendMessageTelegram(
        id,
        import_telegram.PAIRING_APPROVED_MESSAGE,
        {
          token
        }
      );
    }
  },
  capabilities: {
    chatTypes: ["direct", "group", "channel", "thread"],
    reactions: true,
    threads: true,
    media: true,
    polls: true,
    nativeCommands: true,
    blockStreaming: true
  },
  reload: { configPrefixes: ["channels.telegram"] },
  configSchema: (0, import_telegram.buildChannelConfigSchema)(import_telegram.TelegramConfigSchema),
  config: {
    ...telegramConfigBase,
    isConfigured: (account, cfg) => {
      if (!account.token?.trim()) {
        return false;
      }
      return !findTelegramTokenOwnerAccountId({ cfg, accountId: account.accountId });
    },
    unconfiguredReason: (account, cfg) => {
      if (!account.token?.trim()) {
        return "not configured";
      }
      const ownerAccountId = findTelegramTokenOwnerAccountId({ cfg, accountId: account.accountId });
      if (!ownerAccountId) {
        return "not configured";
      }
      return formatDuplicateTelegramTokenReason({
        accountId: account.accountId,
        ownerAccountId
      });
    },
    describeAccount: (account, cfg) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.token?.trim()) && !findTelegramTokenOwnerAccountId({ cfg, accountId: account.accountId }),
      tokenSource: account.tokenSource
    }),
    ...telegramConfigAccessors
  },
  security: {
    resolveDmPolicy: resolveTelegramDmPolicy,
    collectWarnings: ({ account, cfg }) => {
      const groupAllowlistConfigured = account.config.groups && Object.keys(account.config.groups).length > 0;
      return (0, import_compat3.collectAllowlistProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.telegram !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        collect: (groupPolicy) => (0, import_compat3.collectOpenGroupPolicyRouteAllowlistWarnings)({
          groupPolicy,
          routeAllowlistConfigured: Boolean(groupAllowlistConfigured),
          restrictSenders: {
            surface: "Telegram groups",
            openScope: "any member in allowed groups",
            groupPolicyPath: "channels.telegram.groupPolicy",
            groupAllowFromPath: "channels.telegram.groupAllowFrom"
          },
          noRouteAllowlist: {
            surface: "Telegram groups",
            routeAllowlistPath: "channels.telegram.groups",
            routeScope: "group",
            groupPolicyPath: "channels.telegram.groupPolicy",
            groupAllowFromPath: "channels.telegram.groupAllowFrom"
          }
        })
      });
    }
  },
  groups: {
    resolveRequireMention: import_telegram.resolveTelegramGroupRequireMention,
    resolveToolPolicy: import_telegram.resolveTelegramGroupToolPolicy
  },
  threading: {
    resolveReplyToMode: ({ cfg }) => cfg.channels?.telegram?.replyToMode ?? "off"
  },
  messaging: {
    normalizeTarget: import_telegram.normalizeTelegramMessagingTarget,
    targetResolver: {
      looksLikeId: import_telegram.looksLikeTelegramTargetId,
      hint: "<chatId>"
    }
  },
  directory: {
    self: async () => null,
    listPeers: async (params) => (0, import_telegram.listTelegramDirectoryPeersFromConfig)(params),
    listGroups: async (params) => (0, import_telegram.listTelegramDirectoryGroupsFromConfig)(params)
  },
  actions: telegramMessageActions,
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_telegram.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_telegram.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "telegram",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      if (input.useEnv && accountId !== import_telegram.DEFAULT_ACCOUNT_ID) {
        return "TELEGRAM_BOT_TOKEN can only be used for the default account.";
      }
      if (!input.useEnv && !input.token && !input.tokenFile) {
        return "Telegram requires token or --token-file (or --use-env).";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_telegram.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "telegram",
        accountId,
        name: input.name
      });
      const next = accountId !== import_telegram.DEFAULT_ACCOUNT_ID ? (0, import_telegram.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "telegram"
      }) : namedConfig;
      if (accountId === import_telegram.DEFAULT_ACCOUNT_ID) {
        return {
          ...next,
          channels: {
            ...next.channels,
            telegram: {
              ...next.channels?.telegram,
              enabled: true,
              ...input.useEnv ? {} : input.tokenFile ? { tokenFile: input.tokenFile } : input.token ? { botToken: input.token } : {}
            }
          }
        };
      }
      return {
        ...next,
        channels: {
          ...next.channels,
          telegram: {
            ...next.channels?.telegram,
            enabled: true,
            accounts: {
              ...next.channels?.telegram?.accounts,
              [accountId]: {
                ...next.channels?.telegram?.accounts?.[accountId],
                enabled: true,
                ...input.tokenFile ? { tokenFile: input.tokenFile } : input.token ? { botToken: input.token } : {}
              }
            }
          }
        }
      };
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getTelegramRuntime().channel.text.chunkMarkdownText(text, limit),
    chunkerMode: "markdown",
    textChunkLimit: 4e3,
    pollMaxOptions: 10,
    sendPayload: async ({
      cfg,
      to,
      payload,
      mediaLocalRoots,
      accountId,
      deps,
      replyToId,
      threadId,
      silent
    }) => {
      const send = deps?.sendTelegram ?? getTelegramRuntime().channel.telegram.sendMessageTelegram;
      const replyToMessageId = (0, import_telegram.parseTelegramReplyToMessageId)(replyToId);
      const messageThreadId = (0, import_telegram.parseTelegramThreadId)(threadId);
      const result = await (0, import_telegram.sendTelegramPayloadMessages)({
        send,
        to,
        payload,
        baseOpts: {
          verbose: false,
          cfg,
          mediaLocalRoots,
          messageThreadId,
          replyToMessageId,
          accountId: accountId ?? void 0,
          silent: silent ?? void 0
        }
      });
      return { channel: "telegram", ...result };
    },
    sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, silent }) => {
      const send = deps?.sendTelegram ?? getTelegramRuntime().channel.telegram.sendMessageTelegram;
      const replyToMessageId = (0, import_telegram.parseTelegramReplyToMessageId)(replyToId);
      const messageThreadId = (0, import_telegram.parseTelegramThreadId)(threadId);
      const result = await send(to, text, {
        verbose: false,
        cfg,
        messageThreadId,
        replyToMessageId,
        accountId: accountId ?? void 0,
        silent: silent ?? void 0
      });
      return { channel: "telegram", ...result };
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
      threadId,
      silent
    }) => {
      const send = deps?.sendTelegram ?? getTelegramRuntime().channel.telegram.sendMessageTelegram;
      const replyToMessageId = (0, import_telegram.parseTelegramReplyToMessageId)(replyToId);
      const messageThreadId = (0, import_telegram.parseTelegramThreadId)(threadId);
      const result = await send(to, text, {
        verbose: false,
        cfg,
        mediaUrl,
        mediaLocalRoots,
        messageThreadId,
        replyToMessageId,
        accountId: accountId ?? void 0,
        silent: silent ?? void 0
      });
      return { channel: "telegram", ...result };
    },
    sendPoll: async ({ cfg, to, poll, accountId, threadId, silent, isAnonymous }) => await getTelegramRuntime().channel.telegram.sendPollTelegram(to, poll, {
      cfg,
      accountId: accountId ?? void 0,
      messageThreadId: (0, import_telegram.parseTelegramThreadId)(threadId),
      silent: silent ?? void 0,
      isAnonymous: isAnonymous ?? void 0
    })
  },
  status: {
    defaultRuntime: {
      accountId: import_telegram.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    collectStatusIssues: import_telegram.collectTelegramStatusIssues,
    buildChannelSummary: ({ snapshot }) => (0, import_telegram.buildTokenChannelStatusSummary)(snapshot),
    probeAccount: async ({ account, timeoutMs }) => getTelegramRuntime().channel.telegram.probeTelegram(account.token, timeoutMs, {
      accountId: account.accountId,
      proxyUrl: account.config.proxy,
      network: account.config.network
    }),
    auditAccount: async ({ account, timeoutMs, probe, cfg }) => {
      const groups = cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups;
      const { groupIds, unresolvedGroups, hasWildcardUnmentionedGroups } = getTelegramRuntime().channel.telegram.collectUnmentionedGroupIds(groups);
      if (!groupIds.length && unresolvedGroups === 0 && !hasWildcardUnmentionedGroups) {
        return void 0;
      }
      const botId = probe?.ok && probe.bot?.id != null ? probe.bot.id : null;
      if (!botId) {
        return {
          ok: unresolvedGroups === 0 && !hasWildcardUnmentionedGroups,
          checkedGroups: 0,
          unresolvedGroups,
          hasWildcardUnmentionedGroups,
          groups: [],
          elapsedMs: 0
        };
      }
      const audit = await getTelegramRuntime().channel.telegram.auditGroupMembership({
        token: account.token,
        botId,
        groupIds,
        proxyUrl: account.config.proxy,
        network: account.config.network,
        timeoutMs
      });
      return { ...audit, unresolvedGroups, hasWildcardUnmentionedGroups };
    },
    buildAccountSnapshot: ({ account, cfg, runtime, probe, audit }) => {
      const configuredFromStatus = (0, import_telegram.resolveConfiguredFromCredentialStatuses)(account);
      const ownerAccountId = findTelegramTokenOwnerAccountId({
        cfg,
        accountId: account.accountId
      });
      const duplicateTokenReason = ownerAccountId ? formatDuplicateTelegramTokenReason({
        accountId: account.accountId,
        ownerAccountId
      }) : null;
      const configured = (configuredFromStatus ?? Boolean(account.token?.trim())) && !ownerAccountId;
      const groups = cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups;
      const allowUnmentionedGroups = groups?.["*"]?.requireMention === false || Object.entries(groups ?? {}).some(
        ([key, value]) => key !== "*" && value?.requireMention === false
      );
      return {
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured,
        ...(0, import_telegram.projectCredentialSnapshotFields)(account),
        running: runtime?.running ?? false,
        lastStartAt: runtime?.lastStartAt ?? null,
        lastStopAt: runtime?.lastStopAt ?? null,
        lastError: runtime?.lastError ?? duplicateTokenReason,
        mode: runtime?.mode ?? (account.config.webhookUrl ? "webhook" : "polling"),
        probe,
        audit,
        allowUnmentionedGroups,
        lastInboundAt: runtime?.lastInboundAt ?? null,
        lastOutboundAt: runtime?.lastOutboundAt ?? null
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const ownerAccountId = findTelegramTokenOwnerAccountId({
        cfg: ctx.cfg,
        accountId: account.accountId
      });
      if (ownerAccountId) {
        const reason = formatDuplicateTelegramTokenReason({
          accountId: account.accountId,
          ownerAccountId
        });
        ctx.log?.error?.(`[${account.accountId}] ${reason}`);
        throw new Error(reason);
      }
      const token = (account.token ?? "").trim();
      let telegramBotLabel = "";
      try {
        const probe = await getTelegramRuntime().channel.telegram.probeTelegram(token, 2500, {
          accountId: account.accountId,
          proxyUrl: account.config.proxy,
          network: account.config.network
        });
        const username = probe.ok ? probe.bot?.username?.trim() : null;
        if (username) {
          telegramBotLabel = ` (@${username})`;
        }
      } catch (err) {
        if (getTelegramRuntime().logging.shouldLogVerbose()) {
          ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
        }
      }
      ctx.log?.info(`[${account.accountId}] starting provider${telegramBotLabel}`);
      return getTelegramRuntime().channel.telegram.monitorTelegramProvider({
        token,
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        useWebhook: Boolean(account.config.webhookUrl),
        webhookUrl: account.config.webhookUrl,
        webhookSecret: account.config.webhookSecret,
        webhookPath: account.config.webhookPath,
        webhookHost: account.config.webhookHost,
        webhookPort: account.config.webhookPort,
        webhookCertPath: account.config.webhookCertPath
      });
    },
    logoutAccount: async ({ accountId, cfg }) => {
      const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
      const nextCfg = { ...cfg };
      const nextTelegram = cfg.channels?.telegram ? { ...cfg.channels.telegram } : void 0;
      let cleared = false;
      let changed = false;
      if (nextTelegram) {
        if (accountId === import_telegram.DEFAULT_ACCOUNT_ID && nextTelegram.botToken) {
          delete nextTelegram.botToken;
          cleared = true;
          changed = true;
        }
        const accountCleanup = (0, import_telegram.clearAccountEntryFields)({
          accounts: nextTelegram.accounts,
          accountId,
          fields: ["botToken"]
        });
        if (accountCleanup.changed) {
          changed = true;
          if (accountCleanup.cleared) {
            cleared = true;
          }
          if (accountCleanup.nextAccounts) {
            nextTelegram.accounts = accountCleanup.nextAccounts;
          } else {
            delete nextTelegram.accounts;
          }
        }
      }
      if (changed) {
        if (nextTelegram && Object.keys(nextTelegram).length > 0) {
          nextCfg.channels = { ...nextCfg.channels, telegram: nextTelegram };
        } else {
          const nextChannels = { ...nextCfg.channels };
          delete nextChannels.telegram;
          if (Object.keys(nextChannels).length > 0) {
            nextCfg.channels = nextChannels;
          } else {
            delete nextCfg.channels;
          }
        }
      }
      const resolved = (0, import_telegram.resolveTelegramAccount)({
        cfg: changed ? nextCfg : cfg,
        accountId
      });
      const loggedOut = resolved.tokenSource === "none";
      if (changed) {
        await getTelegramRuntime().config.writeConfigFile(nextCfg);
      }
      return { cleared, envToken: Boolean(envToken), loggedOut };
    }
  }
};

// src/core/extensions/telegram/index.ts
var plugin = {
  id: "telegram",
  name: "Telegram",
  description: "Telegram channel plugin",
  configSchema: (0, import_telegram2.emptyPluginConfigSchema)(),
  register(api) {
    setTelegramRuntime(api.runtime);
    api.registerChannel({ plugin: telegramPlugin });
  }
};
var index_default = plugin;
