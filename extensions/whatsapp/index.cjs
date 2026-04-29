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

// src/core/extensions/whatsapp/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_whatsapp2 = require("src/core/source/plugin-sdk/whatsapp");

// src/core/extensions/whatsapp/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_whatsapp = require("src/core/source/plugin-sdk/whatsapp");

// src/core/extensions/whatsapp/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } = (0, import_compat.createPluginRuntimeStore)("WhatsApp runtime not initialized");

// src/core/extensions/whatsapp/src/channel.ts
var meta = (0, import_whatsapp.getChatChannelMeta)("whatsapp");
var whatsappPlugin = {
  id: "whatsapp",
  meta: {
    ...meta,
    showConfigured: false,
    quickstartAllowFrom: true,
    forceAccountBinding: true,
    preferSessionLookupForAnnounceTarget: true
  },
  onboarding: import_whatsapp.whatsappOnboardingAdapter,
  agentTools: () => [getWhatsAppRuntime().channel.whatsapp.createLoginTool()],
  pairing: {
    idLabel: "whatsappSenderId"
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    polls: true,
    reactions: true,
    media: true
  },
  reload: { configPrefixes: ["web"], noopPrefixes: ["channels.whatsapp"] },
  gatewayMethods: ["web.login.start", "web.login.wait"],
  configSchema: (0, import_whatsapp.buildChannelConfigSchema)(import_whatsapp.WhatsAppConfigSchema),
  config: {
    listAccountIds: (cfg) => (0, import_whatsapp.listWhatsAppAccountIds)(cfg),
    resolveAccount: (cfg, accountId) => (0, import_whatsapp.resolveWhatsAppAccount)({ cfg, accountId }),
    defaultAccountId: (cfg) => (0, import_whatsapp.resolveDefaultWhatsAppAccountId)(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const accountKey = accountId || import_whatsapp.DEFAULT_ACCOUNT_ID;
      const accounts = { ...cfg.channels?.whatsapp?.accounts };
      const existing = accounts[accountKey] ?? {};
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          whatsapp: {
            ...cfg.channels?.whatsapp,
            accounts: {
              ...accounts,
              [accountKey]: {
                ...existing,
                enabled
              }
            }
          }
        }
      };
    },
    deleteAccount: ({ cfg, accountId }) => {
      const accountKey = accountId || import_whatsapp.DEFAULT_ACCOUNT_ID;
      const accounts = { ...cfg.channels?.whatsapp?.accounts };
      delete accounts[accountKey];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          whatsapp: {
            ...cfg.channels?.whatsapp,
            accounts: Object.keys(accounts).length ? accounts : void 0
          }
        }
      };
    },
    isEnabled: (account, cfg) => account.enabled && cfg.web?.enabled !== false,
    disabledReason: () => "disabled",
    isConfigured: async (account) => await getWhatsAppRuntime().channel.whatsapp.webAuthExists(account.authDir),
    unconfiguredReason: () => "not linked",
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.authDir),
      linked: Boolean(account.authDir),
      dmPolicy: account.dmPolicy,
      allowFrom: account.allowFrom
    }),
    resolveAllowFrom: ({ cfg, accountId }) => (0, import_whatsapp.resolveWhatsAppConfigAllowFrom)({ cfg, accountId }),
    formatAllowFrom: ({ allowFrom }) => (0, import_whatsapp.formatWhatsAppConfigAllowFromEntries)(allowFrom),
    resolveDefaultTo: ({ cfg, accountId }) => (0, import_whatsapp.resolveWhatsAppConfigDefaultTo)({ cfg, accountId })
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat2.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "whatsapp",
        accountId,
        fallbackAccountId: account.accountId ?? import_whatsapp.DEFAULT_ACCOUNT_ID,
        policy: account.dmPolicy,
        allowFrom: account.allowFrom ?? [],
        policyPathSuffix: "dmPolicy",
        normalizeEntry: (raw) => (0, import_whatsapp.normalizeE164)(raw)
      });
    },
    collectWarnings: ({ account, cfg }) => {
      const groupAllowlistConfigured = Boolean(account.groups) && Object.keys(account.groups ?? {}).length > 0;
      return (0, import_compat2.collectAllowlistProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.whatsapp !== void 0,
        configuredGroupPolicy: account.groupPolicy,
        collect: (groupPolicy) => (0, import_compat2.collectOpenGroupPolicyRouteAllowlistWarnings)({
          groupPolicy,
          routeAllowlistConfigured: groupAllowlistConfigured,
          restrictSenders: {
            surface: "WhatsApp groups",
            openScope: "any member in allowed groups",
            groupPolicyPath: "channels.whatsapp.groupPolicy",
            groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
          },
          noRouteAllowlist: {
            surface: "WhatsApp groups",
            routeAllowlistPath: "channels.whatsapp.groups",
            routeScope: "group",
            groupPolicyPath: "channels.whatsapp.groupPolicy",
            groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
          }
        })
      });
    }
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_whatsapp.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_whatsapp.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "whatsapp",
      accountId,
      name,
      alwaysUseAccounts: true
    }),
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_whatsapp.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "whatsapp",
        accountId,
        name: input.name,
        alwaysUseAccounts: true
      });
      const next = (0, import_whatsapp.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "whatsapp",
        alwaysUseAccounts: true
      });
      const entry = {
        ...next.channels?.whatsapp?.accounts?.[accountId],
        ...input.authDir ? { authDir: input.authDir } : {},
        enabled: true
      };
      return {
        ...next,
        channels: {
          ...next.channels,
          whatsapp: {
            ...next.channels?.whatsapp,
            accounts: {
              ...next.channels?.whatsapp?.accounts,
              [accountId]: entry
            }
          }
        }
      };
    }
  },
  groups: {
    resolveRequireMention: import_whatsapp.resolveWhatsAppGroupRequireMention,
    resolveToolPolicy: import_whatsapp.resolveWhatsAppGroupToolPolicy,
    resolveGroupIntroHint: import_whatsapp.resolveWhatsAppGroupIntroHint
  },
  mentions: {
    stripPatterns: ({ ctx }) => (0, import_whatsapp.resolveWhatsAppMentionStripPatterns)(ctx)
  },
  commands: {
    enforceOwnerForCommands: true,
    skipWhenConfigEmpty: true
  },
  messaging: {
    normalizeTarget: import_whatsapp.normalizeWhatsAppMessagingTarget,
    targetResolver: {
      looksLikeId: import_whatsapp.looksLikeWhatsAppTargetId,
      hint: "<E.164|group JID>"
    }
  },
  directory: {
    self: async ({ cfg, accountId }) => {
      const account = (0, import_whatsapp.resolveWhatsAppAccount)({ cfg, accountId });
      const { e164, jid } = getWhatsAppRuntime().channel.whatsapp.readWebSelfId(account.authDir);
      const id = e164 ?? jid;
      if (!id) {
        return null;
      }
      return {
        kind: "user",
        id,
        name: account.name,
        raw: { e164, jid }
      };
    },
    listPeers: async (params) => (0, import_whatsapp.listWhatsAppDirectoryPeersFromConfig)(params),
    listGroups: async (params) => (0, import_whatsapp.listWhatsAppDirectoryGroupsFromConfig)(params)
  },
  actions: {
    listActions: ({ cfg }) => {
      if (!cfg.channels?.whatsapp) {
        return [];
      }
      const gate = (0, import_whatsapp.createActionGate)(cfg.channels.whatsapp.actions);
      const actions = /* @__PURE__ */ new Set();
      if (gate("reactions")) {
        actions.add("react");
      }
      if (gate("polls")) {
        actions.add("poll");
      }
      return Array.from(actions);
    },
    supportsAction: ({ action }) => action === "react",
    handleAction: async ({ action, params, cfg, accountId }) => {
      if (action !== "react") {
        throw new Error(`Action ${action} is not supported for provider ${meta.id}.`);
      }
      const messageId = (0, import_whatsapp.readStringParam)(params, "messageId", {
        required: true
      });
      const emoji = (0, import_whatsapp.readStringParam)(params, "emoji", { allowEmpty: true });
      const remove = typeof params.remove === "boolean" ? params.remove : void 0;
      return await getWhatsAppRuntime().channel.whatsapp.handleWhatsAppAction(
        {
          action: "react",
          chatJid: (0, import_whatsapp.readStringParam)(params, "chatJid") ?? (0, import_whatsapp.readStringParam)(params, "to", { required: true }),
          messageId,
          emoji,
          remove,
          participant: (0, import_whatsapp.readStringParam)(params, "participant"),
          accountId: accountId ?? void 0,
          fromMe: typeof params.fromMe === "boolean" ? params.fromMe : void 0
        },
        cfg
      );
    }
  },
  outbound: {
    deliveryMode: "gateway",
    chunker: (text, limit) => getWhatsAppRuntime().channel.text.chunkText(text, limit),
    chunkerMode: "text",
    textChunkLimit: 4e3,
    pollMaxOptions: 12,
    resolveTarget: ({ to, allowFrom, mode }) => (0, import_whatsapp.resolveWhatsAppOutboundTarget)({ to, allowFrom, mode }),
    sendText: async ({ cfg, to, text, accountId, deps, gifPlayback }) => {
      const send = deps?.sendWhatsApp ?? getWhatsAppRuntime().channel.whatsapp.sendMessageWhatsApp;
      const result = await send(to, text, {
        verbose: false,
        cfg,
        accountId: accountId ?? void 0,
        gifPlayback
      });
      return { channel: "whatsapp", ...result };
    },
    sendMedia: async ({
      cfg,
      to,
      text,
      mediaUrl,
      mediaLocalRoots,
      accountId,
      deps,
      gifPlayback
    }) => {
      const send = deps?.sendWhatsApp ?? getWhatsAppRuntime().channel.whatsapp.sendMessageWhatsApp;
      const result = await send(to, text, {
        verbose: false,
        cfg,
        mediaUrl,
        mediaLocalRoots,
        accountId: accountId ?? void 0,
        gifPlayback
      });
      return { channel: "whatsapp", ...result };
    },
    sendPoll: async ({ cfg, to, poll, accountId }) => await getWhatsAppRuntime().channel.whatsapp.sendPollWhatsApp(to, poll, {
      verbose: getWhatsAppRuntime().logging.shouldLogVerbose(),
      accountId: accountId ?? void 0,
      cfg
    })
  },
  auth: {
    login: async ({ cfg, accountId, runtime, verbose }) => {
      const resolvedAccountId = accountId?.trim() || (0, import_whatsapp.resolveDefaultWhatsAppAccountId)(cfg);
      await getWhatsAppRuntime().channel.whatsapp.loginWeb(
        Boolean(verbose),
        void 0,
        runtime,
        resolvedAccountId
      );
    }
  },
  heartbeat: {
    checkReady: async ({ cfg, accountId, deps }) => {
      if (cfg.web?.enabled === false) {
        return { ok: false, reason: "whatsapp-disabled" };
      }
      const account = (0, import_whatsapp.resolveWhatsAppAccount)({ cfg, accountId });
      const authExists = await (deps?.webAuthExists ?? getWhatsAppRuntime().channel.whatsapp.webAuthExists)(account.authDir);
      if (!authExists) {
        return { ok: false, reason: "whatsapp-not-linked" };
      }
      const listenerActive = deps?.hasActiveWebListener ? deps.hasActiveWebListener() : Boolean(getWhatsAppRuntime().channel.whatsapp.getActiveWebListener());
      if (!listenerActive) {
        return { ok: false, reason: "whatsapp-not-running" };
      }
      return { ok: true, reason: "ok" };
    },
    resolveRecipients: ({ cfg, opts }) => (0, import_whatsapp.resolveWhatsAppHeartbeatRecipients)(cfg, opts)
  },
  status: {
    defaultRuntime: {
      accountId: import_whatsapp.DEFAULT_ACCOUNT_ID,
      running: false,
      connected: false,
      reconnectAttempts: 0,
      lastConnectedAt: null,
      lastDisconnect: null,
      lastMessageAt: null,
      lastEventAt: null,
      lastError: null
    },
    collectStatusIssues: import_whatsapp.collectWhatsAppStatusIssues,
    buildChannelSummary: async ({ account, snapshot }) => {
      const authDir = account.authDir;
      const linked = typeof snapshot.linked === "boolean" ? snapshot.linked : authDir ? await getWhatsAppRuntime().channel.whatsapp.webAuthExists(authDir) : false;
      const authAgeMs = linked && authDir ? getWhatsAppRuntime().channel.whatsapp.getWebAuthAgeMs(authDir) : null;
      const self = linked && authDir ? getWhatsAppRuntime().channel.whatsapp.readWebSelfId(authDir) : { e164: null, jid: null };
      return {
        configured: linked,
        linked,
        authAgeMs,
        self,
        running: snapshot.running ?? false,
        connected: snapshot.connected ?? false,
        lastConnectedAt: snapshot.lastConnectedAt ?? null,
        lastDisconnect: snapshot.lastDisconnect ?? null,
        reconnectAttempts: snapshot.reconnectAttempts,
        lastMessageAt: snapshot.lastMessageAt ?? null,
        lastEventAt: snapshot.lastEventAt ?? null,
        lastError: snapshot.lastError ?? null
      };
    },
    buildAccountSnapshot: async ({ account, runtime }) => {
      const linked = await getWhatsAppRuntime().channel.whatsapp.webAuthExists(account.authDir);
      return {
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured: true,
        linked,
        running: runtime?.running ?? false,
        connected: runtime?.connected ?? false,
        reconnectAttempts: runtime?.reconnectAttempts,
        lastConnectedAt: runtime?.lastConnectedAt ?? null,
        lastDisconnect: runtime?.lastDisconnect ?? null,
        lastMessageAt: runtime?.lastMessageAt ?? null,
        lastEventAt: runtime?.lastEventAt ?? null,
        lastError: runtime?.lastError ?? null,
        dmPolicy: account.dmPolicy,
        allowFrom: account.allowFrom
      };
    },
    resolveAccountState: ({ configured }) => configured ? "linked" : "not linked",
    logSelfId: ({ account, runtime, includeChannelPrefix }) => {
      getWhatsAppRuntime().channel.whatsapp.logWebSelfId(
        account.authDir,
        runtime,
        includeChannelPrefix
      );
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const { e164, jid } = getWhatsAppRuntime().channel.whatsapp.readWebSelfId(account.authDir);
      const identity = e164 ? e164 : jid ? `jid ${jid}` : "unknown";
      ctx.log?.info(`[${account.accountId}] starting provider (${identity})`);
      return getWhatsAppRuntime().channel.whatsapp.monitorWebChannel(
        getWhatsAppRuntime().logging.shouldLogVerbose(),
        void 0,
        true,
        void 0,
        ctx.runtime,
        ctx.abortSignal,
        {
          statusSink: (next) => ctx.setStatus({ accountId: ctx.accountId, ...next }),
          accountId: account.accountId
        }
      );
    },
    loginWithQrStart: async ({ accountId, force, timeoutMs, verbose }) => await getWhatsAppRuntime().channel.whatsapp.startWebLoginWithQr({
      accountId,
      force,
      timeoutMs,
      verbose
    }),
    loginWithQrWait: async ({ accountId, timeoutMs }) => await getWhatsAppRuntime().channel.whatsapp.waitForWebLogin({ accountId, timeoutMs }),
    logoutAccount: async ({ account, runtime }) => {
      const cleared = await getWhatsAppRuntime().channel.whatsapp.logoutWeb({
        authDir: account.authDir,
        isLegacyAuthDir: account.isLegacyAuthDir,
        runtime
      });
      return { cleared, loggedOut: cleared };
    }
  }
};

// src/core/extensions/whatsapp/index.ts
var plugin = {
  id: "whatsapp",
  name: "WhatsApp",
  description: "WhatsApp channel plugin",
  configSchema: (0, import_whatsapp2.emptyPluginConfigSchema)(),
  register(api) {
    setWhatsAppRuntime(api.runtime);
    api.registerChannel({ plugin: whatsappPlugin });
  }
};
var index_default = plugin;
