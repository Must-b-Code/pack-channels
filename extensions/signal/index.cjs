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

// src/core/extensions/signal/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_signal2 = require("src/core/source/plugin-sdk/signal");

// src/core/extensions/signal/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_signal = require("src/core/source/plugin-sdk/signal");

// src/core/extensions/signal/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setSignalRuntime, getRuntime: getSignalRuntime } = (0, import_compat.createPluginRuntimeStore)("Signal runtime not initialized");

// src/core/extensions/signal/src/channel.ts
var signalMessageActions = {
  listActions: (ctx) => getSignalRuntime().channel.signal.messageActions?.listActions?.(ctx) ?? [],
  supportsAction: (ctx) => getSignalRuntime().channel.signal.messageActions?.supportsAction?.(ctx) ?? false,
  handleAction: async (ctx) => {
    const ma = getSignalRuntime().channel.signal.messageActions;
    if (!ma?.handleAction) {
      throw new Error("Signal message actions not available");
    }
    return ma.handleAction(ctx);
  }
};
var meta = (0, import_signal.getChatChannelMeta)("signal");
var signalConfigAccessors = (0, import_compat2.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => (0, import_signal.resolveSignalAccount)({ cfg, accountId }),
  resolveAllowFrom: (account) => account.config.allowFrom,
  formatAllowFrom: (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry === "*" ? "*" : (0, import_signal.normalizeE164)(entry.replace(/^signal:/i, ""))).filter(Boolean),
  resolveDefaultTo: (account) => account.config.defaultTo
});
function buildSignalSetupPatch(input) {
  return {
    ...input.signalNumber ? { account: input.signalNumber } : {},
    ...input.cliPath ? { cliPath: input.cliPath } : {},
    ...input.httpUrl ? { httpUrl: input.httpUrl } : {},
    ...input.httpHost ? { httpHost: input.httpHost } : {},
    ...input.httpPort ? { httpPort: Number(input.httpPort) } : {}
  };
}
async function sendSignalOutbound(params) {
  const send = params.deps?.sendSignal ?? getSignalRuntime().channel.signal.sendMessageSignal;
  const maxBytes = (0, import_signal.resolveChannelMediaMaxBytes)({
    cfg: params.cfg,
    resolveChannelLimitMb: ({ cfg, accountId }) => cfg.channels?.signal?.accounts?.[accountId]?.mediaMaxMb ?? cfg.channels?.signal?.mediaMaxMb,
    accountId: params.accountId
  });
  return await send(params.to, params.text, {
    cfg: params.cfg,
    ...params.mediaUrl ? { mediaUrl: params.mediaUrl } : {},
    ...params.mediaLocalRoots?.length ? { mediaLocalRoots: params.mediaLocalRoots } : {},
    maxBytes,
    accountId: params.accountId ?? void 0
  });
}
var signalPlugin = {
  id: "signal",
  meta: {
    ...meta
  },
  onboarding: import_signal.signalOnboardingAdapter,
  pairing: {
    idLabel: "signalNumber",
    normalizeAllowEntry: (entry) => entry.replace(/^signal:/i, ""),
    notifyApproval: async ({ id }) => {
      await getSignalRuntime().channel.signal.sendMessageSignal(id, import_signal.PAIRING_APPROVED_MESSAGE);
    }
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
    reactions: true
  },
  actions: signalMessageActions,
  streaming: {
    blockStreamingCoalesceDefaults: { minChars: 1500, idleMs: 1e3 }
  },
  reload: { configPrefixes: ["channels.signal"] },
  configSchema: (0, import_signal.buildChannelConfigSchema)(import_signal.SignalConfigSchema),
  config: {
    listAccountIds: (cfg) => (0, import_signal.listSignalAccountIds)(cfg),
    resolveAccount: (cfg, accountId) => (0, import_signal.resolveSignalAccount)({ cfg, accountId }),
    defaultAccountId: (cfg) => (0, import_signal.resolveDefaultSignalAccountId)(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => (0, import_signal.setAccountEnabledInConfigSection)({
      cfg,
      sectionKey: "signal",
      accountId,
      enabled,
      allowTopLevel: true
    }),
    deleteAccount: ({ cfg, accountId }) => (0, import_signal.deleteAccountFromConfigSection)({
      cfg,
      sectionKey: "signal",
      accountId,
      clearBaseFields: ["account", "httpUrl", "httpHost", "httpPort", "cliPath", "name"]
    }),
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured,
      baseUrl: account.baseUrl
    }),
    ...signalConfigAccessors
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat2.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "signal",
        accountId,
        fallbackAccountId: account.accountId ?? import_signal.DEFAULT_ACCOUNT_ID,
        policy: account.config.dmPolicy,
        allowFrom: account.config.allowFrom ?? [],
        policyPathSuffix: "dmPolicy",
        normalizeEntry: (raw) => (0, import_signal.normalizeE164)(raw.replace(/^signal:/i, "").trim())
      });
    },
    collectWarnings: ({ account, cfg }) => {
      return (0, import_compat2.collectAllowlistProviderRestrictSendersWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.signal !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        surface: "Signal groups",
        openScope: "any member",
        groupPolicyPath: "channels.signal.groupPolicy",
        groupAllowFromPath: "channels.signal.groupAllowFrom",
        mentionGated: false
      });
    }
  },
  messaging: {
    normalizeTarget: import_signal.normalizeSignalMessagingTarget,
    targetResolver: {
      looksLikeId: import_signal.looksLikeSignalTargetId,
      hint: "<E.164|uuid:ID|group:ID|signal:group:ID|signal:+E.164>"
    }
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_signal.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_signal.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "signal",
      accountId,
      name
    }),
    validateInput: ({ input }) => {
      if (!input.signalNumber && !input.httpUrl && !input.httpHost && !input.httpPort && !input.cliPath) {
        return "Signal requires --signal-number or --http-url/--http-host/--http-port/--cli-path.";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_signal.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "signal",
        accountId,
        name: input.name
      });
      const next = accountId !== import_signal.DEFAULT_ACCOUNT_ID ? (0, import_signal.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "signal"
      }) : namedConfig;
      if (accountId === import_signal.DEFAULT_ACCOUNT_ID) {
        return {
          ...next,
          channels: {
            ...next.channels,
            signal: {
              ...next.channels?.signal,
              enabled: true,
              ...buildSignalSetupPatch(input)
            }
          }
        };
      }
      return {
        ...next,
        channels: {
          ...next.channels,
          signal: {
            ...next.channels?.signal,
            enabled: true,
            accounts: {
              ...next.channels?.signal?.accounts,
              [accountId]: {
                ...next.channels?.signal?.accounts?.[accountId],
                enabled: true,
                ...buildSignalSetupPatch(input)
              }
            }
          }
        }
      };
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getSignalRuntime().channel.text.chunkText(text, limit),
    chunkerMode: "text",
    textChunkLimit: 4e3,
    sendText: async ({ cfg, to, text, accountId, deps }) => {
      const result = await sendSignalOutbound({
        cfg,
        to,
        text,
        accountId: accountId ?? void 0,
        deps
      });
      return { channel: "signal", ...result };
    },
    sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps }) => {
      const result = await sendSignalOutbound({
        cfg,
        to,
        text,
        mediaUrl,
        mediaLocalRoots,
        accountId: accountId ?? void 0,
        deps
      });
      return { channel: "signal", ...result };
    }
  },
  status: {
    defaultRuntime: (0, import_signal.createDefaultChannelRuntimeState)(import_signal.DEFAULT_ACCOUNT_ID),
    collectStatusIssues: (accounts) => (0, import_signal.collectStatusIssuesFromLastError)("signal", accounts),
    buildChannelSummary: ({ snapshot }) => ({
      ...(0, import_signal.buildBaseChannelStatusSummary)(snapshot),
      baseUrl: snapshot.baseUrl ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ account, timeoutMs }) => {
      const baseUrl = account.baseUrl;
      return await getSignalRuntime().channel.signal.probeSignal(baseUrl, timeoutMs);
    },
    buildAccountSnapshot: ({ account, runtime, probe }) => ({
      ...(0, import_signal.buildBaseAccountStatusSnapshot)({ account, runtime, probe }),
      baseUrl: account.baseUrl
    })
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      ctx.setStatus({
        accountId: account.accountId,
        baseUrl: account.baseUrl
      });
      ctx.log?.info(`[${account.accountId}] starting provider (${account.baseUrl})`);
      return getSignalRuntime().channel.signal.monitorSignalProvider({
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        mediaMaxMb: account.config.mediaMaxMb
      });
    }
  }
};

// src/core/extensions/signal/index.ts
var plugin = {
  id: "signal",
  name: "Signal",
  description: "Signal channel plugin",
  configSchema: (0, import_signal2.emptyPluginConfigSchema)(),
  register(api) {
    setSignalRuntime(api.runtime);
    api.registerChannel({ plugin: signalPlugin });
  }
};
var index_default = plugin;
