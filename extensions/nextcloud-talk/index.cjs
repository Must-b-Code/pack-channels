"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/extensions/nextcloud-talk/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_nextcloud_talk11 = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_nextcloud_talk10 = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/accounts.ts
var import_core = require("src/core/source/plugin-sdk/core");
var import_nextcloud_talk2 = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/secret-input.ts
var import_nextcloud_talk = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/accounts.ts
function isTruthyEnvValue(value) {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}
var debugAccounts = (...args) => {
  if (isTruthyEnvValue(process.env.MUSTB_DEBUG_NEXTCLOUD_TALK_ACCOUNTS)) {
    console.warn("[nextcloud-talk:accounts]", ...args);
  }
};
var {
  listAccountIds: listNextcloudTalkAccountIdsInternal,
  resolveDefaultAccountId: resolveDefaultNextcloudTalkAccountId
} = (0, import_nextcloud_talk2.createAccountListHelpers)("nextcloud-talk", {
  normalizeAccountId: import_nextcloud_talk2.normalizeAccountId
});
function listNextcloudTalkAccountIds(cfg) {
  const ids = listNextcloudTalkAccountIdsInternal(cfg);
  debugAccounts("listNextcloudTalkAccountIds", ids);
  return ids;
}
function resolveAccountConfig(cfg, accountId) {
  const accounts = cfg.channels?.["nextcloud-talk"]?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return void 0;
  }
  const direct = accounts[accountId];
  if (direct) {
    return direct;
  }
  const normalized = (0, import_nextcloud_talk2.normalizeAccountId)(accountId);
  const matchKey = Object.keys(accounts).find((key) => (0, import_nextcloud_talk2.normalizeAccountId)(key) === normalized);
  return matchKey ? accounts[matchKey] : void 0;
}
function mergeNextcloudTalkAccountConfig(cfg, accountId) {
  const {
    accounts: _ignored,
    defaultAccount: _ignoredDefaultAccount,
    ...base
  } = cfg.channels?.["nextcloud-talk"] ?? {};
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  return { ...base, ...account };
}
function resolveNextcloudTalkSecret(cfg, opts) {
  const merged = mergeNextcloudTalkAccountConfig(cfg, opts.accountId ?? import_nextcloud_talk2.DEFAULT_ACCOUNT_ID);
  const envSecret = process.env.NEXTCLOUD_TALK_BOT_SECRET?.trim();
  if (envSecret && (!opts.accountId || opts.accountId === import_nextcloud_talk2.DEFAULT_ACCOUNT_ID)) {
    return { secret: envSecret, source: "env" };
  }
  if (merged.botSecretFile) {
    const fileSecret = (0, import_core.tryReadSecretFileSync)(
      merged.botSecretFile,
      "Nextcloud Talk bot secret file",
      { rejectSymlink: true }
    );
    if (fileSecret) {
      return { secret: fileSecret, source: "secretFile" };
    }
  }
  const inlineSecret = (0, import_nextcloud_talk.normalizeResolvedSecretInputString)({
    value: merged.botSecret,
    path: `channels.nextcloud-talk.accounts.${opts.accountId ?? import_nextcloud_talk2.DEFAULT_ACCOUNT_ID}.botSecret`
  });
  if (inlineSecret) {
    return { secret: inlineSecret, source: "config" };
  }
  return { secret: "", source: "none" };
}
function resolveNextcloudTalkAccount(params) {
  const baseEnabled = params.cfg.channels?.["nextcloud-talk"]?.enabled !== false;
  const resolve = (accountId) => {
    const merged = mergeNextcloudTalkAccountConfig(params.cfg, accountId);
    const accountEnabled = merged.enabled !== false;
    const enabled = baseEnabled && accountEnabled;
    const secretResolution = resolveNextcloudTalkSecret(params.cfg, { accountId });
    const baseUrl = merged.baseUrl?.trim()?.replace(/\/$/, "") ?? "";
    debugAccounts("resolve", {
      accountId,
      enabled,
      secretSource: secretResolution.source,
      baseUrl: baseUrl ? "[set]" : "[missing]"
    });
    return {
      accountId,
      enabled,
      name: merged.name?.trim() || void 0,
      baseUrl,
      secret: secretResolution.secret,
      secretSource: secretResolution.source,
      config: merged
    };
  };
  return (0, import_nextcloud_talk2.resolveAccountWithDefaultFallback)({
    accountId: params.accountId,
    normalizeAccountId: import_nextcloud_talk2.normalizeAccountId,
    resolvePrimary: resolve,
    hasCredential: (account) => account.secretSource !== "none",
    resolveDefaultAccountId: () => resolveDefaultNextcloudTalkAccountId(params.cfg)
  });
}

// src/core/extensions/nextcloud-talk/src/config-schema.ts
var import_nextcloud_talk3 = require("src/core/source/plugin-sdk/nextcloud-talk");
var import_zod = require("zod");
var NextcloudTalkRoomSchema = import_zod.z.object({
  requireMention: import_zod.z.boolean().optional(),
  tools: import_nextcloud_talk3.ToolPolicySchema,
  skills: import_zod.z.array(import_zod.z.string()).optional(),
  enabled: import_zod.z.boolean().optional(),
  allowFrom: import_zod.z.array(import_zod.z.string()).optional(),
  systemPrompt: import_zod.z.string().optional()
}).strict();
var NextcloudTalkAccountSchemaBase = import_zod.z.object({
  name: import_zod.z.string().optional(),
  enabled: import_zod.z.boolean().optional(),
  markdown: import_nextcloud_talk3.MarkdownConfigSchema,
  baseUrl: import_zod.z.string().optional(),
  botSecret: (0, import_nextcloud_talk.buildSecretInputSchema)().optional(),
  botSecretFile: import_zod.z.string().optional(),
  apiUser: import_zod.z.string().optional(),
  apiPassword: (0, import_nextcloud_talk.buildSecretInputSchema)().optional(),
  apiPasswordFile: import_zod.z.string().optional(),
  dmPolicy: import_nextcloud_talk3.DmPolicySchema.optional().default("pairing"),
  webhookPort: import_zod.z.number().int().positive().optional(),
  webhookHost: import_zod.z.string().optional(),
  webhookPath: import_zod.z.string().optional(),
  webhookPublicUrl: import_zod.z.string().optional(),
  allowFrom: import_zod.z.array(import_zod.z.string()).optional(),
  groupAllowFrom: import_zod.z.array(import_zod.z.string()).optional(),
  groupPolicy: import_nextcloud_talk3.GroupPolicySchema.optional().default("allowlist"),
  rooms: import_zod.z.record(import_zod.z.string(), NextcloudTalkRoomSchema.optional()).optional(),
  ...import_nextcloud_talk3.ReplyRuntimeConfigSchemaShape
}).strict();
var NextcloudTalkAccountSchema = NextcloudTalkAccountSchemaBase.superRefine(
  (value, ctx) => {
    (0, import_nextcloud_talk3.requireOpenAllowFrom)({
      policy: value.dmPolicy,
      allowFrom: value.allowFrom,
      ctx,
      path: ["allowFrom"],
      message: 'channels.nextcloud-talk.dmPolicy="open" requires channels.nextcloud-talk.allowFrom to include "*"'
    });
  }
);
var NextcloudTalkConfigSchema = NextcloudTalkAccountSchemaBase.extend({
  accounts: import_zod.z.record(import_zod.z.string(), NextcloudTalkAccountSchema.optional()).optional(),
  defaultAccount: import_zod.z.string().optional()
}).superRefine((value, ctx) => {
  (0, import_nextcloud_talk3.requireOpenAllowFrom)({
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    path: ["allowFrom"],
    message: 'channels.nextcloud-talk.dmPolicy="open" requires channels.nextcloud-talk.allowFrom to include "*"'
  });
});

// src/core/extensions/nextcloud-talk/src/monitor.ts
var import_node_http = require("node:http");
var import_node_os = __toESM(require("node:os"), 1);
var import_nextcloud_talk8 = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/inbound.ts
var import_nextcloud_talk6 = require("src/core/source/plugin-sdk/nextcloud-talk");

// src/core/extensions/nextcloud-talk/src/policy.ts
var import_nextcloud_talk4 = require("src/core/source/plugin-sdk/nextcloud-talk");
function normalizeAllowEntry(raw) {
  return raw.trim().toLowerCase().replace(/^(nextcloud-talk|nc-talk|nc):/i, "");
}
function normalizeNextcloudTalkAllowlist(values) {
  return (values ?? []).map((value) => normalizeAllowEntry(String(value))).filter(Boolean);
}
function resolveNextcloudTalkAllowlistMatch(params) {
  const allowFrom = normalizeNextcloudTalkAllowlist(params.allowFrom);
  if (allowFrom.length === 0) {
    return { allowed: false };
  }
  if (allowFrom.includes("*")) {
    return { allowed: true, matchKey: "*", matchSource: "wildcard" };
  }
  const senderId = normalizeAllowEntry(params.senderId);
  if (allowFrom.includes(senderId)) {
    return { allowed: true, matchKey: senderId, matchSource: "id" };
  }
  return { allowed: false };
}
function resolveNextcloudTalkRoomMatch(params) {
  const rooms = params.rooms ?? {};
  const allowlistConfigured = Object.keys(rooms).length > 0;
  const roomName = params.roomName?.trim() || void 0;
  const roomCandidates = (0, import_nextcloud_talk4.buildChannelKeyCandidates)(
    params.roomToken,
    roomName,
    roomName ? (0, import_nextcloud_talk4.normalizeChannelSlug)(roomName) : void 0
  );
  const match = (0, import_nextcloud_talk4.resolveChannelEntryMatchWithFallback)({
    entries: rooms,
    keys: roomCandidates,
    wildcardKey: "*",
    normalizeKey: import_nextcloud_talk4.normalizeChannelSlug
  });
  const roomConfig = match.entry;
  const allowed = (0, import_nextcloud_talk4.resolveNestedAllowlistDecision)({
    outerConfigured: allowlistConfigured,
    outerMatched: Boolean(roomConfig),
    innerConfigured: false,
    innerMatched: false
  });
  return {
    roomConfig,
    wildcardConfig: match.wildcardEntry,
    roomKey: match.matchKey ?? match.key,
    matchSource: match.matchSource,
    allowed,
    allowlistConfigured
  };
}
function resolveNextcloudTalkGroupToolPolicy(params) {
  const cfg = params.cfg;
  const roomToken = params.groupId?.trim();
  if (!roomToken) {
    return void 0;
  }
  const roomName = params.groupChannel?.trim() || void 0;
  const match = resolveNextcloudTalkRoomMatch({
    rooms: cfg.channels?.["nextcloud-talk"]?.rooms,
    roomToken,
    roomName
  });
  return match.roomConfig?.tools ?? match.wildcardConfig?.tools;
}
function resolveNextcloudTalkRequireMention(params) {
  if (typeof params.roomConfig?.requireMention === "boolean") {
    return params.roomConfig.requireMention;
  }
  if (typeof params.wildcardConfig?.requireMention === "boolean") {
    return params.wildcardConfig.requireMention;
  }
  return true;
}
function resolveNextcloudTalkGroupAllow(params) {
  const outerAllow = normalizeNextcloudTalkAllowlist(params.outerAllowFrom);
  const innerAllow = normalizeNextcloudTalkAllowlist(params.innerAllowFrom);
  const outerMatch = resolveNextcloudTalkAllowlistMatch({
    allowFrom: params.outerAllowFrom,
    senderId: params.senderId
  });
  const innerMatch = resolveNextcloudTalkAllowlistMatch({
    allowFrom: params.innerAllowFrom,
    senderId: params.senderId
  });
  const access = (0, import_nextcloud_talk4.evaluateMatchedGroupAccessForPolicy)({
    groupPolicy: params.groupPolicy,
    allowlistConfigured: outerAllow.length > 0 || innerAllow.length > 0,
    allowlistMatched: (0, import_nextcloud_talk4.resolveNestedAllowlistDecision)({
      outerConfigured: outerAllow.length > 0 || innerAllow.length > 0,
      outerMatched: outerAllow.length > 0 ? outerMatch.allowed : true,
      innerConfigured: innerAllow.length > 0,
      innerMatched: innerMatch.allowed
    })
  });
  return {
    allowed: access.allowed,
    outerMatch: params.groupPolicy === "open" ? { allowed: true } : params.groupPolicy === "disabled" ? { allowed: false } : outerMatch,
    innerMatch: params.groupPolicy === "open" ? { allowed: true } : params.groupPolicy === "disabled" ? { allowed: false } : innerMatch
  };
}
function resolveNextcloudTalkMentionGate(params) {
  const result = (0, import_nextcloud_talk4.resolveMentionGatingWithBypass)({
    isGroup: params.isGroup,
    requireMention: params.requireMention,
    canDetectMention: true,
    wasMentioned: params.wasMentioned,
    allowTextCommands: params.allowTextCommands,
    hasControlCommand: params.hasControlCommand,
    commandAuthorized: params.commandAuthorized
  });
  return { shouldSkip: result.shouldSkip, shouldBypassMention: result.shouldBypassMention };
}

// src/core/extensions/nextcloud-talk/src/room-info.ts
var import_node_fs = require("node:fs");
var import_nextcloud_talk5 = require("src/core/source/plugin-sdk/nextcloud-talk");
var ROOM_CACHE_TTL_MS = 5 * 60 * 1e3;
var ROOM_CACHE_ERROR_TTL_MS = 30 * 1e3;
var roomCache = /* @__PURE__ */ new Map();
function resolveRoomCacheKey(params) {
  return `${params.accountId}:${params.roomToken}`;
}
function readApiPassword(params) {
  const inlinePassword = (0, import_nextcloud_talk.normalizeResolvedSecretInputString)({
    value: params.apiPassword,
    path: "channels.nextcloud-talk.apiPassword"
  });
  if (inlinePassword) {
    return inlinePassword;
  }
  if (!params.apiPasswordFile) {
    return void 0;
  }
  try {
    const value = (0, import_node_fs.readFileSync)(params.apiPasswordFile, "utf-8").trim();
    return value || void 0;
  } catch {
    return void 0;
  }
}
function coerceRoomType(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : void 0;
  }
  return void 0;
}
function resolveRoomKindFromType(type) {
  if (!type) {
    return void 0;
  }
  if (type === 1 || type === 5 || type === 6) {
    return "direct";
  }
  return "group";
}
async function resolveNextcloudTalkRoomKind(params) {
  const { account, roomToken, runtime } = params;
  const key = resolveRoomCacheKey({ accountId: account.accountId, roomToken });
  const cached = roomCache.get(key);
  if (cached) {
    const age = Date.now() - cached.fetchedAt;
    if (cached.kind && age < ROOM_CACHE_TTL_MS) {
      return cached.kind;
    }
    if (cached.error && age < ROOM_CACHE_ERROR_TTL_MS) {
      return void 0;
    }
  }
  const apiUser = account.config.apiUser?.trim();
  const apiPassword = readApiPassword({
    apiPassword: account.config.apiPassword,
    apiPasswordFile: account.config.apiPasswordFile
  });
  if (!apiUser || !apiPassword) {
    return void 0;
  }
  const baseUrl = account.baseUrl?.trim();
  if (!baseUrl) {
    return void 0;
  }
  const url = `${baseUrl}/ocs/v2.php/apps/spreed/api/v4/room/${roomToken}`;
  const auth = Buffer.from(`${apiUser}:${apiPassword}`, "utf-8").toString("base64");
  try {
    const { response, release } = await (0, import_nextcloud_talk5.fetchWithSsrFGuard)({
      url,
      init: {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "OCS-APIRequest": "true",
          Accept: "application/json"
        }
      },
      auditContext: "nextcloud-talk.room-info"
    });
    try {
      if (!response.ok) {
        roomCache.set(key, {
          fetchedAt: Date.now(),
          error: `status:${response.status}`
        });
        runtime?.log?.(
          `nextcloud-talk: room lookup failed (${response.status}) token=${roomToken}`
        );
        return void 0;
      }
      const payload = await response.json();
      const type = coerceRoomType(payload.ocs?.data?.type);
      const kind = resolveRoomKindFromType(type);
      roomCache.set(key, { fetchedAt: Date.now(), kind });
      return kind;
    } finally {
      await release();
    }
  } catch (err) {
    roomCache.set(key, {
      fetchedAt: Date.now(),
      error: err instanceof Error ? err.message : String(err)
    });
    runtime?.error?.(`nextcloud-talk: room lookup error: ${String(err)}`);
    return void 0;
  }
}

// src/core/extensions/nextcloud-talk/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setNextcloudTalkRuntime, getRuntime: getNextcloudTalkRuntime } = (0, import_compat.createPluginRuntimeStore)("Nextcloud Talk runtime not initialized");

// src/core/extensions/nextcloud-talk/src/signature.ts
var import_node_crypto = require("node:crypto");
var SIGNATURE_HEADER = "x-nextcloud-talk-signature";
var RANDOM_HEADER = "x-nextcloud-talk-random";
var BACKEND_HEADER = "x-nextcloud-talk-backend";
function verifyNextcloudTalkSignature(params) {
  const { signature, random, body, secret } = params;
  if (!signature || !random || !secret) {
    return false;
  }
  const expected = (0, import_node_crypto.createHmac)("sha256", secret).update(random + body).digest("hex");
  if (signature.length !== expected.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}
function extractNextcloudTalkHeaders(headers) {
  const getHeader = (name) => {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };
  const signature = getHeader(SIGNATURE_HEADER);
  const random = getHeader(RANDOM_HEADER);
  const backend = getHeader(BACKEND_HEADER);
  if (!signature || !random || !backend) {
    return null;
  }
  return { signature, random, backend };
}
function generateNextcloudTalkSignature(params) {
  const { body, secret } = params;
  const random = (0, import_node_crypto.randomBytes)(32).toString("hex");
  const signature = (0, import_node_crypto.createHmac)("sha256", secret).update(random + body).digest("hex");
  return { random, signature };
}

// src/core/extensions/nextcloud-talk/src/send.ts
function resolveCredentials(explicit, account) {
  const baseUrl = explicit.baseUrl?.trim() ?? account.baseUrl;
  const secret = explicit.secret?.trim() ?? account.secret;
  if (!baseUrl) {
    throw new Error(
      `Nextcloud Talk baseUrl missing for account "${account.accountId}" (set channels.nextcloud-talk.baseUrl).`
    );
  }
  if (!secret) {
    throw new Error(
      `Nextcloud Talk bot secret missing for account "${account.accountId}" (set channels.nextcloud-talk.botSecret/botSecretFile or NEXTCLOUD_TALK_BOT_SECRET for default).`
    );
  }
  return { baseUrl, secret };
}
function normalizeRoomToken(to) {
  const trimmed = to.trim();
  if (!trimmed) {
    throw new Error("Room token is required for Nextcloud Talk sends");
  }
  let normalized = trimmed;
  if (normalized.startsWith("nextcloud-talk:")) {
    normalized = normalized.slice("nextcloud-talk:".length).trim();
  } else if (normalized.startsWith("nc:")) {
    normalized = normalized.slice("nc:".length).trim();
  }
  if (normalized.startsWith("room:")) {
    normalized = normalized.slice("room:".length).trim();
  }
  if (!normalized) {
    throw new Error("Room token is required for Nextcloud Talk sends");
  }
  return normalized;
}
async function sendMessageNextcloudTalk(to, text, opts = {}) {
  const cfg = opts.cfg ?? getNextcloudTalkRuntime().config.loadConfig();
  const account = resolveNextcloudTalkAccount({
    cfg,
    accountId: opts.accountId
  });
  const { baseUrl, secret } = resolveCredentials(
    { baseUrl: opts.baseUrl, secret: opts.secret },
    account
  );
  const roomToken = normalizeRoomToken(to);
  if (!text?.trim()) {
    throw new Error("Message must be non-empty for Nextcloud Talk sends");
  }
  const tableMode = getNextcloudTalkRuntime().channel.text.resolveMarkdownTableMode({
    cfg,
    channel: "nextcloud-talk",
    accountId: account.accountId
  });
  const message = getNextcloudTalkRuntime().channel.text.convertMarkdownTables(
    text.trim(),
    tableMode
  );
  const body = {
    message
  };
  if (opts.replyTo) {
    body.replyTo = opts.replyTo;
  }
  const bodyStr = JSON.stringify(body);
  const { random, signature } = generateNextcloudTalkSignature({
    body: message,
    secret
  });
  const url = `${baseUrl}/ocs/v2.php/apps/spreed/api/v1/bot/${roomToken}/message`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OCS-APIRequest": "true",
      "X-Nextcloud-Talk-Bot-Random": random,
      "X-Nextcloud-Talk-Bot-Signature": signature
    },
    body: bodyStr
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    const status = response.status;
    let errorMsg = `Nextcloud Talk send failed (${status})`;
    if (status === 400) {
      errorMsg = `Nextcloud Talk: bad request - ${errorBody || "invalid message format"}`;
    } else if (status === 401) {
      errorMsg = "Nextcloud Talk: authentication failed - check bot secret";
    } else if (status === 403) {
      errorMsg = "Nextcloud Talk: forbidden - bot may not have permission in this room";
    } else if (status === 404) {
      errorMsg = `Nextcloud Talk: room not found (token=${roomToken})`;
    } else if (errorBody) {
      errorMsg = `Nextcloud Talk send failed: ${errorBody}`;
    }
    throw new Error(errorMsg);
  }
  let messageId = "unknown";
  let timestamp;
  try {
    const data = await response.json();
    if (data.ocs?.data?.id != null) {
      messageId = String(data.ocs.data.id);
    }
    if (typeof data.ocs?.data?.timestamp === "number") {
      timestamp = data.ocs.data.timestamp;
    }
  } catch {
  }
  if (opts.verbose) {
    console.log(`[nextcloud-talk] Sent message ${messageId} to room ${roomToken}`);
  }
  getNextcloudTalkRuntime().channel.activity.record({
    channel: "nextcloud-talk",
    accountId: account.accountId,
    direction: "outbound"
  });
  return { messageId, roomToken, timestamp };
}

// src/core/extensions/nextcloud-talk/src/inbound.ts
var CHANNEL_ID = "nextcloud-talk";
async function deliverNextcloudTalkReply(params) {
  const { payload, roomToken, accountId, statusSink } = params;
  const combined = (0, import_nextcloud_talk6.formatTextWithAttachmentLinks)(payload.text, (0, import_nextcloud_talk6.resolveOutboundMediaUrls)(payload));
  if (!combined) {
    return;
  }
  await sendMessageNextcloudTalk(roomToken, combined, {
    accountId,
    replyTo: payload.replyToId
  });
  statusSink?.({ lastOutboundAt: Date.now() });
}
async function handleNextcloudTalkInbound(params) {
  const { message, account, config, runtime, statusSink } = params;
  const core = getNextcloudTalkRuntime();
  const pairing = (0, import_nextcloud_talk6.createScopedPairingAccess)({
    core,
    channel: CHANNEL_ID,
    accountId: account.accountId
  });
  const rawBody = message.text?.trim() ?? "";
  if (!rawBody) {
    return;
  }
  const roomKind = await resolveNextcloudTalkRoomKind({
    account,
    roomToken: message.roomToken,
    runtime
  });
  const isGroup = roomKind === "direct" ? false : roomKind === "group" ? true : message.isGroupChat;
  const senderId = message.senderId;
  const senderName = message.senderName;
  const roomToken = message.roomToken;
  const roomName = message.roomName;
  statusSink?.({ lastInboundAt: message.timestamp });
  const dmPolicy2 = account.config.dmPolicy ?? "pairing";
  const defaultGroupPolicy = (0, import_nextcloud_talk6.resolveDefaultGroupPolicy)(config);
  const { groupPolicy, providerMissingFallbackApplied } = (0, import_nextcloud_talk6.resolveAllowlistProviderRuntimeGroupPolicy)({
    providerConfigPresent: (config.channels?.["nextcloud-talk"] ?? void 0) !== void 0,
    groupPolicy: account.config.groupPolicy,
    defaultGroupPolicy
  });
  (0, import_nextcloud_talk6.warnMissingProviderGroupPolicyFallbackOnce)({
    providerMissingFallbackApplied,
    providerKey: "nextcloud-talk",
    accountId: account.accountId,
    blockedLabel: import_nextcloud_talk6.GROUP_POLICY_BLOCKED_LABEL.room,
    log: (message2) => runtime.log?.(message2)
  });
  const configAllowFrom = normalizeNextcloudTalkAllowlist(account.config.allowFrom);
  const configGroupAllowFrom = normalizeNextcloudTalkAllowlist(account.config.groupAllowFrom);
  const storeAllowFrom = await (0, import_nextcloud_talk6.readStoreAllowFromForDmPolicy)({
    provider: CHANNEL_ID,
    accountId: account.accountId,
    dmPolicy: dmPolicy2,
    readStore: pairing.readStoreForDmPolicy
  });
  const storeAllowList = normalizeNextcloudTalkAllowlist(storeAllowFrom);
  const roomMatch = resolveNextcloudTalkRoomMatch({
    rooms: account.config.rooms,
    roomToken,
    roomName
  });
  const roomConfig = roomMatch.roomConfig;
  if (isGroup && !roomMatch.allowed) {
    runtime.log?.(`nextcloud-talk: drop room ${roomToken} (not allowlisted)`);
    return;
  }
  if (roomConfig?.enabled === false) {
    runtime.log?.(`nextcloud-talk: drop room ${roomToken} (disabled)`);
    return;
  }
  const roomAllowFrom = normalizeNextcloudTalkAllowlist(roomConfig?.allowFrom);
  const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
    cfg: config,
    surface: CHANNEL_ID
  });
  const useAccessGroups = config.commands?.useAccessGroups !== false;
  const hasControlCommand = core.channel.text.hasControlCommand(rawBody, config);
  const access = (0, import_nextcloud_talk6.resolveDmGroupAccessWithCommandGate)({
    isGroup,
    dmPolicy: dmPolicy2,
    groupPolicy,
    allowFrom: configAllowFrom,
    groupAllowFrom: configGroupAllowFrom,
    storeAllowFrom: storeAllowList,
    isSenderAllowed: (allowFrom) => resolveNextcloudTalkAllowlistMatch({
      allowFrom,
      senderId
    }).allowed,
    command: {
      useAccessGroups,
      allowTextCommands,
      hasControlCommand
    }
  });
  const commandAuthorized = access.commandAuthorized;
  const effectiveGroupAllowFrom = access.effectiveGroupAllowFrom;
  if (isGroup) {
    if (access.decision !== "allow") {
      runtime.log?.(`nextcloud-talk: drop group sender ${senderId} (reason=${access.reason})`);
      return;
    }
    const groupAllow = resolveNextcloudTalkGroupAllow({
      groupPolicy,
      outerAllowFrom: effectiveGroupAllowFrom,
      innerAllowFrom: roomAllowFrom,
      senderId
    });
    if (!groupAllow.allowed) {
      runtime.log?.(`nextcloud-talk: drop group sender ${senderId} (policy=${groupPolicy})`);
      return;
    }
  } else {
    if (access.decision !== "allow") {
      if (access.decision === "pairing") {
        await (0, import_nextcloud_talk6.issuePairingChallenge)({
          channel: CHANNEL_ID,
          senderId,
          senderIdLine: `Your Nextcloud user id: ${senderId}`,
          meta: { name: senderName || void 0 },
          upsertPairingRequest: pairing.upsertPairingRequest,
          sendPairingReply: async (text) => {
            await sendMessageNextcloudTalk(roomToken, text, { accountId: account.accountId });
            statusSink?.({ lastOutboundAt: Date.now() });
          },
          onReplyError: (err) => {
            runtime.error?.(`nextcloud-talk: pairing reply failed for ${senderId}: ${String(err)}`);
          }
        });
      }
      runtime.log?.(`nextcloud-talk: drop DM sender ${senderId} (reason=${access.reason})`);
      return;
    }
  }
  if (access.shouldBlockControlCommand) {
    (0, import_nextcloud_talk6.logInboundDrop)({
      log: (message2) => runtime.log?.(message2),
      channel: CHANNEL_ID,
      reason: "control command (unauthorized)",
      target: senderId
    });
    return;
  }
  const mentionRegexes = core.channel.mentions.buildMentionRegexes(config);
  const wasMentioned = mentionRegexes.length ? core.channel.mentions.matchesMentionPatterns(rawBody, mentionRegexes) : false;
  const shouldRequireMention = isGroup ? resolveNextcloudTalkRequireMention({
    roomConfig,
    wildcardConfig: roomMatch.wildcardConfig
  }) : false;
  const mentionGate = resolveNextcloudTalkMentionGate({
    isGroup,
    requireMention: shouldRequireMention,
    wasMentioned,
    allowTextCommands,
    hasControlCommand,
    commandAuthorized
  });
  if (isGroup && mentionGate.shouldSkip) {
    runtime.log?.(`nextcloud-talk: drop room ${roomToken} (no mention)`);
    return;
  }
  const route = core.channel.routing.resolveAgentRoute({
    cfg: config,
    channel: CHANNEL_ID,
    accountId: account.accountId,
    peer: {
      kind: isGroup ? "group" : "direct",
      id: isGroup ? roomToken : senderId
    }
  });
  const fromLabel = isGroup ? `room:${roomName || roomToken}` : senderName || `user:${senderId}`;
  const storePath = core.channel.session.resolveStorePath(
    config.session?.store,
    {
      agentId: route.agentId
    }
  );
  const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(config);
  const previousTimestamp = core.channel.session.readSessionUpdatedAt({
    storePath,
    sessionKey: route.sessionKey
  });
  const body = core.channel.reply.formatAgentEnvelope({
    channel: "Nextcloud Talk",
    from: fromLabel,
    timestamp: message.timestamp,
    previousTimestamp,
    envelope: envelopeOptions,
    body: rawBody
  });
  const groupSystemPrompt = roomConfig?.systemPrompt?.trim() || void 0;
  const ctxPayload = core.channel.reply.finalizeInboundContext({
    Body: body,
    BodyForAgent: rawBody,
    RawBody: rawBody,
    CommandBody: rawBody,
    From: isGroup ? `nextcloud-talk:room:${roomToken}` : `nextcloud-talk:${senderId}`,
    To: `nextcloud-talk:${roomToken}`,
    SessionKey: route.sessionKey,
    AccountId: route.accountId,
    ChatType: isGroup ? "group" : "direct",
    ConversationLabel: fromLabel,
    SenderName: senderName || void 0,
    SenderId: senderId,
    GroupSubject: isGroup ? roomName || roomToken : void 0,
    GroupSystemPrompt: isGroup ? groupSystemPrompt : void 0,
    Provider: CHANNEL_ID,
    Surface: CHANNEL_ID,
    WasMentioned: isGroup ? wasMentioned : void 0,
    MessageSid: message.messageId,
    Timestamp: message.timestamp,
    OriginatingChannel: CHANNEL_ID,
    OriginatingTo: `nextcloud-talk:${roomToken}`,
    CommandAuthorized: commandAuthorized
  });
  await (0, import_nextcloud_talk6.dispatchInboundReplyWithBase)({
    cfg: config,
    channel: CHANNEL_ID,
    accountId: account.accountId,
    route,
    storePath,
    ctxPayload,
    core,
    deliver: async (payload) => {
      await deliverNextcloudTalkReply({
        payload,
        roomToken,
        accountId: account.accountId,
        statusSink
      });
    },
    onRecordError: (err) => {
      runtime.error?.(`nextcloud-talk: failed updating session meta: ${String(err)}`);
    },
    onDispatchError: (err, info) => {
      runtime.error?.(`nextcloud-talk ${info.kind} reply failed: ${String(err)}`);
    },
    replyOptions: {
      skillFilter: roomConfig?.skills,
      disableBlockStreaming: typeof account.config.blockStreaming === "boolean" ? !account.config.blockStreaming : void 0
    }
  });
}

// src/core/extensions/nextcloud-talk/src/replay-guard.ts
var import_node_path = __toESM(require("node:path"), 1);
var import_nextcloud_talk7 = require("src/core/source/plugin-sdk/nextcloud-talk");
var DEFAULT_REPLAY_TTL_MS = 24 * 60 * 60 * 1e3;
var DEFAULT_MEMORY_MAX_SIZE = 1e3;
var DEFAULT_FILE_MAX_ENTRIES = 1e4;
function sanitizeSegment(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "default";
  }
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, "_");
}
function buildReplayKey(params) {
  const roomToken = params.roomToken.trim();
  const messageId = params.messageId.trim();
  if (!roomToken || !messageId) {
    return null;
  }
  return `${roomToken}:${messageId}`;
}
function createNextcloudTalkReplayGuard(options) {
  const stateDir = options.stateDir.trim();
  const persistentDedupe = (0, import_nextcloud_talk7.createPersistentDedupe)({
    ttlMs: options.ttlMs ?? DEFAULT_REPLAY_TTL_MS,
    memoryMaxSize: options.memoryMaxSize ?? DEFAULT_MEMORY_MAX_SIZE,
    fileMaxEntries: options.fileMaxEntries ?? DEFAULT_FILE_MAX_ENTRIES,
    resolveFilePath: (namespace) => import_node_path.default.join(stateDir, "nextcloud-talk", "replay-dedupe", `${sanitizeSegment(namespace)}.json`)
  });
  return {
    shouldProcessMessage: async ({ accountId, roomToken, messageId }) => {
      const replayKey = buildReplayKey({ roomToken, messageId });
      if (!replayKey) {
        return true;
      }
      return await persistentDedupe.checkAndRecord(replayKey, {
        namespace: accountId,
        onDiskError: options.onDiskError
      });
    }
  };
}

// src/core/extensions/nextcloud-talk/src/monitor.ts
var DEFAULT_WEBHOOK_PORT = 8788;
var DEFAULT_WEBHOOK_HOST = "0.0.0.0";
var DEFAULT_WEBHOOK_PATH = "/nextcloud-talk-webhook";
var DEFAULT_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;
var DEFAULT_WEBHOOK_BODY_TIMEOUT_MS = 3e4;
var HEALTH_PATH = "/healthz";
var WEBHOOK_ERRORS = {
  missingSignatureHeaders: "Missing signature headers",
  invalidBackend: "Invalid backend",
  invalidSignature: "Invalid signature",
  invalidPayloadFormat: "Invalid payload format",
  payloadTooLarge: "Payload too large",
  internalServerError: "Internal server error"
};
function formatError(err) {
  if (err instanceof Error) {
    return err.message;
  }
  return typeof err === "string" ? err : JSON.stringify(err);
}
function normalizeOrigin(value) {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}
function parseWebhookPayload(body) {
  try {
    const data = JSON.parse(body);
    if (!data.type || !data.actor?.type || !data.actor?.id || !data.object?.type || !data.object?.id || !data.target?.type || !data.target?.id) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function writeJsonResponse(res, status, body) {
  if (body) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
    return;
  }
  res.writeHead(status);
  res.end();
}
function writeWebhookError(res, status, error) {
  if (res.headersSent) {
    return;
  }
  writeJsonResponse(res, status, { error });
}
function validateWebhookHeaders(params) {
  const headers = extractNextcloudTalkHeaders(
    params.req.headers
  );
  if (!headers) {
    writeWebhookError(params.res, 400, WEBHOOK_ERRORS.missingSignatureHeaders);
    return null;
  }
  if (params.isBackendAllowed && !params.isBackendAllowed(headers.backend)) {
    writeWebhookError(params.res, 401, WEBHOOK_ERRORS.invalidBackend);
    return null;
  }
  return headers;
}
function verifyWebhookSignature(params) {
  const isValid = verifyNextcloudTalkSignature({
    signature: params.headers.signature,
    random: params.headers.random,
    body: params.body,
    secret: params.secret
  });
  if (!isValid) {
    writeWebhookError(params.res, 401, WEBHOOK_ERRORS.invalidSignature);
    return false;
  }
  return true;
}
function decodeWebhookCreateMessage(params) {
  const payload = parseWebhookPayload(params.body);
  if (!payload) {
    writeWebhookError(params.res, 400, WEBHOOK_ERRORS.invalidPayloadFormat);
    return { kind: "invalid" };
  }
  if (payload.type !== "Create") {
    return { kind: "ignore" };
  }
  return { kind: "message", message: payloadToInboundMessage(payload) };
}
function payloadToInboundMessage(payload) {
  const isGroupChat = true;
  return {
    messageId: String(payload.object.id),
    roomToken: payload.target.id,
    roomName: payload.target.name,
    senderId: payload.actor.id,
    senderName: payload.actor.name ?? "",
    text: payload.object.content || payload.object.name || "",
    mediaType: payload.object.mediaType || "text/plain",
    timestamp: Date.now(),
    isGroupChat
  };
}
function readNextcloudTalkWebhookBody(req, maxBodyBytes) {
  return (0, import_nextcloud_talk8.readRequestBodyWithLimit)(req, {
    maxBytes: maxBodyBytes,
    timeoutMs: DEFAULT_WEBHOOK_BODY_TIMEOUT_MS
  });
}
function createNextcloudTalkWebhookServer(opts) {
  const { port, host, path: path2, secret, onMessage, onError, abortSignal } = opts;
  const maxBodyBytes = typeof opts.maxBodyBytes === "number" && Number.isFinite(opts.maxBodyBytes) && opts.maxBodyBytes > 0 ? Math.floor(opts.maxBodyBytes) : DEFAULT_WEBHOOK_MAX_BODY_BYTES;
  const readBody = opts.readBody ?? readNextcloudTalkWebhookBody;
  const isBackendAllowed = opts.isBackendAllowed;
  const shouldProcessMessage = opts.shouldProcessMessage;
  const server = (0, import_node_http.createServer)(async (req, res) => {
    if (req.url === HEALTH_PATH) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    if (req.url !== path2 || req.method !== "POST") {
      res.writeHead(404);
      res.end();
      return;
    }
    try {
      const headers = validateWebhookHeaders({
        req,
        res,
        isBackendAllowed
      });
      if (!headers) {
        return;
      }
      const body = await readBody(req, maxBodyBytes);
      const hasValidSignature = verifyWebhookSignature({
        headers,
        body,
        secret,
        res
      });
      if (!hasValidSignature) {
        return;
      }
      const decoded = decodeWebhookCreateMessage({
        body,
        res
      });
      if (decoded.kind === "invalid") {
        return;
      }
      if (decoded.kind === "ignore") {
        writeJsonResponse(res, 200);
        return;
      }
      const message = decoded.message;
      if (shouldProcessMessage) {
        const shouldProcess = await shouldProcessMessage(message);
        if (!shouldProcess) {
          writeJsonResponse(res, 200);
          return;
        }
      }
      writeJsonResponse(res, 200);
      try {
        await onMessage(message);
      } catch (err) {
        onError?.(err instanceof Error ? err : new Error(formatError(err)));
      }
    } catch (err) {
      if ((0, import_nextcloud_talk8.isRequestBodyLimitError)(err, "PAYLOAD_TOO_LARGE")) {
        writeWebhookError(res, 413, WEBHOOK_ERRORS.payloadTooLarge);
        return;
      }
      if ((0, import_nextcloud_talk8.isRequestBodyLimitError)(err, "REQUEST_BODY_TIMEOUT")) {
        writeWebhookError(res, 408, (0, import_nextcloud_talk8.requestBodyErrorToText)("REQUEST_BODY_TIMEOUT"));
        return;
      }
      const error = err instanceof Error ? err : new Error(formatError(err));
      onError?.(error);
      writeWebhookError(res, 500, WEBHOOK_ERRORS.internalServerError);
    }
  });
  const start = () => {
    return new Promise((resolve) => {
      server.listen(port, host, () => resolve());
    });
  };
  let stopped = false;
  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    try {
      server.close();
    } catch {
    }
  };
  if (abortSignal) {
    if (abortSignal.aborted) {
      stop();
    } else {
      abortSignal.addEventListener("abort", stop, { once: true });
    }
  }
  return { server, start, stop };
}
async function monitorNextcloudTalkProvider(opts) {
  const core = getNextcloudTalkRuntime();
  const cfg = opts.config ?? core.config.loadConfig();
  const account = resolveNextcloudTalkAccount({
    cfg,
    accountId: opts.accountId
  });
  const runtime = opts.runtime ?? (0, import_nextcloud_talk8.createLoggerBackedRuntime)({
    logger: core.logging.getChildLogger(),
    exitError: () => new Error("Runtime exit not available")
  });
  if (!account.secret) {
    throw new Error(`Nextcloud Talk bot secret not configured for account "${account.accountId}"`);
  }
  const port = account.config.webhookPort ?? DEFAULT_WEBHOOK_PORT;
  const host = account.config.webhookHost ?? DEFAULT_WEBHOOK_HOST;
  const path2 = account.config.webhookPath ?? DEFAULT_WEBHOOK_PATH;
  const logger = core.logging.getChildLogger({
    channel: "nextcloud-talk",
    accountId: account.accountId
  });
  const expectedBackendOrigin = normalizeOrigin(account.baseUrl);
  const replayGuard = createNextcloudTalkReplayGuard({
    stateDir: core.state.resolveStateDir(process.env, import_node_os.default.homedir),
    onDiskError: (error) => {
      logger.warn(
        `[nextcloud-talk:${account.accountId}] replay guard disk error: ${String(error)}`
      );
    }
  });
  const { start, stop } = createNextcloudTalkWebhookServer({
    port,
    host,
    path: path2,
    secret: account.secret,
    isBackendAllowed: (backend) => {
      if (!expectedBackendOrigin) {
        return true;
      }
      const backendOrigin = normalizeOrigin(backend);
      return backendOrigin === expectedBackendOrigin;
    },
    shouldProcessMessage: async (message) => {
      const shouldProcess = await replayGuard.shouldProcessMessage({
        accountId: account.accountId,
        roomToken: message.roomToken,
        messageId: message.messageId
      });
      if (!shouldProcess) {
        logger.warn(
          `[nextcloud-talk:${account.accountId}] replayed webhook ignored room=${message.roomToken} messageId=${message.messageId}`
        );
      }
      return shouldProcess;
    },
    onMessage: async (message) => {
      core.channel.activity.record({
        channel: "nextcloud-talk",
        accountId: account.accountId,
        direction: "inbound",
        at: message.timestamp
      });
      if (opts.onMessage) {
        await opts.onMessage(message);
        return;
      }
      await handleNextcloudTalkInbound({
        message,
        account,
        config: cfg,
        runtime,
        statusSink: opts.statusSink
      });
    },
    onError: (error) => {
      logger.error(`[nextcloud-talk:${account.accountId}] webhook error: ${error.message}`);
    },
    abortSignal: opts.abortSignal
  });
  if (opts.abortSignal?.aborted) {
    return { stop };
  }
  await start();
  if (opts.abortSignal?.aborted) {
    stop();
    return { stop };
  }
  const publicUrl = account.config.webhookPublicUrl ?? `http://${host === "0.0.0.0" ? "localhost" : host}:${port}${path2}`;
  logger.info(`[nextcloud-talk:${account.accountId}] webhook listening on ${publicUrl}`);
  return { stop };
}

// src/core/extensions/nextcloud-talk/src/normalize.ts
function normalizeNextcloudTalkMessagingTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return void 0;
  }
  let normalized = trimmed;
  if (normalized.startsWith("nextcloud-talk:")) {
    normalized = normalized.slice("nextcloud-talk:".length).trim();
  } else if (normalized.startsWith("nc-talk:")) {
    normalized = normalized.slice("nc-talk:".length).trim();
  } else if (normalized.startsWith("nc:")) {
    normalized = normalized.slice("nc:".length).trim();
  }
  if (normalized.startsWith("room:")) {
    normalized = normalized.slice("room:".length).trim();
  }
  if (!normalized) {
    return void 0;
  }
  return `nextcloud-talk:${normalized}`.toLowerCase();
}
function looksLikeNextcloudTalkTargetId(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (/^(nextcloud-talk|nc-talk|nc):/i.test(trimmed)) {
    return true;
  }
  return /^[a-z0-9]{8,}$/i.test(trimmed);
}

// src/core/extensions/nextcloud-talk/src/onboarding.ts
var import_nextcloud_talk9 = require("src/core/source/plugin-sdk/nextcloud-talk");
var channel = "nextcloud-talk";
function setNextcloudTalkDmPolicy(cfg, dmPolicy2) {
  return (0, import_nextcloud_talk9.setTopLevelChannelDmPolicyWithAllowFrom)({
    cfg,
    channel: "nextcloud-talk",
    dmPolicy: dmPolicy2,
    getAllowFrom: (inputCfg) => (0, import_nextcloud_talk9.mapAllowFromEntries)(inputCfg.channels?.["nextcloud-talk"]?.allowFrom)
  });
}
function setNextcloudTalkAccountConfig(cfg, accountId, updates) {
  return (0, import_nextcloud_talk9.patchScopedAccountConfig)({
    cfg,
    channelKey: channel,
    accountId,
    patch: updates
  });
}
async function noteNextcloudTalkSecretHelp(prompter) {
  await prompter.note(
    [
      "1) SSH into your Nextcloud server",
      '2) Run: ./occ talk:bot:install "Must-b" "<shared-secret>" "<webhook-url>" --feature reaction',
      "3) Copy the shared secret you used in the command",
      "4) Enable the bot in your Nextcloud Talk room settings",
      "Tip: you can also set NEXTCLOUD_TALK_BOT_SECRET in your env.",
      `Docs: ${(0, import_nextcloud_talk9.formatDocsLink)("/channels/nextcloud-talk", "channels/nextcloud-talk")}`
    ].join("\n"),
    "Nextcloud Talk bot setup"
  );
}
async function noteNextcloudTalkUserIdHelp(prompter) {
  await prompter.note(
    [
      "1) Check the Nextcloud admin panel for user IDs",
      "2) Or look at the webhook payload logs when someone messages",
      "3) User IDs are typically lowercase usernames in Nextcloud",
      `Docs: ${(0, import_nextcloud_talk9.formatDocsLink)("/channels/nextcloud-talk", "channels/nextcloud-talk")}`
    ].join("\n"),
    "Nextcloud Talk user id"
  );
}
async function promptNextcloudTalkAllowFrom(params) {
  const { cfg, prompter, accountId } = params;
  const resolved = resolveNextcloudTalkAccount({ cfg, accountId });
  const existingAllowFrom = resolved.config.allowFrom ?? [];
  await noteNextcloudTalkUserIdHelp(prompter);
  const parseInput = (value) => value.split(/[\n,;]+/g).map((entry) => entry.trim().toLowerCase()).filter(Boolean);
  let resolvedIds = [];
  while (resolvedIds.length === 0) {
    const entry = await prompter.text({
      message: "Nextcloud Talk allowFrom (user id)",
      placeholder: "username",
      initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : void 0,
      validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
    });
    resolvedIds = parseInput(String(entry));
    if (resolvedIds.length === 0) {
      await prompter.note("Please enter at least one valid user ID.", "Nextcloud Talk allowlist");
    }
  }
  const merged = [
    ...existingAllowFrom.map((item) => String(item).trim().toLowerCase()).filter(Boolean),
    ...resolvedIds
  ];
  const unique = (0, import_nextcloud_talk9.mergeAllowFromEntries)(void 0, merged);
  return setNextcloudTalkAccountConfig(cfg, accountId, {
    dmPolicy: "allowlist",
    allowFrom: unique
  });
}
async function promptNextcloudTalkAllowFromForAccount(params) {
  const accountId = params.accountId && (0, import_nextcloud_talk9.normalizeAccountId)(params.accountId) ? (0, import_nextcloud_talk9.normalizeAccountId)(params.accountId) ?? import_nextcloud_talk9.DEFAULT_ACCOUNT_ID : resolveDefaultNextcloudTalkAccountId(params.cfg);
  return promptNextcloudTalkAllowFrom({
    cfg: params.cfg,
    prompter: params.prompter,
    accountId
  });
}
var dmPolicy = {
  label: "Nextcloud Talk",
  channel,
  policyKey: "channels.nextcloud-talk.dmPolicy",
  allowFromKey: "channels.nextcloud-talk.allowFrom",
  getCurrent: (cfg) => cfg.channels?.["nextcloud-talk"]?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setNextcloudTalkDmPolicy(cfg, policy),
  promptAllowFrom: promptNextcloudTalkAllowFromForAccount
};
var nextcloudTalkOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const configured = listNextcloudTalkAccountIds(cfg).some((accountId) => {
      const account = resolveNextcloudTalkAccount({ cfg, accountId });
      return Boolean(account.secret && account.baseUrl);
    });
    return {
      channel,
      configured,
      statusLines: [`Nextcloud Talk: ${configured ? "configured" : "needs setup"}`],
      selectionHint: configured ? "configured" : "self-hosted chat",
      quickstartScore: configured ? 1 : 5
    };
  },
  configure: async ({
    cfg,
    prompter,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom
  }) => {
    const defaultAccountId = resolveDefaultNextcloudTalkAccountId(cfg);
    const accountId = await (0, import_nextcloud_talk9.resolveAccountIdForConfigure)({
      cfg,
      prompter,
      label: "Nextcloud Talk",
      accountOverride: accountOverrides["nextcloud-talk"],
      shouldPromptAccountIds,
      listAccountIds: listNextcloudTalkAccountIds,
      defaultAccountId
    });
    let next = cfg;
    const resolvedAccount = resolveNextcloudTalkAccount({
      cfg: next,
      accountId
    });
    const accountConfigured = Boolean(resolvedAccount.secret && resolvedAccount.baseUrl);
    const allowEnv = accountId === import_nextcloud_talk9.DEFAULT_ACCOUNT_ID;
    const hasConfigSecret = Boolean(
      (0, import_nextcloud_talk9.hasConfiguredSecretInput)(resolvedAccount.config.botSecret) || resolvedAccount.config.botSecretFile
    );
    let baseUrl = resolvedAccount.baseUrl;
    if (!baseUrl) {
      baseUrl = String(
        await prompter.text({
          message: "Enter Nextcloud instance URL (e.g., https://cloud.example.com)",
          validate: (value) => {
            const v = String(value ?? "").trim();
            if (!v) {
              return "Required";
            }
            if (!v.startsWith("http://") && !v.startsWith("https://")) {
              return "URL must start with http:// or https://";
            }
            return void 0;
          }
        })
      ).trim();
    }
    const secretStep = await (0, import_nextcloud_talk9.runSingleChannelSecretStep)({
      cfg: next,
      prompter,
      providerHint: "nextcloud-talk",
      credentialLabel: "bot secret",
      accountConfigured,
      hasConfigToken: hasConfigSecret,
      allowEnv,
      envValue: process.env.NEXTCLOUD_TALK_BOT_SECRET,
      envPrompt: "NEXTCLOUD_TALK_BOT_SECRET detected. Use env var?",
      keepPrompt: "Nextcloud Talk bot secret already configured. Keep it?",
      inputPrompt: "Enter Nextcloud Talk bot secret",
      preferredEnvVar: "NEXTCLOUD_TALK_BOT_SECRET",
      onMissingConfigured: async () => await noteNextcloudTalkSecretHelp(prompter),
      applyUseEnv: async (cfg2) => setNextcloudTalkAccountConfig(cfg2, accountId, {
        baseUrl
      }),
      applySet: async (cfg2, value) => setNextcloudTalkAccountConfig(cfg2, accountId, {
        baseUrl,
        botSecret: value
      })
    });
    next = secretStep.cfg;
    if (secretStep.action === "keep" && baseUrl !== resolvedAccount.baseUrl) {
      next = setNextcloudTalkAccountConfig(next, accountId, {
        baseUrl
      });
    }
    const existingApiUser = resolvedAccount.config.apiUser?.trim();
    const existingApiPasswordConfigured = Boolean(
      (0, import_nextcloud_talk9.hasConfiguredSecretInput)(resolvedAccount.config.apiPassword) || resolvedAccount.config.apiPasswordFile
    );
    const configureApiCredentials = await prompter.confirm({
      message: "Configure optional Nextcloud Talk API credentials for room lookups?",
      initialValue: Boolean(existingApiUser && existingApiPasswordConfigured)
    });
    if (configureApiCredentials) {
      const apiUser = String(
        await prompter.text({
          message: "Nextcloud Talk API user",
          initialValue: existingApiUser,
          validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
        })
      ).trim();
      const apiPasswordStep = await (0, import_nextcloud_talk9.runSingleChannelSecretStep)({
        cfg: next,
        prompter,
        providerHint: "nextcloud-talk-api",
        credentialLabel: "API password",
        accountConfigured: Boolean(existingApiUser && existingApiPasswordConfigured),
        hasConfigToken: existingApiPasswordConfigured,
        allowEnv: false,
        envPrompt: "",
        keepPrompt: "Nextcloud Talk API password already configured. Keep it?",
        inputPrompt: "Enter Nextcloud Talk API password",
        preferredEnvVar: "NEXTCLOUD_TALK_API_PASSWORD",
        applySet: async (cfg2, value) => setNextcloudTalkAccountConfig(cfg2, accountId, {
          apiUser,
          apiPassword: value
        })
      });
      next = apiPasswordStep.action === "keep" ? setNextcloudTalkAccountConfig(next, accountId, { apiUser }) : apiPasswordStep.cfg;
    }
    if (forceAllowFrom) {
      next = await promptNextcloudTalkAllowFrom({
        cfg: next,
        prompter,
        accountId
      });
    }
    return { cfg: next, accountId };
  },
  dmPolicy,
  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      "nextcloud-talk": { ...cfg.channels?.["nextcloud-talk"], enabled: false }
    }
  })
};

// src/core/extensions/nextcloud-talk/src/channel.ts
var meta = {
  id: "nextcloud-talk",
  label: "Nextcloud Talk",
  selectionLabel: "Nextcloud Talk (self-hosted)",
  docsPath: "/channels/nextcloud-talk",
  docsLabel: "nextcloud-talk",
  blurb: "Self-hosted chat via Nextcloud Talk webhook bots.",
  aliases: ["nc-talk", "nc"],
  order: 65,
  quickstartAllowFrom: true
};
var nextcloudTalkPlugin = {
  id: "nextcloud-talk",
  meta,
  onboarding: nextcloudTalkOnboardingAdapter,
  pairing: {
    idLabel: "nextcloudUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(nextcloud-talk|nc-talk|nc):/i, "").toLowerCase(),
    notifyApproval: async ({ id }) => {
      console.log(`[nextcloud-talk] User ${id} approved for pairing`);
    }
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    reactions: true,
    threads: false,
    media: true,
    nativeCommands: false,
    blockStreaming: true
  },
  reload: { configPrefixes: ["channels.nextcloud-talk"] },
  configSchema: (0, import_nextcloud_talk10.buildChannelConfigSchema)(NextcloudTalkConfigSchema),
  config: {
    listAccountIds: (cfg) => listNextcloudTalkAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveNextcloudTalkAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultNextcloudTalkAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => (0, import_nextcloud_talk10.setAccountEnabledInConfigSection)({
      cfg,
      sectionKey: "nextcloud-talk",
      accountId,
      enabled,
      allowTopLevel: true
    }),
    deleteAccount: ({ cfg, accountId }) => (0, import_nextcloud_talk10.deleteAccountFromConfigSection)({
      cfg,
      sectionKey: "nextcloud-talk",
      accountId,
      clearBaseFields: ["botSecret", "botSecretFile", "baseUrl", "name"]
    }),
    isConfigured: (account) => Boolean(account.secret?.trim() && account.baseUrl?.trim()),
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.secret?.trim() && account.baseUrl?.trim()),
      secretSource: account.secretSource,
      baseUrl: account.baseUrl ? "[set]" : "[missing]"
    }),
    resolveAllowFrom: ({ cfg, accountId }) => (0, import_compat2.mapAllowFromEntries)(
      resolveNextcloudTalkAccount({ cfg, accountId }).config.allowFrom
    ).map((entry) => entry.toLowerCase()),
    formatAllowFrom: ({ allowFrom }) => (0, import_compat2.formatAllowFromLowercase)({
      allowFrom,
      stripPrefixRe: /^(nextcloud-talk|nc-talk|nc):/i
    })
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat2.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "nextcloud-talk",
        accountId,
        fallbackAccountId: account.accountId ?? import_nextcloud_talk10.DEFAULT_ACCOUNT_ID,
        policy: account.config.dmPolicy,
        allowFrom: account.config.allowFrom ?? [],
        policyPathSuffix: "dmPolicy",
        normalizeEntry: (raw) => raw.replace(/^(nextcloud-talk|nc-talk|nc):/i, "").toLowerCase()
      });
    },
    collectWarnings: ({ account, cfg }) => {
      const roomAllowlistConfigured = account.config.rooms && Object.keys(account.config.rooms).length > 0;
      return (0, import_compat2.collectAllowlistProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.["nextcloud-talk"] !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        collect: (groupPolicy) => (0, import_compat2.collectOpenGroupPolicyRouteAllowlistWarnings)({
          groupPolicy,
          routeAllowlistConfigured: Boolean(roomAllowlistConfigured),
          restrictSenders: {
            surface: "Nextcloud Talk rooms",
            openScope: "any member in allowed rooms",
            groupPolicyPath: "channels.nextcloud-talk.groupPolicy",
            groupAllowFromPath: "channels.nextcloud-talk.groupAllowFrom"
          },
          noRouteAllowlist: {
            surface: "Nextcloud Talk rooms",
            routeAllowlistPath: "channels.nextcloud-talk.rooms",
            routeScope: "room",
            groupPolicyPath: "channels.nextcloud-talk.groupPolicy",
            groupAllowFromPath: "channels.nextcloud-talk.groupAllowFrom"
          }
        })
      });
    }
  },
  groups: {
    resolveRequireMention: ({ cfg, accountId, groupId }) => {
      const account = resolveNextcloudTalkAccount({ cfg, accountId });
      const rooms = account.config.rooms;
      if (!rooms || !groupId) {
        return true;
      }
      const roomConfig = rooms[groupId];
      if (roomConfig?.requireMention !== void 0) {
        return roomConfig.requireMention;
      }
      const wildcardConfig = rooms["*"];
      if (wildcardConfig?.requireMention !== void 0) {
        return wildcardConfig.requireMention;
      }
      return true;
    },
    resolveToolPolicy: resolveNextcloudTalkGroupToolPolicy
  },
  messaging: {
    normalizeTarget: normalizeNextcloudTalkMessagingTarget,
    targetResolver: {
      looksLikeId: looksLikeNextcloudTalkTargetId,
      hint: "<roomToken>"
    }
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_nextcloud_talk10.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_nextcloud_talk10.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "nextcloud-talk",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      const setupInput = input;
      if (setupInput.useEnv && accountId !== import_nextcloud_talk10.DEFAULT_ACCOUNT_ID) {
        return "NEXTCLOUD_TALK_BOT_SECRET can only be used for the default account.";
      }
      if (!setupInput.useEnv && !setupInput.secret && !setupInput.secretFile) {
        return "Nextcloud Talk requires bot secret or --secret-file (or --use-env).";
      }
      if (!setupInput.baseUrl) {
        return "Nextcloud Talk requires --base-url.";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const setupInput = input;
      const namedConfig = (0, import_nextcloud_talk10.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "nextcloud-talk",
        accountId,
        name: setupInput.name
      });
      if (accountId === import_nextcloud_talk10.DEFAULT_ACCOUNT_ID) {
        return {
          ...namedConfig,
          channels: {
            ...namedConfig.channels,
            "nextcloud-talk": {
              ...namedConfig.channels?.["nextcloud-talk"],
              enabled: true,
              baseUrl: setupInput.baseUrl,
              ...setupInput.useEnv ? {} : setupInput.secretFile ? { botSecretFile: setupInput.secretFile } : setupInput.secret ? { botSecret: setupInput.secret } : {}
            }
          }
        };
      }
      return {
        ...namedConfig,
        channels: {
          ...namedConfig.channels,
          "nextcloud-talk": {
            ...namedConfig.channels?.["nextcloud-talk"],
            enabled: true,
            accounts: {
              ...namedConfig.channels?.["nextcloud-talk"]?.accounts,
              [accountId]: {
                ...namedConfig.channels?.["nextcloud-talk"]?.accounts?.[accountId],
                enabled: true,
                baseUrl: setupInput.baseUrl,
                ...setupInput.secretFile ? { botSecretFile: setupInput.secretFile } : setupInput.secret ? { botSecret: setupInput.secret } : {}
              }
            }
          }
        }
      };
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getNextcloudTalkRuntime().channel.text.chunkMarkdownText(text, limit),
    chunkerMode: "markdown",
    textChunkLimit: 4e3,
    sendText: async ({ cfg, to, text, accountId, replyToId }) => {
      const result = await sendMessageNextcloudTalk(to, text, {
        accountId: accountId ?? void 0,
        replyTo: replyToId ?? void 0,
        cfg
      });
      return { channel: "nextcloud-talk", ...result };
    },
    sendMedia: async ({ cfg, to, text, mediaUrl, accountId, replyToId }) => {
      const messageWithMedia = mediaUrl ? `${text}

Attachment: ${mediaUrl}` : text;
      const result = await sendMessageNextcloudTalk(to, messageWithMedia, {
        accountId: accountId ?? void 0,
        replyTo: replyToId ?? void 0,
        cfg
      });
      return { channel: "nextcloud-talk", ...result };
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_nextcloud_talk10.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    buildChannelSummary: ({ snapshot }) => {
      const base = (0, import_nextcloud_talk10.buildBaseChannelStatusSummary)(snapshot);
      return {
        configured: base.configured,
        secretSource: snapshot.secretSource ?? "none",
        running: base.running,
        mode: "webhook",
        lastStartAt: base.lastStartAt,
        lastStopAt: base.lastStopAt,
        lastError: base.lastError
      };
    },
    buildAccountSnapshot: ({ account, runtime }) => {
      const configured = Boolean(account.secret?.trim() && account.baseUrl?.trim());
      const runtimeSnapshot = (0, import_nextcloud_talk10.buildRuntimeAccountStatusSnapshot)({ runtime });
      return {
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured,
        secretSource: account.secretSource,
        baseUrl: account.baseUrl ? "[set]" : "[missing]",
        running: runtimeSnapshot.running,
        lastStartAt: runtimeSnapshot.lastStartAt,
        lastStopAt: runtimeSnapshot.lastStopAt,
        lastError: runtimeSnapshot.lastError,
        mode: "webhook",
        lastInboundAt: runtime?.lastInboundAt ?? null,
        lastOutboundAt: runtime?.lastOutboundAt ?? null
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      if (!account.secret || !account.baseUrl) {
        throw new Error(
          `Nextcloud Talk not configured for account "${account.accountId}" (missing secret or baseUrl)`
        );
      }
      ctx.log?.info(`[${account.accountId}] starting Nextcloud Talk webhook server`);
      const statusSink = (0, import_compat2.createAccountStatusSink)({
        accountId: ctx.accountId,
        setStatus: ctx.setStatus
      });
      await (0, import_compat2.runPassiveAccountLifecycle)({
        abortSignal: ctx.abortSignal,
        start: async () => await monitorNextcloudTalkProvider({
          accountId: account.accountId,
          config: ctx.cfg,
          runtime: ctx.runtime,
          abortSignal: ctx.abortSignal,
          statusSink
        }),
        stop: async (monitor) => {
          monitor.stop();
        }
      });
    },
    logoutAccount: async ({ accountId, cfg }) => {
      const nextCfg = { ...cfg };
      const nextSection = cfg.channels?.["nextcloud-talk"] ? { ...cfg.channels["nextcloud-talk"] } : void 0;
      let cleared = false;
      let changed = false;
      if (nextSection) {
        if (accountId === import_nextcloud_talk10.DEFAULT_ACCOUNT_ID && nextSection.botSecret) {
          delete nextSection.botSecret;
          cleared = true;
          changed = true;
        }
        const accountCleanup = (0, import_nextcloud_talk10.clearAccountEntryFields)({
          accounts: nextSection.accounts,
          accountId,
          fields: ["botSecret"]
        });
        if (accountCleanup.changed) {
          changed = true;
          if (accountCleanup.cleared) {
            cleared = true;
          }
          if (accountCleanup.nextAccounts) {
            nextSection.accounts = accountCleanup.nextAccounts;
          } else {
            delete nextSection.accounts;
          }
        }
      }
      if (changed) {
        if (nextSection && Object.keys(nextSection).length > 0) {
          nextCfg.channels = { ...nextCfg.channels, "nextcloud-talk": nextSection };
        } else {
          const nextChannels = { ...nextCfg.channels };
          delete nextChannels["nextcloud-talk"];
          if (Object.keys(nextChannels).length > 0) {
            nextCfg.channels = nextChannels;
          } else {
            delete nextCfg.channels;
          }
        }
      }
      const resolved = resolveNextcloudTalkAccount({
        cfg: changed ? nextCfg : cfg,
        accountId
      });
      const loggedOut = resolved.secretSource === "none";
      if (changed) {
        await getNextcloudTalkRuntime().config.writeConfigFile(nextCfg);
      }
      return {
        cleared,
        envSecret: Boolean(process.env.NEXTCLOUD_TALK_BOT_SECRET?.trim()),
        loggedOut
      };
    }
  }
};

// src/core/extensions/nextcloud-talk/index.ts
var plugin = {
  id: "nextcloud-talk",
  name: "Nextcloud Talk",
  description: "Nextcloud Talk channel plugin",
  configSchema: (0, import_nextcloud_talk11.emptyPluginConfigSchema)(),
  register(api) {
    setNextcloudTalkRuntime(api.runtime);
    api.registerChannel({ plugin: nextcloudTalkPlugin });
  }
};
var index_default = plugin;
