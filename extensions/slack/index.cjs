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

// src/core/extensions/slack/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_slack2 = require("src/core/source/plugin-sdk/slack");

// src/core/extensions/slack/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_slack = require("src/core/source/plugin-sdk/slack");

// src/core/extensions/slack/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } = (0, import_compat.createPluginRuntimeStore)("Slack runtime not initialized");

// src/core/extensions/slack/src/channel.ts
var meta = (0, import_slack.getChatChannelMeta)("slack");
function getTokenForOperation(account, operation) {
  const userToken = account.config.userToken?.trim() || void 0;
  const botToken = account.botToken?.trim();
  const allowUserWrites = account.config.userTokenReadOnly === false;
  if (operation === "read") {
    return userToken ?? botToken;
  }
  if (!allowUserWrites) {
    return botToken;
  }
  return botToken ?? userToken;
}
function isSlackAccountConfigured(account) {
  const mode = account.config.mode ?? "socket";
  const hasBotToken = Boolean(account.botToken?.trim());
  if (!hasBotToken) {
    return false;
  }
  if (mode === "http") {
    return Boolean(account.config.signingSecret?.trim());
  }
  return Boolean(account.appToken?.trim());
}
function resolveSlackSendContext(params) {
  const send = params.deps?.sendSlack ?? getSlackRuntime().channel.slack.sendMessageSlack;
  const account = (0, import_slack.resolveSlackAccount)({ cfg: params.cfg, accountId: params.accountId });
  const token = getTokenForOperation(account, "write");
  const botToken = account.botToken?.trim();
  const tokenOverride = token && token !== botToken ? token : void 0;
  const threadTsValue = params.replyToId ?? params.threadId;
  return { send, threadTsValue, tokenOverride };
}
var slackConfigAccessors = (0, import_compat3.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => (0, import_slack.resolveSlackAccount)({ cfg, accountId }),
  resolveAllowFrom: (account) => account.dm?.allowFrom,
  formatAllowFrom: (allowFrom) => (0, import_compat3.formatAllowFromLowercase)({ allowFrom }),
  resolveDefaultTo: (account) => account.config.defaultTo
});
var slackConfigBase = (0, import_compat2.createScopedChannelConfigBase)({
  sectionKey: "slack",
  listAccountIds: import_slack.listSlackAccountIds,
  resolveAccount: (cfg, accountId) => (0, import_slack.resolveSlackAccount)({ cfg, accountId }),
  inspectAccount: (cfg, accountId) => (0, import_slack.inspectSlackAccount)({ cfg, accountId }),
  defaultAccountId: import_slack.resolveDefaultSlackAccountId,
  clearBaseFields: ["botToken", "appToken", "name"]
});
var slackPlugin = {
  id: "slack",
  meta: {
    ...meta,
    preferSessionLookupForAnnounceTarget: true
  },
  onboarding: import_slack.slackOnboardingAdapter,
  pairing: {
    idLabel: "slackUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(slack|user):/i, ""),
    notifyApproval: async ({ id }) => {
      const cfg = getSlackRuntime().config.loadConfig();
      const account = (0, import_slack.resolveSlackAccount)({
        cfg,
        accountId: import_slack.DEFAULT_ACCOUNT_ID
      });
      const token = getTokenForOperation(account, "write");
      const botToken = account.botToken?.trim();
      const tokenOverride = token && token !== botToken ? token : void 0;
      if (tokenOverride) {
        await getSlackRuntime().channel.slack.sendMessageSlack(
          `user:${id}`,
          import_slack.PAIRING_APPROVED_MESSAGE,
          {
            token: tokenOverride
          }
        );
      } else {
        await getSlackRuntime().channel.slack.sendMessageSlack(
          `user:${id}`,
          import_slack.PAIRING_APPROVED_MESSAGE
        );
      }
    }
  },
  capabilities: {
    chatTypes: ["direct", "channel", "thread"],
    reactions: true,
    threads: true,
    media: true,
    nativeCommands: true
  },
  streaming: {
    blockStreamingCoalesceDefaults: { minChars: 1500, idleMs: 1e3 }
  },
  reload: { configPrefixes: ["channels.slack"] },
  configSchema: (0, import_slack.buildChannelConfigSchema)(import_slack.SlackConfigSchema),
  config: {
    ...slackConfigBase,
    isConfigured: (account) => isSlackAccountConfigured(account),
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: isSlackAccountConfigured(account),
      botTokenSource: account.botTokenSource,
      appTokenSource: account.appTokenSource
    }),
    ...slackConfigAccessors
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat3.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "slack",
        accountId,
        fallbackAccountId: account.accountId ?? import_slack.DEFAULT_ACCOUNT_ID,
        policy: account.dm?.policy,
        allowFrom: account.dm?.allowFrom ?? [],
        allowFromPathSuffix: "dm.",
        normalizeEntry: (raw) => raw.replace(/^(slack|user):/i, "")
      });
    },
    collectWarnings: ({ account, cfg }) => {
      const channelAllowlistConfigured = Boolean(account.config.channels) && Object.keys(account.config.channels ?? {}).length > 0;
      return (0, import_compat3.collectOpenProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.slack !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        collect: (groupPolicy) => (0, import_compat3.collectOpenGroupPolicyConfiguredRouteWarnings)({
          groupPolicy,
          routeAllowlistConfigured: channelAllowlistConfigured,
          configureRouteAllowlist: {
            surface: "Slack channels",
            openScope: "any channel not explicitly denied",
            groupPolicyPath: "channels.slack.groupPolicy",
            routeAllowlistPath: "channels.slack.channels"
          },
          missingRouteAllowlist: {
            surface: "Slack channels",
            openBehavior: "with no channel allowlist; any channel can trigger (mention-gated)",
            remediation: 'Set channels.slack.groupPolicy="allowlist" and configure channels.slack.channels'
          }
        })
      });
    }
  },
  groups: {
    resolveRequireMention: import_slack.resolveSlackGroupRequireMention,
    resolveToolPolicy: import_slack.resolveSlackGroupToolPolicy
  },
  threading: {
    resolveReplyToMode: ({ cfg, accountId, chatType }) => (0, import_slack.resolveSlackReplyToMode)((0, import_slack.resolveSlackAccount)({ cfg, accountId }), chatType),
    allowExplicitReplyTagsWhenOff: false,
    buildToolContext: (params) => (0, import_slack.buildSlackThreadingToolContext)(params)
  },
  messaging: {
    normalizeTarget: import_slack.normalizeSlackMessagingTarget,
    targetResolver: {
      looksLikeId: import_slack.looksLikeSlackTargetId,
      hint: "<channelId|user:ID|channel:ID>"
    }
  },
  directory: {
    self: async () => null,
    listPeers: async (params) => (0, import_slack.listSlackDirectoryPeersFromConfig)(params),
    listGroups: async (params) => (0, import_slack.listSlackDirectoryGroupsFromConfig)(params),
    listPeersLive: async (params) => getSlackRuntime().channel.slack.listDirectoryPeersLive(params),
    listGroupsLive: async (params) => getSlackRuntime().channel.slack.listDirectoryGroupsLive(params)
  },
  resolver: {
    resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
      const account = (0, import_slack.resolveSlackAccount)({ cfg, accountId });
      const token = account.config.userToken?.trim() || account.botToken?.trim();
      if (!token) {
        return inputs.map((input) => ({
          input,
          resolved: false,
          note: "missing Slack token"
        }));
      }
      if (kind === "group") {
        const resolved2 = await getSlackRuntime().channel.slack.resolveChannelAllowlist({
          token,
          entries: inputs
        });
        return resolved2.map((entry) => ({
          input: entry.input,
          resolved: entry.resolved,
          id: entry.id,
          name: entry.name,
          note: entry.archived ? "archived" : void 0
        }));
      }
      const resolved = await getSlackRuntime().channel.slack.resolveUserAllowlist({
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
  actions: {
    listActions: ({ cfg }) => (0, import_slack.listSlackMessageActions)(cfg),
    extractToolSend: ({ args }) => (0, import_slack.extractSlackToolSend)(args),
    handleAction: async (ctx) => await (0, import_slack.handleSlackMessageAction)({
      providerId: meta.id,
      ctx,
      includeReadThreadId: true,
      invoke: async (action, cfg, toolContext) => await getSlackRuntime().channel.slack.handleSlackAction(action, cfg, toolContext)
    })
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_slack.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_slack.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "slack",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      if (input.useEnv && accountId !== import_slack.DEFAULT_ACCOUNT_ID) {
        return "Slack env tokens can only be used for the default account.";
      }
      if (!input.useEnv && (!input.botToken || !input.appToken)) {
        return "Slack requires --bot-token and --app-token (or --use-env).";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_slack.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "slack",
        accountId,
        name: input.name
      });
      const next = accountId !== import_slack.DEFAULT_ACCOUNT_ID ? (0, import_slack.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "slack"
      }) : namedConfig;
      if (accountId === import_slack.DEFAULT_ACCOUNT_ID) {
        return {
          ...next,
          channels: {
            ...next.channels,
            slack: {
              ...next.channels?.slack,
              enabled: true,
              ...input.useEnv ? {} : {
                ...input.botToken ? { botToken: input.botToken } : {},
                ...input.appToken ? { appToken: input.appToken } : {}
              }
            }
          }
        };
      }
      return {
        ...next,
        channels: {
          ...next.channels,
          slack: {
            ...next.channels?.slack,
            enabled: true,
            accounts: {
              ...next.channels?.slack?.accounts,
              [accountId]: {
                ...next.channels?.slack?.accounts?.[accountId],
                enabled: true,
                ...input.botToken ? { botToken: input.botToken } : {},
                ...input.appToken ? { appToken: input.appToken } : {}
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
    textChunkLimit: 4e3,
    sendText: async ({ to, text, accountId, deps, replyToId, threadId, cfg }) => {
      const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
        cfg,
        accountId: accountId ?? void 0,
        deps,
        replyToId,
        threadId
      });
      const result = await send(to, text, {
        cfg,
        threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
        accountId: accountId ?? void 0,
        ...tokenOverride ? { token: tokenOverride } : {}
      });
      return { channel: "slack", ...result };
    },
    sendMedia: async ({
      to,
      text,
      mediaUrl,
      mediaLocalRoots,
      accountId,
      deps,
      replyToId,
      threadId,
      cfg
    }) => {
      const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
        cfg,
        accountId: accountId ?? void 0,
        deps,
        replyToId,
        threadId
      });
      const result = await send(to, text, {
        cfg,
        mediaUrl,
        mediaLocalRoots,
        threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
        accountId: accountId ?? void 0,
        ...tokenOverride ? { token: tokenOverride } : {}
      });
      return { channel: "slack", ...result };
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_slack.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      botTokenSource: snapshot.botTokenSource ?? "none",
      appTokenSource: snapshot.appTokenSource ?? "none",
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ account, timeoutMs }) => {
      const token = account.botToken?.trim();
      if (!token) {
        return { ok: false, error: "missing token" };
      }
      return await getSlackRuntime().channel.slack.probeSlack(token, timeoutMs);
    },
    buildAccountSnapshot: ({ account, runtime, probe }) => {
      const mode = account.config.mode ?? "socket";
      const configured = (mode === "http" ? (0, import_slack.resolveConfiguredFromRequiredCredentialStatuses)(account, [
        "botTokenStatus",
        "signingSecretStatus"
      ]) : (0, import_slack.resolveConfiguredFromRequiredCredentialStatuses)(account, [
        "botTokenStatus",
        "appTokenStatus"
      ])) ?? isSlackAccountConfigured(account);
      const base = (0, import_slack.buildComputedAccountStatusSnapshot)({
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured,
        runtime,
        probe
      });
      return {
        ...base,
        ...(0, import_slack.projectCredentialSnapshotFields)(account)
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const botToken = account.botToken?.trim();
      const appToken = account.appToken?.trim();
      ctx.log?.info(`[${account.accountId}] starting provider`);
      return getSlackRuntime().channel.slack.monitorSlackProvider({
        botToken: botToken ?? "",
        appToken: appToken ?? "",
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        mediaMaxMb: account.config.mediaMaxMb,
        slashCommand: account.config.slashCommand,
        setStatus: ctx.setStatus,
        getStatus: ctx.getStatus
      });
    }
  }
};

// src/core/extensions/slack/index.ts
var plugin = {
  id: "slack",
  name: "Slack",
  description: "Slack channel plugin",
  configSchema: (0, import_slack2.emptyPluginConfigSchema)(),
  register(api) {
    setSlackRuntime(api.runtime);
    api.registerChannel({ plugin: slackPlugin });
  }
};
var index_default = plugin;
