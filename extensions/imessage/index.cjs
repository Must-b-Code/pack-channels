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

// src/core/extensions/imessage/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_imessage2 = require("src/core/source/plugin-sdk/imessage");

// src/core/extensions/imessage/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_imessage = require("src/core/source/plugin-sdk/imessage");

// src/core/extensions/imessage/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } = (0, import_compat.createPluginRuntimeStore)("iMessage runtime not initialized");

// src/core/extensions/imessage/src/channel.ts
var meta = (0, import_imessage.getChatChannelMeta)("imessage");
function buildIMessageSetupPatch(input) {
  return {
    ...input.cliPath ? { cliPath: input.cliPath } : {},
    ...input.dbPath ? { dbPath: input.dbPath } : {},
    ...input.service ? { service: input.service } : {},
    ...input.region ? { region: input.region } : {}
  };
}
async function sendIMessageOutbound(params) {
  const send = params.deps?.sendIMessage ?? getIMessageRuntime().channel.imessage.sendMessageIMessage;
  const maxBytes = (0, import_imessage.resolveChannelMediaMaxBytes)({
    cfg: params.cfg,
    resolveChannelLimitMb: ({ cfg, accountId }) => cfg.channels?.imessage?.accounts?.[accountId]?.mediaMaxMb ?? cfg.channels?.imessage?.mediaMaxMb,
    accountId: params.accountId
  });
  return await send(params.to, params.text, {
    config: params.cfg,
    ...params.mediaUrl ? { mediaUrl: params.mediaUrl } : {},
    ...params.mediaLocalRoots?.length ? { mediaLocalRoots: params.mediaLocalRoots } : {},
    maxBytes,
    accountId: params.accountId ?? void 0,
    replyToId: params.replyToId ?? void 0
  });
}
var imessagePlugin = {
  id: "imessage",
  meta: {
    ...meta,
    aliases: ["imsg"],
    showConfigured: false
  },
  onboarding: import_imessage.imessageOnboardingAdapter,
  pairing: {
    idLabel: "imessageSenderId",
    notifyApproval: async ({ id }) => {
      await getIMessageRuntime().channel.imessage.sendMessageIMessage(id, import_imessage.PAIRING_APPROVED_MESSAGE);
    }
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true
  },
  reload: { configPrefixes: ["channels.imessage"] },
  configSchema: (0, import_imessage.buildChannelConfigSchema)(import_imessage.IMessageConfigSchema),
  config: {
    listAccountIds: (cfg) => (0, import_imessage.listIMessageAccountIds)(cfg),
    resolveAccount: (cfg, accountId) => (0, import_imessage.resolveIMessageAccount)({ cfg, accountId }),
    defaultAccountId: (cfg) => (0, import_imessage.resolveDefaultIMessageAccountId)(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => (0, import_imessage.setAccountEnabledInConfigSection)({
      cfg,
      sectionKey: "imessage",
      accountId,
      enabled,
      allowTopLevel: true
    }),
    deleteAccount: ({ cfg, accountId }) => (0, import_imessage.deleteAccountFromConfigSection)({
      cfg,
      sectionKey: "imessage",
      accountId,
      clearBaseFields: ["cliPath", "dbPath", "service", "region", "name"]
    }),
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured
    }),
    resolveAllowFrom: ({ cfg, accountId }) => (0, import_imessage.resolveIMessageConfigAllowFrom)({ cfg, accountId }),
    formatAllowFrom: ({ allowFrom }) => (0, import_imessage.formatTrimmedAllowFromEntries)(allowFrom),
    resolveDefaultTo: ({ cfg, accountId }) => (0, import_imessage.resolveIMessageConfigDefaultTo)({ cfg, accountId })
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat2.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "imessage",
        accountId,
        fallbackAccountId: account.accountId ?? import_imessage.DEFAULT_ACCOUNT_ID,
        policy: account.config.dmPolicy,
        allowFrom: account.config.allowFrom ?? [],
        policyPathSuffix: "dmPolicy"
      });
    },
    collectWarnings: ({ account, cfg }) => {
      return (0, import_compat2.collectAllowlistProviderRestrictSendersWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.imessage !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        surface: "iMessage groups",
        openScope: "any member",
        groupPolicyPath: "channels.imessage.groupPolicy",
        groupAllowFromPath: "channels.imessage.groupAllowFrom",
        mentionGated: false
      });
    }
  },
  groups: {
    resolveRequireMention: import_imessage.resolveIMessageGroupRequireMention,
    resolveToolPolicy: import_imessage.resolveIMessageGroupToolPolicy
  },
  messaging: {
    normalizeTarget: import_imessage.normalizeIMessageMessagingTarget,
    targetResolver: {
      looksLikeId: import_imessage.looksLikeIMessageTargetId,
      hint: "<handle|chat_id:ID>"
    }
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_imessage.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_imessage.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "imessage",
      accountId,
      name
    }),
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_imessage.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "imessage",
        accountId,
        name: input.name
      });
      const next = accountId !== import_imessage.DEFAULT_ACCOUNT_ID ? (0, import_imessage.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "imessage"
      }) : namedConfig;
      if (accountId === import_imessage.DEFAULT_ACCOUNT_ID) {
        return {
          ...next,
          channels: {
            ...next.channels,
            imessage: {
              ...next.channels?.imessage,
              enabled: true,
              ...buildIMessageSetupPatch(input)
            }
          }
        };
      }
      return {
        ...next,
        channels: {
          ...next.channels,
          imessage: {
            ...next.channels?.imessage,
            enabled: true,
            accounts: {
              ...next.channels?.imessage?.accounts,
              [accountId]: {
                ...next.channels?.imessage?.accounts?.[accountId],
                enabled: true,
                ...buildIMessageSetupPatch(input)
              }
            }
          }
        }
      };
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getIMessageRuntime().channel.text.chunkText(text, limit),
    chunkerMode: "text",
    textChunkLimit: 4e3,
    sendText: async ({ cfg, to, text, accountId, deps, replyToId }) => {
      const result = await sendIMessageOutbound({
        cfg,
        to,
        text,
        accountId: accountId ?? void 0,
        deps,
        replyToId: replyToId ?? void 0
      });
      return { channel: "imessage", ...result };
    },
    sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId }) => {
      const result = await sendIMessageOutbound({
        cfg,
        to,
        text,
        mediaUrl,
        mediaLocalRoots,
        accountId: accountId ?? void 0,
        deps,
        replyToId: replyToId ?? void 0
      });
      return { channel: "imessage", ...result };
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_imessage.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null,
      cliPath: null,
      dbPath: null
    },
    collectStatusIssues: (accounts) => (0, import_imessage.collectStatusIssuesFromLastError)("imessage", accounts),
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      cliPath: snapshot.cliPath ?? null,
      dbPath: snapshot.dbPath ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ timeoutMs }) => getIMessageRuntime().channel.imessage.probeIMessage(timeoutMs),
    buildAccountSnapshot: ({ account, runtime, probe }) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.configured,
      running: runtime?.running ?? false,
      lastStartAt: runtime?.lastStartAt ?? null,
      lastStopAt: runtime?.lastStopAt ?? null,
      lastError: runtime?.lastError ?? null,
      cliPath: runtime?.cliPath ?? account.config.cliPath ?? null,
      dbPath: runtime?.dbPath ?? account.config.dbPath ?? null,
      probe,
      lastInboundAt: runtime?.lastInboundAt ?? null,
      lastOutboundAt: runtime?.lastOutboundAt ?? null
    }),
    resolveAccountState: ({ enabled }) => enabled ? "enabled" : "disabled"
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const cliPath = account.config.cliPath?.trim() || "imsg";
      const dbPath = account.config.dbPath?.trim();
      ctx.setStatus({
        accountId: account.accountId,
        cliPath,
        dbPath: dbPath ?? null
      });
      ctx.log?.info(
        `[${account.accountId}] starting provider (${cliPath}${dbPath ? ` db=${dbPath}` : ""})`
      );
      return getIMessageRuntime().channel.imessage.monitorIMessageProvider({
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal
      });
    }
  }
};

// src/core/extensions/imessage/index.ts
var plugin = {
  id: "imessage",
  name: "iMessage",
  description: "iMessage channel plugin",
  configSchema: (0, import_imessage2.emptyPluginConfigSchema)(),
  register(api) {
    setIMessageRuntime(api.runtime);
    api.registerChannel({ plugin: imessagePlugin });
  }
};
var index_default = plugin;
