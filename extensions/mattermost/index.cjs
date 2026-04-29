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

// src/core/extensions/mattermost/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_mattermost16 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/channel.ts
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_mattermost15 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/config-schema.ts
var import_mattermost2 = require("src/core/source/plugin-sdk/mattermost");
var import_zod = require("zod");

// src/core/extensions/mattermost/src/secret-input.ts
var import_mattermost = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/config-schema.ts
var MattermostSlashCommandsSchema = import_zod.z.object({
  /** Enable native slash commands. "auto" resolves to false (opt-in). */
  native: import_zod.z.union([import_zod.z.boolean(), import_zod.z.literal("auto")]).optional(),
  /** Also register skill-based commands. */
  nativeSkills: import_zod.z.union([import_zod.z.boolean(), import_zod.z.literal("auto")]).optional(),
  /** Path for the callback endpoint on the gateway HTTP server. */
  callbackPath: import_zod.z.string().optional(),
  /** Explicit callback URL (e.g. behind reverse proxy). */
  callbackUrl: import_zod.z.string().optional()
}).strict().optional();
var MattermostAccountSchemaBase = import_zod.z.object({
  name: import_zod.z.string().optional(),
  capabilities: import_zod.z.array(import_zod.z.string()).optional(),
  dangerouslyAllowNameMatching: import_zod.z.boolean().optional(),
  markdown: import_mattermost2.MarkdownConfigSchema,
  enabled: import_zod.z.boolean().optional(),
  configWrites: import_zod.z.boolean().optional(),
  botToken: (0, import_mattermost.buildSecretInputSchema)().optional(),
  baseUrl: import_zod.z.string().optional(),
  chatmode: import_zod.z.enum(["oncall", "onmessage", "onchar"]).optional(),
  oncharPrefixes: import_zod.z.array(import_zod.z.string()).optional(),
  requireMention: import_zod.z.boolean().optional(),
  dmPolicy: import_mattermost2.DmPolicySchema.optional().default("pairing"),
  allowFrom: import_zod.z.array(import_zod.z.union([import_zod.z.string(), import_zod.z.number()])).optional(),
  groupAllowFrom: import_zod.z.array(import_zod.z.union([import_zod.z.string(), import_zod.z.number()])).optional(),
  groupPolicy: import_mattermost2.GroupPolicySchema.optional().default("allowlist"),
  textChunkLimit: import_zod.z.number().int().positive().optional(),
  chunkMode: import_zod.z.enum(["length", "newline"]).optional(),
  blockStreaming: import_zod.z.boolean().optional(),
  blockStreamingCoalesce: import_mattermost2.BlockStreamingCoalesceSchema.optional(),
  replyToMode: import_zod.z.enum(["off", "first", "all"]).optional(),
  responsePrefix: import_zod.z.string().optional(),
  actions: import_zod.z.object({
    reactions: import_zod.z.boolean().optional()
  }).optional(),
  commands: MattermostSlashCommandsSchema,
  interactions: import_zod.z.object({
    callbackBaseUrl: import_zod.z.string().optional(),
    allowedSourceIps: import_zod.z.array(import_zod.z.string()).optional()
  }).optional()
}).strict();
var MattermostAccountSchema = MattermostAccountSchemaBase.superRefine((value, ctx) => {
  (0, import_mattermost2.requireOpenAllowFrom)({
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    path: ["allowFrom"],
    message: 'channels.mattermost.dmPolicy="open" requires channels.mattermost.allowFrom to include "*"'
  });
});
var MattermostConfigSchema = MattermostAccountSchemaBase.extend({
  accounts: import_zod.z.record(import_zod.z.string(), MattermostAccountSchema.optional()).optional(),
  defaultAccount: import_zod.z.string().optional()
}).superRefine((value, ctx) => {
  (0, import_mattermost2.requireOpenAllowFrom)({
    policy: value.dmPolicy,
    allowFrom: value.allowFrom,
    ctx,
    path: ["allowFrom"],
    message: 'channels.mattermost.dmPolicy="open" requires channels.mattermost.allowFrom to include "*"'
  });
});

// src/core/extensions/mattermost/src/group-mentions.ts
var import_compat = require("src/core/source/plugin-sdk/compat");

// src/core/extensions/mattermost/src/mattermost/accounts.ts
var import_account_id = require("src/core/source/plugin-sdk/account-id");
var import_mattermost3 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/mattermost/client.ts
function normalizeMattermostBaseUrl(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return void 0;
  }
  const withoutTrailing = trimmed.replace(/\/+$/, "");
  return withoutTrailing.replace(/\/api\/v4$/i, "");
}
function buildMattermostApiUrl(baseUrl, path) {
  const normalized = normalizeMattermostBaseUrl(baseUrl);
  if (!normalized) {
    throw new Error("Mattermost baseUrl is required");
  }
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${normalized}/api/v4${suffix}`;
}
async function readMattermostError(res) {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (data?.message) {
      return data.message;
    }
    return JSON.stringify(data);
  }
  return await res.text();
}
function createMattermostClient(params) {
  const baseUrl = normalizeMattermostBaseUrl(params.baseUrl);
  if (!baseUrl) {
    throw new Error("Mattermost baseUrl is required");
  }
  const apiBaseUrl = `${baseUrl}/api/v4`;
  const token = params.botToken.trim();
  const fetchImpl = params.fetchImpl ?? fetch;
  const request = async (path, init) => {
    const url = buildMattermostApiUrl(baseUrl, path);
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (typeof init?.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetchImpl(url, { ...init, headers });
    if (!res.ok) {
      const detail = await readMattermostError(res);
      throw new Error(
        `Mattermost API ${res.status} ${res.statusText}: ${detail || "unknown error"}`
      );
    }
    if (res.status === 204) {
      return void 0;
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    return await res.text();
  };
  return { baseUrl, apiBaseUrl, token, request };
}
async function fetchMattermostMe(client) {
  return await client.request("/users/me");
}
async function fetchMattermostUser(client, userId) {
  return await client.request(`/users/${userId}`);
}
async function fetchMattermostUserByUsername(client, username) {
  return await client.request(`/users/username/${encodeURIComponent(username)}`);
}
async function fetchMattermostChannel(client, channelId) {
  return await client.request(`/channels/${channelId}`);
}
async function fetchMattermostChannelByName(client, teamId, channelName) {
  return await client.request(
    `/teams/${teamId}/channels/name/${encodeURIComponent(channelName)}`
  );
}
async function sendMattermostTyping(client, params) {
  const payload = {
    channel_id: params.channelId
  };
  const parentId = params.parentId?.trim();
  if (parentId) {
    payload.parent_id = parentId;
  }
  await client.request("/users/me/typing", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function createMattermostDirectChannel(client, userIds) {
  return await client.request("/channels/direct", {
    method: "POST",
    body: JSON.stringify(userIds)
  });
}
async function createMattermostPost(client, params) {
  const payload = {
    channel_id: params.channelId,
    message: params.message
  };
  if (params.rootId) {
    payload.root_id = params.rootId;
  }
  if (params.fileIds?.length) {
    payload.file_ids = params.fileIds;
  }
  if (params.props) {
    payload.props = params.props;
  }
  return await client.request("/posts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function fetchMattermostUserTeams(client, userId) {
  return await client.request(`/users/${userId}/teams`);
}
async function updateMattermostPost(client, postId, params) {
  const payload = { id: postId };
  if (params.message !== void 0) {
    payload.message = params.message;
  }
  if (params.props !== void 0) {
    payload.props = params.props;
  }
  return await client.request(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function uploadMattermostFile(client, params) {
  const form = new FormData();
  const fileName = params.fileName?.trim() || "upload";
  const bytes = Uint8Array.from(params.buffer);
  const blob = params.contentType ? new Blob([bytes], { type: params.contentType }) : new Blob([bytes]);
  form.append("files", blob, fileName);
  form.append("channel_id", params.channelId);
  const res = await fetch(`${client.apiBaseUrl}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${client.token}`
    },
    body: form
  });
  if (!res.ok) {
    const detail = await readMattermostError(res);
    throw new Error(`Mattermost API ${res.status} ${res.statusText}: ${detail || "unknown error"}`);
  }
  const data = await res.json();
  const info = data.file_infos?.[0];
  if (!info?.id) {
    throw new Error("Mattermost file upload failed");
  }
  return info;
}

// src/core/extensions/mattermost/src/mattermost/accounts.ts
var {
  listAccountIds: listMattermostAccountIds,
  resolveDefaultAccountId: resolveDefaultMattermostAccountId
} = (0, import_mattermost3.createAccountListHelpers)("mattermost");
function resolveAccountConfig(cfg, accountId) {
  const accounts = cfg.channels?.mattermost?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return void 0;
  }
  return accounts[accountId];
}
function mergeMattermostAccountConfig(cfg, accountId) {
  const {
    accounts: _ignored,
    defaultAccount: _ignoredDefaultAccount,
    ...base
  } = cfg.channels?.mattermost ?? {};
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  const mergedCommands = {
    ...base.commands ?? {},
    ...account.commands ?? {}
  };
  const merged = { ...base, ...account };
  if (Object.keys(mergedCommands).length > 0) {
    merged.commands = mergedCommands;
  }
  return merged;
}
function resolveMattermostRequireMention(config) {
  if (config.chatmode === "oncall") {
    return true;
  }
  if (config.chatmode === "onmessage") {
    return false;
  }
  if (config.chatmode === "onchar") {
    return true;
  }
  return config.requireMention;
}
function resolveMattermostAccount(params) {
  const accountId = (0, import_account_id.normalizeAccountId)(params.accountId);
  const baseEnabled = params.cfg.channels?.mattermost?.enabled !== false;
  const merged = mergeMattermostAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const allowEnv = accountId === import_account_id.DEFAULT_ACCOUNT_ID;
  const envToken = allowEnv ? process.env.MATTERMOST_BOT_TOKEN?.trim() : void 0;
  const envUrl = allowEnv ? process.env.MATTERMOST_URL?.trim() : void 0;
  const configToken = params.allowUnresolvedSecretRef ? (0, import_mattermost.normalizeSecretInputString)(merged.botToken) : (0, import_mattermost.normalizeResolvedSecretInputString)({
    value: merged.botToken,
    path: `channels.mattermost.accounts.${accountId}.botToken`
  });
  const configUrl = merged.baseUrl?.trim();
  const botToken = configToken || envToken;
  const baseUrl = normalizeMattermostBaseUrl(configUrl || envUrl);
  const requireMention = resolveMattermostRequireMention(merged);
  const botTokenSource = configToken ? "config" : envToken ? "env" : "none";
  const baseUrlSource = configUrl ? "config" : envUrl ? "env" : "none";
  return {
    accountId,
    enabled,
    name: merged.name?.trim() || void 0,
    botToken,
    baseUrl,
    botTokenSource,
    baseUrlSource,
    config: merged,
    chatmode: merged.chatmode,
    oncharPrefixes: merged.oncharPrefixes,
    requireMention,
    textChunkLimit: merged.textChunkLimit,
    blockStreaming: merged.blockStreaming,
    blockStreamingCoalesce: merged.blockStreamingCoalesce
  };
}
function resolveMattermostReplyToMode(account, kind) {
  if (kind === "direct") {
    return "off";
  }
  return account.config.replyToMode ?? "off";
}

// src/core/extensions/mattermost/src/group-mentions.ts
function resolveMattermostGroupRequireMention(params) {
  const account = resolveMattermostAccount({
    cfg: params.cfg,
    accountId: params.accountId
  });
  const requireMentionOverride = typeof params.requireMentionOverride === "boolean" ? params.requireMentionOverride : account.requireMention;
  return (0, import_compat.resolveChannelGroupRequireMention)({
    cfg: params.cfg,
    channel: "mattermost",
    groupId: params.groupId,
    accountId: params.accountId,
    requireMentionOverride
  });
}

// src/core/extensions/mattermost/src/mattermost/directory.ts
function buildClient(params) {
  const account = resolveMattermostAccount({ cfg: params.cfg, accountId: params.accountId });
  if (!account.enabled || !account.botToken || !account.baseUrl) {
    return null;
  }
  return createMattermostClient({ baseUrl: account.baseUrl, botToken: account.botToken });
}
function buildClients(params) {
  const accountIds = listMattermostAccountIds(params.cfg);
  const seen = /* @__PURE__ */ new Set();
  const clients = [];
  for (const id of accountIds) {
    const client = buildClient({ cfg: params.cfg, accountId: id });
    if (client && !seen.has(client.token)) {
      seen.add(client.token);
      clients.push(client);
    }
  }
  return clients;
}
async function listMattermostDirectoryGroups(params) {
  const clients = buildClients(params);
  if (!clients.length) {
    return [];
  }
  const q = params.query?.trim().toLowerCase() || "";
  const seenIds = /* @__PURE__ */ new Set();
  const entries = [];
  for (const client of clients) {
    try {
      const me = await fetchMattermostMe(client);
      const channels = await client.request(
        `/users/${me.id}/channels?per_page=200`
      );
      for (const ch of channels) {
        if (ch.type !== "O" && ch.type !== "P") continue;
        if (seenIds.has(ch.id)) continue;
        if (q) {
          const name = (ch.name ?? "").toLowerCase();
          const display = (ch.display_name ?? "").toLowerCase();
          if (!name.includes(q) && !display.includes(q)) continue;
        }
        seenIds.add(ch.id);
        entries.push({
          kind: "group",
          id: `channel:${ch.id}`,
          name: ch.name ?? void 0,
          handle: ch.display_name ?? void 0
        });
      }
    } catch (err) {
      console.debug?.(
        "[mattermost-directory] listGroups: skipping account:",
        err?.message
      );
      continue;
    }
  }
  return params.limit && params.limit > 0 ? entries.slice(0, params.limit) : entries;
}
async function listMattermostDirectoryPeers(params) {
  const clients = buildClients(params);
  if (!clients.length) {
    return [];
  }
  const client = clients[0];
  try {
    const me = await fetchMattermostMe(client);
    const teams = await client.request("/users/me/teams");
    if (!teams.length) {
      return [];
    }
    const teamId = teams[0].id;
    const q = params.query?.trim().toLowerCase() || "";
    let users;
    if (q) {
      users = await client.request("/users/search", {
        method: "POST",
        body: JSON.stringify({ term: q, team_id: teamId })
      });
    } else {
      const members = await client.request(
        `/teams/${teamId}/members?per_page=200`
      );
      const userIds = members.map((m) => m.user_id).filter((id) => id !== me.id);
      if (!userIds.length) {
        return [];
      }
      users = await client.request("/users/ids", {
        method: "POST",
        body: JSON.stringify(userIds)
      });
    }
    const entries = users.filter((u) => u.id !== me.id).map((u) => ({
      kind: "user",
      id: `user:${u.id}`,
      name: u.username ?? void 0,
      handle: [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.nickname || void 0
    }));
    return params.limit && params.limit > 0 ? entries.slice(0, params.limit) : entries;
  } catch (err) {
    console.debug?.("[mattermost-directory] listPeers failed:", err?.message);
    return [];
  }
}

// src/core/extensions/mattermost/src/mattermost/monitor.ts
var import_mattermost12 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/runtime.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setMattermostRuntime, getRuntime: getMattermostRuntime } = (0, import_compat2.createPluginRuntimeStore)("Mattermost runtime not initialized");

// src/core/extensions/mattermost/src/mattermost/interactions.ts
var import_node_crypto = require("node:crypto");
var import_mattermost4 = require("src/core/source/plugin-sdk/mattermost");
var INTERACTION_MAX_BODY_BYTES = 64 * 1024;
var INTERACTION_BODY_TIMEOUT_MS = 1e4;
var SIGNED_CHANNEL_ID_CONTEXT_KEY = "__must-b_channel_id";
var callbackUrls = /* @__PURE__ */ new Map();
function setInteractionCallbackUrl(accountId, url) {
  callbackUrls.set(accountId, url);
}
function resolveInteractionCallbackPath(accountId) {
  return `/mattermost/interactions/${accountId}`;
}
function isWildcardBindHost(rawHost) {
  const trimmed = rawHost.trim();
  if (!trimmed) return false;
  const host = trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
  return host === "0.0.0.0" || host === "::" || host === "0:0:0:0:0:0:0:0" || host === "::0";
}
function normalizeCallbackBaseUrl(baseUrl) {
  return baseUrl.trim().replace(/\/+$/, "");
}
function headerValue(value) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || void 0;
  }
  return value?.trim() || void 0;
}
function isAllowedInteractionSource(params) {
  const { allowedSourceIps } = params;
  if (!allowedSourceIps?.length) {
    return true;
  }
  const clientIp = (0, import_mattermost4.resolveClientIp)({
    remoteAddr: params.req.socket?.remoteAddress,
    forwardedFor: headerValue(params.req.headers["x-forwarded-for"]),
    realIp: headerValue(params.req.headers["x-real-ip"]),
    trustedProxies: params.trustedProxies,
    allowRealIpFallback: params.allowRealIpFallback
  });
  return (0, import_mattermost4.isTrustedProxyAddress)(clientIp, allowedSourceIps);
}
function computeInteractionCallbackUrl(accountId, cfg) {
  const path = resolveInteractionCallbackPath(accountId);
  const callbackBaseUrl = cfg?.interactions?.callbackBaseUrl?.trim() ?? cfg?.channels?.mattermost?.interactions?.callbackBaseUrl?.trim();
  if (callbackBaseUrl) {
    return `${normalizeCallbackBaseUrl(callbackBaseUrl)}${path}`;
  }
  const port = typeof cfg?.gateway?.port === "number" ? cfg.gateway.port : 18789;
  let host = cfg?.gateway?.customBindHost && !isWildcardBindHost(cfg.gateway.customBindHost) ? cfg.gateway.customBindHost.trim() : "localhost";
  if (host.includes(":") && !(host.startsWith("[") && host.endsWith("]"))) {
    host = `[${host}]`;
  }
  return `http://${host}:${port}${path}`;
}
function resolveInteractionCallbackUrl(accountId, cfg) {
  const cached = callbackUrls.get(accountId);
  if (cached) {
    return cached;
  }
  return computeInteractionCallbackUrl(accountId, cfg);
}
var interactionSecrets = /* @__PURE__ */ new Map();
var defaultInteractionSecret;
function deriveInteractionSecret(botToken) {
  return (0, import_node_crypto.createHmac)("sha256", "must-b-mattermost-interactions").update(botToken).digest("hex");
}
function setInteractionSecret(accountIdOrBotToken, botToken) {
  if (typeof botToken === "string") {
    interactionSecrets.set(accountIdOrBotToken, deriveInteractionSecret(botToken));
    return;
  }
  defaultInteractionSecret = deriveInteractionSecret(accountIdOrBotToken);
}
function getInteractionSecret(accountId) {
  const scoped = accountId ? interactionSecrets.get(accountId) : void 0;
  if (scoped) {
    return scoped;
  }
  if (defaultInteractionSecret) {
    return defaultInteractionSecret;
  }
  if (interactionSecrets.size === 1) {
    const first = interactionSecrets.values().next().value;
    if (typeof first === "string") {
      return first;
    }
  }
  throw new Error(
    "Interaction secret not initialized \u2014 call setInteractionSecret(accountId, botToken) first"
  );
}
function canonicalizeInteractionContext(value) {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeInteractionContext(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== void 0).sort(([left], [right]) => left.localeCompare(right)).map(([key, entryValue]) => [key, canonicalizeInteractionContext(entryValue)]);
    return Object.fromEntries(entries);
  }
  return value;
}
function generateInteractionToken(context, accountId) {
  const secret = getInteractionSecret(accountId);
  const payload = JSON.stringify(canonicalizeInteractionContext(context));
  return (0, import_node_crypto.createHmac)("sha256", secret).update(payload).digest("hex");
}
function verifyInteractionToken(context, token, accountId) {
  const expected = generateInteractionToken(context, accountId);
  if (expected.length !== token.length) {
    return false;
  }
  return (0, import_node_crypto.timingSafeEqual)(Buffer.from(expected), Buffer.from(token));
}
function sanitizeActionId(id) {
  return id.replace(/[-_]/g, "");
}
function buildButtonAttachments(params) {
  const actions = params.buttons.map((btn) => {
    const safeId = sanitizeActionId(btn.id);
    const context = {
      action_id: safeId,
      ...btn.context
    };
    const token = generateInteractionToken(context, params.accountId);
    return {
      id: safeId,
      type: "button",
      name: btn.name,
      style: btn.style,
      integration: {
        url: params.callbackUrl,
        context: {
          ...context,
          _token: token
        }
      }
    };
  });
  return [
    {
      text: params.text ?? "",
      actions
    }
  ];
}
function buildButtonProps(params) {
  const rawButtons = params.buttons.flatMap(
    (item) => Array.isArray(item) ? item : [item]
  );
  const buttons = rawButtons.map((btn) => ({
    id: String(btn.id ?? btn.callback_data ?? "").trim(),
    name: String(btn.text ?? btn.name ?? btn.label ?? "").trim(),
    style: btn.style ?? "default",
    context: typeof btn.context === "object" && btn.context !== null ? {
      ...btn.context,
      [SIGNED_CHANNEL_ID_CONTEXT_KEY]: params.channelId
    } : { [SIGNED_CHANNEL_ID_CONTEXT_KEY]: params.channelId }
  })).filter((btn) => btn.id && btn.name);
  if (buttons.length === 0) {
    return void 0;
  }
  return {
    attachments: buildButtonAttachments({
      callbackUrl: params.callbackUrl,
      accountId: params.accountId,
      buttons,
      text: params.text
    })
  };
}
function readInteractionBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    const timer = setTimeout(() => {
      req.destroy();
      reject(new Error("Request body read timeout"));
    }, INTERACTION_BODY_TIMEOUT_MS);
    req.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > INTERACTION_MAX_BODY_BYTES) {
        req.destroy();
        clearTimeout(timer);
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function createMattermostInteractionHandler(params) {
  const { client, accountId, log } = params;
  const core = getMattermostRuntime();
  return async (req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    if (!isAllowedInteractionSource({
      req,
      allowedSourceIps: params.allowedSourceIps,
      trustedProxies: params.trustedProxies,
      allowRealIpFallback: params.allowRealIpFallback
    })) {
      log?.(
        `mattermost interaction: rejected callback source remote=${req.socket?.remoteAddress ?? "?"}`
      );
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Forbidden origin" }));
      return;
    }
    let payload;
    try {
      const raw = await readInteractionBody(req);
      payload = JSON.parse(raw);
    } catch (err) {
      log?.(`mattermost interaction: failed to parse body: ${String(err)}`);
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid request body" }));
      return;
    }
    const context = payload.context;
    if (!context) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing context" }));
      return;
    }
    const token = context._token;
    if (typeof token !== "string") {
      log?.("mattermost interaction: missing _token in context");
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing token" }));
      return;
    }
    const { _token, ...contextWithoutToken } = context;
    if (!verifyInteractionToken(contextWithoutToken, token, accountId)) {
      log?.("mattermost interaction: invalid _token");
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid token" }));
      return;
    }
    const actionId = context.action_id;
    if (typeof actionId !== "string") {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing action_id in context" }));
      return;
    }
    const signedChannelId = typeof contextWithoutToken[SIGNED_CHANNEL_ID_CONTEXT_KEY] === "string" ? contextWithoutToken[SIGNED_CHANNEL_ID_CONTEXT_KEY].trim() : "";
    if (signedChannelId && signedChannelId !== payload.channel_id) {
      log?.(
        `mattermost interaction: signed channel mismatch payload=${payload.channel_id} signed=${signedChannelId}`
      );
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Channel mismatch" }));
      return;
    }
    const userName = payload.user_name ?? payload.user_id;
    let originalMessage = "";
    let originalPost = null;
    let clickedButtonName = null;
    try {
      originalPost = await client.request(`/posts/${payload.post_id}`);
      const postChannelId = originalPost.channel_id?.trim();
      if (!postChannelId || postChannelId !== payload.channel_id) {
        log?.(
          `mattermost interaction: post channel mismatch payload=${payload.channel_id} post=${postChannelId ?? "<missing>"}`
        );
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Post/channel mismatch" }));
        return;
      }
      originalMessage = originalPost.message ?? "";
      const postAttachments = Array.isArray(originalPost?.props?.attachments) ? originalPost.props.attachments : [];
      for (const att of postAttachments) {
        const match = att.actions?.find((a) => a.id === actionId);
        if (match?.name) {
          clickedButtonName = match.name;
          break;
        }
      }
      if (clickedButtonName === null) {
        log?.(`mattermost interaction: action ${actionId} not found in post ${payload.post_id}`);
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Unknown action" }));
        return;
      }
    } catch (err) {
      log?.(`mattermost interaction: failed to validate post ${payload.post_id}: ${String(err)}`);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Failed to validate interaction" }));
      return;
    }
    if (!originalPost) {
      log?.(`mattermost interaction: missing fetched post ${payload.post_id}`);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Failed to load interaction post" }));
      return;
    }
    log?.(
      `mattermost interaction: action=${actionId} user=${payload.user_name ?? payload.user_id} post=${payload.post_id} channel=${payload.channel_id}`
    );
    if (params.handleInteraction) {
      try {
        const response = await params.handleInteraction({
          payload,
          userName,
          actionId,
          actionName: clickedButtonName,
          originalMessage,
          context: contextWithoutToken,
          post: originalPost
        });
        if (response !== null) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(response));
          return;
        }
      } catch (err) {
        log?.(`mattermost interaction: custom handler failed: ${String(err)}`);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Interaction handler failed" }));
        return;
      }
    }
    try {
      const eventLabel = `Mattermost button click: action="${actionId}" by ${payload.user_name ?? payload.user_id} in channel ${payload.channel_id}`;
      const sessionKey = params.resolveSessionKey ? await params.resolveSessionKey({
        channelId: payload.channel_id,
        userId: payload.user_id,
        post: originalPost
      }) : `agent:main:mattermost:${accountId}:${payload.channel_id}`;
      core.system.enqueueSystemEvent(eventLabel, {
        sessionKey,
        contextKey: `mattermost:interaction:${payload.post_id}:${actionId}`
      });
    } catch (err) {
      log?.(`mattermost interaction: system event dispatch failed: ${String(err)}`);
    }
    try {
      await updateMattermostPost(client, payload.post_id, {
        message: originalMessage,
        props: {
          attachments: [
            {
              text: `\u2713 **${clickedButtonName}** selected by @${userName}`
            }
          ]
        }
      });
    } catch (err) {
      log?.(`mattermost interaction: failed to update post ${payload.post_id}: ${String(err)}`);
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end("{}");
    if (params.dispatchButtonClick) {
      try {
        await params.dispatchButtonClick({
          channelId: payload.channel_id,
          userId: payload.user_id,
          userName,
          actionId,
          actionName: clickedButtonName,
          postId: payload.post_id,
          post: originalPost
        });
      } catch (err) {
        log?.(`mattermost interaction: dispatchButtonClick failed: ${String(err)}`);
      }
    }
  };
}

// src/core/extensions/mattermost/src/mattermost/model-picker.ts
var import_node_crypto2 = require("node:crypto");
var import_mattermost5 = require("src/core/source/plugin-sdk/mattermost");
var MATTERMOST_MODEL_PICKER_CONTEXT_KEY = "oc_model_picker";
var MODELS_PAGE_SIZE = 8;
var ACTION_IDS = {
  providers: "mdlprov",
  list: "mdllist",
  select: "mdlsel",
  back: "mdlback"
};
function splitModelRef(modelRef) {
  const trimmed = modelRef?.trim();
  if (!trimmed) {
    return null;
  }
  const slashIndex = trimmed.indexOf("/");
  if (slashIndex <= 0 || slashIndex >= trimmed.length - 1) {
    return null;
  }
  const provider = (0, import_mattermost5.normalizeProviderId)(trimmed.slice(0, slashIndex));
  const model = trimmed.slice(slashIndex + 1).trim();
  if (!provider || !model) {
    return null;
  }
  return { provider, model };
}
function normalizePage(value) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(1, Math.floor(value));
}
function paginateItems(items, page, pageSize = MODELS_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.max(1, Math.min(normalizePage(page), totalPages));
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    totalItems: items.length
  };
}
function buildContext(state) {
  return {
    [MATTERMOST_MODEL_PICKER_CONTEXT_KEY]: true,
    ...state
  };
}
function buildButtonId(state) {
  const digest = (0, import_node_crypto2.createHash)("sha256").update(JSON.stringify(state)).digest("hex").slice(0, 12);
  return `${ACTION_IDS[state.action]}${digest}`;
}
function buildButton(params) {
  const baseState = params.action === "providers" || params.action === "back" ? {
    action: params.action,
    ownerUserId: params.ownerUserId
  } : params.action === "list" ? {
    action: "list",
    ownerUserId: params.ownerUserId,
    provider: (0, import_mattermost5.normalizeProviderId)(params.provider ?? ""),
    page: normalizePage(params.page)
  } : {
    action: "select",
    ownerUserId: params.ownerUserId,
    provider: (0, import_mattermost5.normalizeProviderId)(params.provider ?? ""),
    page: normalizePage(params.page),
    model: String(params.model ?? "").trim()
  };
  return {
    // Mattermost requires action IDs to be unique within a post.
    id: buildButtonId(baseState),
    text: params.text,
    ...params.style ? { style: params.style } : {},
    context: buildContext(baseState)
  };
}
function getProviderModels(data, provider) {
  return [...data.byProvider.get((0, import_mattermost5.normalizeProviderId)(provider)) ?? /* @__PURE__ */ new Set()].toSorted();
}
function formatCurrentModelLine(currentModel) {
  const parsed = splitModelRef(currentModel);
  if (!parsed) {
    return "Current: default";
  }
  return `Current: ${parsed.provider}/${parsed.model}`;
}
function resolveMattermostModelPickerEntry(commandText) {
  const normalized = commandText.trim().replace(/\s+/g, " ");
  if (/^\/model$/i.test(normalized)) {
    return { kind: "summary" };
  }
  if (/^\/models$/i.test(normalized)) {
    return { kind: "providers" };
  }
  const providerMatch = normalized.match(/^\/models\s+(\S+)$/i);
  if (!providerMatch?.[1]) {
    return null;
  }
  return {
    kind: "models",
    provider: (0, import_mattermost5.normalizeProviderId)(providerMatch[1])
  };
}
function parseMattermostModelPickerContext(context) {
  if (!context || context[MATTERMOST_MODEL_PICKER_CONTEXT_KEY] !== true) {
    return null;
  }
  const ownerUserId = String(context.ownerUserId ?? "").trim();
  const action = String(context.action ?? "").trim();
  if (!ownerUserId) {
    return null;
  }
  if (action === "providers" || action === "back") {
    return { action, ownerUserId };
  }
  const provider = (0, import_mattermost5.normalizeProviderId)(String(context.provider ?? ""));
  const page = Number.parseInt(String(context.page ?? "1"), 10);
  if (!provider) {
    return null;
  }
  if (action === "list") {
    return {
      action,
      ownerUserId,
      provider,
      page: normalizePage(page)
    };
  }
  if (action === "select") {
    const model = String(context.model ?? "").trim();
    if (!model) {
      return null;
    }
    return {
      action,
      ownerUserId,
      provider,
      page: normalizePage(page),
      model
    };
  }
  return null;
}
function buildMattermostAllowedModelRefs(data) {
  const refs = /* @__PURE__ */ new Set();
  for (const provider of data.providers) {
    for (const model of data.byProvider.get(provider) ?? []) {
      refs.add(`${provider}/${model}`);
    }
  }
  return refs;
}
function resolveMattermostModelPickerCurrentModel(params) {
  const fallback = `${params.data.resolvedDefault.provider}/${params.data.resolvedDefault.model}`;
  try {
    const storePath = (0, import_mattermost5.resolveStorePath)(params.cfg.session?.store, {
      agentId: params.route.agentId
    });
    const sessionStore = params.skipCache ? (0, import_mattermost5.loadSessionStore)(storePath, { skipCache: true }) : (0, import_mattermost5.loadSessionStore)(storePath);
    const sessionEntry = sessionStore[params.route.sessionKey];
    const override = (0, import_mattermost5.resolveStoredModelOverride)({
      sessionEntry,
      sessionStore,
      sessionKey: params.route.sessionKey
    });
    if (!override?.model) {
      return fallback;
    }
    const provider = (override.provider || params.data.resolvedDefault.provider).trim();
    return provider ? `${provider}/${override.model}` : fallback;
  } catch {
    return fallback;
  }
}
function renderMattermostModelSummaryView(params) {
  return {
    text: [
      formatCurrentModelLine(params.currentModel),
      "",
      "Tap below to browse models, or use:",
      "/oc_model <provider/model> to switch",
      "/oc_model status for details"
    ].join("\n"),
    buttons: [
      [
        buildButton({
          action: "providers",
          ownerUserId: params.ownerUserId,
          text: "Browse providers",
          style: "primary"
        })
      ]
    ]
  };
}
function renderMattermostProviderPickerView(params) {
  const currentProvider = splitModelRef(params.currentModel)?.provider;
  const rows = params.data.providers.map((provider) => [
    buildButton({
      action: "list",
      ownerUserId: params.ownerUserId,
      text: `${provider} (${params.data.byProvider.get(provider)?.size ?? 0})`,
      provider,
      page: 1,
      style: provider === currentProvider ? "primary" : "default"
    })
  ]);
  return {
    text: [formatCurrentModelLine(params.currentModel), "", "Select a provider:"].join("\n"),
    buttons: rows
  };
}
function renderMattermostModelsPickerView(params) {
  const provider = (0, import_mattermost5.normalizeProviderId)(params.provider);
  const models = getProviderModels(params.data, provider);
  const current = splitModelRef(params.currentModel);
  if (models.length === 0) {
    return {
      text: [formatCurrentModelLine(params.currentModel), "", `Unknown provider: ${provider}`].join(
        "\n"
      ),
      buttons: [
        [
          buildButton({
            action: "back",
            ownerUserId: params.ownerUserId,
            text: "Back to providers"
          })
        ]
      ]
    };
  }
  const page = paginateItems(models, params.page);
  const rows = page.items.map((model) => {
    const isCurrent = current?.provider === provider && current.model === model;
    return [
      buildButton({
        action: "select",
        ownerUserId: params.ownerUserId,
        text: isCurrent ? `${model} [current]` : model,
        provider,
        model,
        page: page.page,
        style: isCurrent ? "primary" : "default"
      })
    ];
  });
  const navRow = [];
  if (page.hasPrev) {
    navRow.push(
      buildButton({
        action: "list",
        ownerUserId: params.ownerUserId,
        text: "Prev",
        provider,
        page: page.page - 1
      })
    );
  }
  if (page.hasNext) {
    navRow.push(
      buildButton({
        action: "list",
        ownerUserId: params.ownerUserId,
        text: "Next",
        provider,
        page: page.page + 1
      })
    );
  }
  if (navRow.length > 0) {
    rows.push(navRow);
  }
  rows.push([
    buildButton({
      action: "back",
      ownerUserId: params.ownerUserId,
      text: "Back to providers"
    })
  ]);
  return {
    text: [
      `Models (${provider}) - ${page.totalItems} available`,
      formatCurrentModelLine(params.currentModel),
      `Page ${page.page}/${page.totalPages}`,
      "Select a model to switch immediately."
    ].join("\n"),
    buttons: rows
  };
}

// src/core/extensions/mattermost/src/mattermost/monitor-auth.ts
var import_mattermost6 = require("src/core/source/plugin-sdk/mattermost");
function normalizeMattermostAllowEntry(entry) {
  const trimmed = entry.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed === "*") {
    return "*";
  }
  return trimmed.replace(/^(mattermost|user):/i, "").replace(/^@/, "").toLowerCase();
}
function normalizeMattermostAllowList(entries) {
  const normalized = entries.map((entry) => normalizeMattermostAllowEntry(String(entry))).filter(Boolean);
  return Array.from(new Set(normalized));
}
function resolveMattermostEffectiveAllowFromLists(params) {
  return (0, import_mattermost6.resolveEffectiveAllowFromLists)({
    allowFrom: normalizeMattermostAllowList(params.allowFrom ?? []),
    groupAllowFrom: normalizeMattermostAllowList(params.groupAllowFrom ?? []),
    storeAllowFrom: normalizeMattermostAllowList(params.storeAllowFrom ?? []),
    dmPolicy: params.dmPolicy
  });
}
function isMattermostSenderAllowed(params) {
  const allowFrom = normalizeMattermostAllowList(params.allowFrom);
  if (allowFrom.length === 0) {
    return false;
  }
  const match = (0, import_mattermost6.resolveAllowlistMatchSimple)({
    allowFrom,
    senderId: normalizeMattermostAllowEntry(params.senderId),
    senderName: params.senderName ? normalizeMattermostAllowEntry(params.senderName) : void 0,
    allowNameMatching: params.allowNameMatching
  });
  return match.allowed;
}
function mapMattermostChannelKind(channelType) {
  const normalized = channelType?.trim().toUpperCase();
  if (normalized === "D") {
    return "direct";
  }
  if (normalized === "G" || normalized === "P") {
    return "group";
  }
  return "channel";
}
function authorizeMattermostCommandInvocation(params) {
  const {
    account,
    cfg,
    senderId,
    senderName,
    channelId,
    channelInfo,
    storeAllowFrom,
    allowTextCommands,
    hasControlCommand
  } = params;
  if (!channelInfo) {
    return {
      ok: false,
      denyReason: "unknown-channel",
      commandAuthorized: false,
      channelInfo: null,
      kind: "channel",
      chatType: "channel",
      channelName: "",
      channelDisplay: "",
      roomLabel: `#${channelId}`
    };
  }
  const kind = mapMattermostChannelKind(channelInfo.type);
  const chatType = kind;
  const channelName = channelInfo.name ?? "";
  const channelDisplay = channelInfo.display_name ?? channelName;
  const roomLabel = channelName ? `#${channelName}` : channelDisplay || `#${channelId}`;
  const dmPolicy = account.config.dmPolicy ?? "pairing";
  const defaultGroupPolicy = cfg.channels?.defaults?.groupPolicy;
  const groupPolicy = account.config.groupPolicy ?? defaultGroupPolicy ?? "allowlist";
  const allowNameMatching = (0, import_mattermost6.isDangerousNameMatchingEnabled)(account.config);
  const configAllowFrom = normalizeMattermostAllowList(account.config.allowFrom ?? []);
  const configGroupAllowFrom = normalizeMattermostAllowList(account.config.groupAllowFrom ?? []);
  const normalizedStoreAllowFrom = normalizeMattermostAllowList(storeAllowFrom ?? []);
  const { effectiveAllowFrom, effectiveGroupAllowFrom } = resolveMattermostEffectiveAllowFromLists({
    allowFrom: configAllowFrom,
    groupAllowFrom: configGroupAllowFrom,
    storeAllowFrom: normalizedStoreAllowFrom,
    dmPolicy
  });
  const useAccessGroups = cfg.commands?.useAccessGroups !== false;
  const commandDmAllowFrom = kind === "direct" ? effectiveAllowFrom : configAllowFrom;
  const commandGroupAllowFrom = kind === "direct" ? effectiveGroupAllowFrom : configGroupAllowFrom.length > 0 ? configGroupAllowFrom : configAllowFrom;
  const senderAllowedForCommands = isMattermostSenderAllowed({
    senderId,
    senderName,
    allowFrom: commandDmAllowFrom,
    allowNameMatching
  });
  const groupAllowedForCommands = isMattermostSenderAllowed({
    senderId,
    senderName,
    allowFrom: commandGroupAllowFrom,
    allowNameMatching
  });
  const commandGate = (0, import_mattermost6.resolveControlCommandGate)({
    useAccessGroups,
    authorizers: [
      { configured: commandDmAllowFrom.length > 0, allowed: senderAllowedForCommands },
      {
        configured: commandGroupAllowFrom.length > 0,
        allowed: groupAllowedForCommands
      }
    ],
    allowTextCommands,
    hasControlCommand: allowTextCommands && hasControlCommand
  });
  const commandAuthorized = kind === "direct" ? dmPolicy === "open" || senderAllowedForCommands : commandGate.commandAuthorized;
  if (kind === "direct") {
    if (dmPolicy === "disabled") {
      return {
        ok: false,
        denyReason: "dm-disabled",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
    if (dmPolicy !== "open" && !senderAllowedForCommands) {
      return {
        ok: false,
        denyReason: dmPolicy === "pairing" ? "dm-pairing" : "unauthorized",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
  } else {
    const senderGroupAccess = (0, import_mattermost6.evaluateSenderGroupAccessForPolicy)({
      groupPolicy,
      groupAllowFrom: effectiveGroupAllowFrom,
      senderId,
      isSenderAllowed: (_senderId, allowFrom) => isMattermostSenderAllowed({
        senderId,
        senderName,
        allowFrom,
        allowNameMatching
      })
    });
    if (!senderGroupAccess.allowed && senderGroupAccess.reason === "disabled") {
      return {
        ok: false,
        denyReason: "channels-disabled",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
    if (!senderGroupAccess.allowed && senderGroupAccess.reason === "empty_allowlist") {
      return {
        ok: false,
        denyReason: "channel-no-allowlist",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
    if (!senderGroupAccess.allowed && senderGroupAccess.reason === "sender_not_allowlisted") {
      return {
        ok: false,
        denyReason: "unauthorized",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
    if (commandGate.shouldBlock) {
      return {
        ok: false,
        denyReason: "unauthorized",
        commandAuthorized: false,
        channelInfo,
        kind,
        chatType,
        channelName,
        channelDisplay,
        roomLabel
      };
    }
  }
  return {
    ok: true,
    commandAuthorized,
    channelInfo,
    kind,
    chatType,
    channelName,
    channelDisplay,
    roomLabel
  };
}

// src/core/extensions/mattermost/src/mattermost/monitor-helpers.ts
var import_mattermost7 = require("src/core/source/plugin-sdk/mattermost");
var import_mattermost8 = require("src/core/source/plugin-sdk/mattermost");
var formatInboundFromLabel = import_mattermost7.formatInboundFromLabel;
function resolveThreadSessionKeys(params) {
  return (0, import_mattermost7.resolveThreadSessionKeys)({
    ...params,
    normalizeThreadId: (threadId) => threadId
  });
}
function normalizeMention(text, mention) {
  if (!mention) {
    return text.trim();
  }
  const escaped = mention.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasMentionRe = new RegExp(`@${escaped}\\b`, "i");
  const leadingMentionRe = new RegExp(`^([\\t ]*)@${escaped}\\b[\\t ]*`, "i");
  const trailingMentionRe = new RegExp(`[\\t ]*@${escaped}\\b[\\t ]*$`, "i");
  const normalizedLines = text.split("\n").map((line) => {
    const hadMention = hasMentionRe.test(line);
    const normalizedLine = line.replace(leadingMentionRe, "$1").replace(trailingMentionRe, "").replace(new RegExp(`@${escaped}\\b`, "gi"), "").replace(/(\S)[ \t]{2,}/g, "$1 ");
    return {
      text: normalizedLine,
      mentionOnlyBlank: hadMention && normalizedLine.trim() === ""
    };
  });
  while (normalizedLines[0]?.mentionOnlyBlank) {
    normalizedLines.shift();
  }
  while (normalizedLines.at(-1)?.text.trim() === "") {
    normalizedLines.pop();
  }
  return normalizedLines.map((line) => line.text).join("\n");
}

// src/core/extensions/mattermost/src/mattermost/monitor-onchar.ts
var DEFAULT_ONCHAR_PREFIXES = [">", "!"];
function resolveOncharPrefixes(prefixes) {
  const cleaned = prefixes?.map((entry) => entry.trim()).filter(Boolean) ?? DEFAULT_ONCHAR_PREFIXES;
  return cleaned.length > 0 ? cleaned : DEFAULT_ONCHAR_PREFIXES;
}
function stripOncharPrefix(text, prefixes) {
  const trimmed = text.trimStart();
  for (const prefix of prefixes) {
    if (!prefix) {
      continue;
    }
    if (trimmed.startsWith(prefix)) {
      return {
        triggered: true,
        stripped: trimmed.slice(prefix.length).trimStart()
      };
    }
  }
  return { triggered: false, stripped: text };
}

// src/core/extensions/mattermost/src/mattermost/monitor-websocket.ts
var import_ws = __toESM(require("ws"), 1);
var WebSocketClosedBeforeOpenError = class extends Error {
  constructor(code, reason) {
    super(`websocket closed before open (code ${code})`);
    this.code = code;
    this.reason = reason;
    this.name = "WebSocketClosedBeforeOpenError";
  }
};
var defaultMattermostWebSocketFactory = (url) => new import_ws.default(url);
function parsePostedPayload(payload) {
  if (payload.event !== "posted") {
    return null;
  }
  const postData = payload.data?.post;
  if (!postData) {
    return null;
  }
  let post = null;
  if (typeof postData === "string") {
    try {
      post = JSON.parse(postData);
    } catch {
      return null;
    }
  } else if (typeof postData === "object") {
    post = postData;
  }
  if (!post) {
    return null;
  }
  return { payload, post };
}
function createMattermostConnectOnce(opts) {
  const webSocketFactory = opts.webSocketFactory ?? defaultMattermostWebSocketFactory;
  return async () => {
    const ws = webSocketFactory(opts.wsUrl);
    const onAbort = () => ws.terminate();
    opts.abortSignal?.addEventListener("abort", onAbort, { once: true });
    try {
      return await new Promise((resolve, reject) => {
        let opened = false;
        let settled = false;
        const resolveOnce = () => {
          if (settled) {
            return;
          }
          settled = true;
          resolve();
        };
        const rejectOnce = (error) => {
          if (settled) {
            return;
          }
          settled = true;
          reject(error);
        };
        ws.on("open", () => {
          opened = true;
          opts.statusSink?.({
            connected: true,
            lastConnectedAt: Date.now(),
            lastError: null
          });
          ws.send(
            JSON.stringify({
              seq: opts.nextSeq(),
              action: "authentication_challenge",
              data: { token: opts.botToken }
            })
          );
        });
        ws.on("message", async (data) => {
          const raw = (0, import_mattermost8.rawDataToString)(data);
          let payload;
          try {
            payload = JSON.parse(raw);
          } catch {
            return;
          }
          if (payload.event === "reaction_added" || payload.event === "reaction_removed") {
            if (!opts.onReaction) {
              return;
            }
            try {
              await opts.onReaction(payload);
            } catch (err) {
              opts.runtime.error?.(`mattermost reaction handler failed: ${String(err)}`);
            }
            return;
          }
          if (payload.event !== "posted") {
            return;
          }
          const parsed = parsePostedPayload(payload);
          if (!parsed) {
            return;
          }
          try {
            await opts.onPosted(parsed.post, parsed.payload);
          } catch (err) {
            opts.runtime.error?.(`mattermost handler failed: ${String(err)}`);
          }
        });
        ws.on("close", (code, reason) => {
          const message = reasonToString(reason);
          opts.statusSink?.({
            connected: false,
            lastDisconnect: {
              at: Date.now(),
              status: code,
              error: message || void 0
            }
          });
          if (opened) {
            resolveOnce();
            return;
          }
          rejectOnce(new WebSocketClosedBeforeOpenError(code, message || void 0));
        });
        ws.on("error", (err) => {
          opts.runtime.error?.(`mattermost websocket error: ${String(err)}`);
          opts.statusSink?.({
            lastError: String(err)
          });
          try {
            ws.close();
          } catch {
          }
        });
      });
    } finally {
      opts.abortSignal?.removeEventListener("abort", onAbort);
    }
  };
}
function reasonToString(reason) {
  if (!reason) {
    return "";
  }
  if (typeof reason === "string") {
    return reason;
  }
  return reason.length > 0 ? reason.toString("utf8") : "";
}

// src/core/extensions/mattermost/src/mattermost/reconnect.ts
async function runWithReconnect(connectFn, opts = {}) {
  const { initialDelayMs = 2e3, maxDelayMs = 6e4 } = opts;
  const jitterRatio = Math.max(0, opts.jitterRatio ?? 0);
  const random = opts.random ?? Math.random;
  let retryDelay = initialDelayMs;
  let attempt = 0;
  while (!opts.abortSignal?.aborted) {
    let shouldIncreaseDelay = false;
    let outcome = "resolved";
    let error;
    try {
      await connectFn();
      retryDelay = initialDelayMs;
    } catch (err) {
      if (opts.abortSignal?.aborted) {
        return;
      }
      outcome = "rejected";
      error = err;
      opts.onError?.(err);
      shouldIncreaseDelay = true;
    }
    if (opts.abortSignal?.aborted) {
      return;
    }
    const delayMs = withJitter(retryDelay, jitterRatio, random);
    const shouldReconnect = opts.shouldReconnect?.({
      attempt,
      delayMs,
      outcome,
      error
    }) ?? true;
    if (!shouldReconnect) {
      return;
    }
    opts.onReconnect?.(delayMs);
    await sleepAbortable(delayMs, opts.abortSignal);
    if (shouldIncreaseDelay) {
      retryDelay = Math.min(retryDelay * 2, maxDelayMs);
    }
    attempt++;
  }
}
function withJitter(baseMs, jitterRatio, random) {
  if (jitterRatio <= 0) {
    return baseMs;
  }
  const normalized = Math.max(0, Math.min(1, random()));
  const spread = baseMs * jitterRatio;
  return Math.max(1, Math.round(baseMs - spread + normalized * spread * 2));
}
function sleepAbortable(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// src/core/extensions/mattermost/src/mattermost/reply-delivery.ts
var import_mattermost9 = require("src/core/source/plugin-sdk/mattermost");
async function deliverMattermostReplyPayload(params) {
  const mediaUrls = params.payload.mediaUrls ?? (params.payload.mediaUrl ? [params.payload.mediaUrl] : []);
  const text = params.core.channel.text.convertMarkdownTables(
    params.payload.text ?? "",
    params.tableMode
  );
  if (mediaUrls.length === 0) {
    const chunkMode = params.core.channel.text.resolveChunkMode(
      params.cfg,
      "mattermost",
      params.accountId
    );
    const chunks = params.core.channel.text.chunkMarkdownTextWithMode(
      text,
      params.textLimit,
      chunkMode
    );
    for (const chunk of chunks.length > 0 ? chunks : [text]) {
      if (!chunk) {
        continue;
      }
      await params.sendMessage(params.to, chunk, {
        accountId: params.accountId,
        replyToId: params.replyToId
      });
    }
    return;
  }
  const mediaLocalRoots = (0, import_mattermost9.getAgentScopedMediaLocalRoots)(params.cfg, params.agentId);
  let first = true;
  for (const mediaUrl of mediaUrls) {
    const caption = first ? text : "";
    first = false;
    await params.sendMessage(params.to, caption, {
      accountId: params.accountId,
      mediaUrl,
      mediaLocalRoots,
      replyToId: params.replyToId
    });
  }
}

// src/core/extensions/mattermost/src/mattermost/send.ts
var import_mattermost10 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/mattermost/target-resolution.ts
var mattermostOpaqueTargetCache = /* @__PURE__ */ new Map();
function cacheKey(baseUrl, token, id) {
  return `${baseUrl}::${token}::${id}`;
}
function isMattermostId(value) {
  return /^[a-z0-9]{26}$/.test(value);
}
function isExplicitMattermostTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  return /^(channel|user|mattermost):/i.test(trimmed) || trimmed.startsWith("@") || trimmed.startsWith("#");
}
function parseMattermostApiStatus(err) {
  if (!err || typeof err !== "object") {
    return void 0;
  }
  const msg = "message" in err ? String(err.message ?? "") : "";
  const match = /Mattermost API (\d{3})\b/.exec(msg);
  if (!match) {
    return void 0;
  }
  const code = Number(match[1]);
  return Number.isFinite(code) ? code : void 0;
}
async function resolveMattermostOpaqueTarget(params) {
  const input = params.input.trim();
  if (!input || isExplicitMattermostTarget(input) || !isMattermostId(input)) {
    return null;
  }
  const account = params.cfg && (!params.token || !params.baseUrl) ? resolveMattermostAccount({ cfg: params.cfg, accountId: params.accountId }) : null;
  const token = params.token?.trim() || account?.botToken?.trim();
  const baseUrl = normalizeMattermostBaseUrl(params.baseUrl ?? account?.baseUrl);
  if (!token || !baseUrl) {
    return null;
  }
  const key = cacheKey(baseUrl, token, input);
  const cached = mattermostOpaqueTargetCache.get(key);
  if (cached === true) {
    return { kind: "user", id: input, to: `user:${input}` };
  }
  if (cached === false) {
    return { kind: "channel", id: input, to: `channel:${input}` };
  }
  const client = createMattermostClient({ baseUrl, botToken: token });
  try {
    await fetchMattermostUser(client, input);
    mattermostOpaqueTargetCache.set(key, true);
    return { kind: "user", id: input, to: `user:${input}` };
  } catch (err) {
    if (parseMattermostApiStatus(err) === 404) {
      mattermostOpaqueTargetCache.set(key, false);
    }
    return { kind: "channel", id: input, to: `channel:${input}` };
  }
}

// src/core/extensions/mattermost/src/mattermost/send.ts
var botUserCache = /* @__PURE__ */ new Map();
var userByNameCache = /* @__PURE__ */ new Map();
var channelByNameCache = /* @__PURE__ */ new Map();
var dmChannelCache = /* @__PURE__ */ new Map();
var getCore = () => getMattermostRuntime();
function cacheKey2(baseUrl, token) {
  return `${baseUrl}::${token}`;
}
function normalizeMessage(text, mediaUrl) {
  const trimmed = text.trim();
  const media = mediaUrl?.trim();
  return [trimmed, media].filter(Boolean).join("\n");
}
function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}
function parseMattermostTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Recipient is required for Mattermost sends");
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("channel:")) {
    const id = trimmed.slice("channel:".length).trim();
    if (!id) {
      throw new Error("Channel id is required for Mattermost sends");
    }
    if (id.startsWith("#")) {
      const name = id.slice(1).trim();
      if (!name) {
        throw new Error("Channel name is required for Mattermost sends");
      }
      return { kind: "channel-name", name };
    }
    if (!isMattermostId(id)) {
      return { kind: "channel-name", name: id };
    }
    return { kind: "channel", id };
  }
  if (lower.startsWith("user:")) {
    const id = trimmed.slice("user:".length).trim();
    if (!id) {
      throw new Error("User id is required for Mattermost sends");
    }
    return { kind: "user", id };
  }
  if (lower.startsWith("mattermost:")) {
    const id = trimmed.slice("mattermost:".length).trim();
    if (!id) {
      throw new Error("User id is required for Mattermost sends");
    }
    return { kind: "user", id };
  }
  if (trimmed.startsWith("@")) {
    const username = trimmed.slice(1).trim();
    if (!username) {
      throw new Error("Username is required for Mattermost sends");
    }
    return { kind: "user", username };
  }
  if (trimmed.startsWith("#")) {
    const name = trimmed.slice(1).trim();
    if (!name) {
      throw new Error("Channel name is required for Mattermost sends");
    }
    return { kind: "channel-name", name };
  }
  if (!isMattermostId(trimmed)) {
    return { kind: "channel-name", name: trimmed };
  }
  return { kind: "channel", id: trimmed };
}
async function resolveBotUser(baseUrl, token) {
  const key = cacheKey2(baseUrl, token);
  const cached = botUserCache.get(key);
  if (cached) {
    return cached;
  }
  const client = createMattermostClient({ baseUrl, botToken: token });
  const user = await fetchMattermostMe(client);
  botUserCache.set(key, user);
  return user;
}
async function resolveUserIdByUsername(params) {
  const { baseUrl, token, username } = params;
  const key = `${cacheKey2(baseUrl, token)}::${username.toLowerCase()}`;
  const cached = userByNameCache.get(key);
  if (cached?.id) {
    return cached.id;
  }
  const client = createMattermostClient({ baseUrl, botToken: token });
  const user = await fetchMattermostUserByUsername(client, username);
  userByNameCache.set(key, user);
  return user.id;
}
async function resolveChannelIdByName(params) {
  const { baseUrl, token, name } = params;
  const key = `${cacheKey2(baseUrl, token)}::channel::${name.toLowerCase()}`;
  const cached = channelByNameCache.get(key);
  if (cached) {
    return cached;
  }
  const client = createMattermostClient({ baseUrl, botToken: token });
  const me = await fetchMattermostMe(client);
  const teams = await fetchMattermostUserTeams(client, me.id);
  for (const team of teams) {
    try {
      const channel2 = await fetchMattermostChannelByName(client, team.id, name);
      if (channel2?.id) {
        channelByNameCache.set(key, channel2.id);
        return channel2.id;
      }
    } catch {
    }
  }
  throw new Error(`Mattermost channel "#${name}" not found in any team the bot belongs to`);
}
async function resolveTargetChannelId(params) {
  if (params.target.kind === "channel") {
    return params.target.id;
  }
  if (params.target.kind === "channel-name") {
    return await resolveChannelIdByName({
      baseUrl: params.baseUrl,
      token: params.token,
      name: params.target.name
    });
  }
  const userId = params.target.id ? params.target.id : await resolveUserIdByUsername({
    baseUrl: params.baseUrl,
    token: params.token,
    username: params.target.username ?? ""
  });
  const dmKey = `${cacheKey2(params.baseUrl, params.token)}::dm::${userId}`;
  const cachedDm = dmChannelCache.get(dmKey);
  if (cachedDm) {
    return cachedDm;
  }
  const botUser = await resolveBotUser(params.baseUrl, params.token);
  const client = createMattermostClient({
    baseUrl: params.baseUrl,
    botToken: params.token
  });
  const channel2 = await createMattermostDirectChannel(client, [botUser.id, userId]);
  dmChannelCache.set(dmKey, channel2.id);
  return channel2.id;
}
async function resolveMattermostSendContext(to, opts = {}) {
  const core = getCore();
  const cfg = opts.cfg ?? core.config.loadConfig();
  const account = resolveMattermostAccount({
    cfg,
    accountId: opts.accountId
  });
  const token = opts.botToken?.trim() || account.botToken?.trim();
  if (!token) {
    throw new Error(
      `Mattermost bot token missing for account "${account.accountId}" (set channels.mattermost.accounts.${account.accountId}.botToken or MATTERMOST_BOT_TOKEN for default).`
    );
  }
  const baseUrl = normalizeMattermostBaseUrl(opts.baseUrl ?? account.baseUrl);
  if (!baseUrl) {
    throw new Error(
      `Mattermost baseUrl missing for account "${account.accountId}" (set channels.mattermost.accounts.${account.accountId}.baseUrl or MATTERMOST_URL for default).`
    );
  }
  const trimmedTo = to?.trim() ?? "";
  const opaqueTarget = await resolveMattermostOpaqueTarget({
    input: trimmedTo,
    token,
    baseUrl
  });
  const target = opaqueTarget?.kind === "user" ? { kind: "user", id: opaqueTarget.id } : opaqueTarget?.kind === "channel" ? { kind: "channel", id: opaqueTarget.id } : parseMattermostTarget(trimmedTo);
  const channelId = await resolveTargetChannelId({
    target,
    baseUrl,
    token
  });
  return {
    cfg,
    accountId: account.accountId,
    token,
    baseUrl,
    channelId
  };
}
async function sendMessageMattermost(to, text, opts = {}) {
  const core = getCore();
  const logger = core.logging.getChildLogger({ module: "mattermost" });
  const { cfg, accountId, token, baseUrl, channelId } = await resolveMattermostSendContext(
    to,
    opts
  );
  const client = createMattermostClient({ baseUrl, botToken: token });
  let props = opts.props;
  if (!props && Array.isArray(opts.buttons) && opts.buttons.length > 0) {
    setInteractionSecret(accountId, token);
    props = buildButtonProps({
      callbackUrl: resolveInteractionCallbackUrl(accountId, {
        gateway: cfg.gateway,
        interactions: resolveMattermostAccount({
          cfg,
          accountId
        }).config?.interactions
      }),
      accountId,
      channelId,
      buttons: opts.buttons,
      text: opts.attachmentText
    });
  }
  let message = text?.trim() ?? "";
  let fileIds;
  let uploadError;
  const mediaUrl = opts.mediaUrl?.trim();
  if (mediaUrl) {
    try {
      const media = await (0, import_mattermost10.loadOutboundMediaFromUrl)(mediaUrl, {
        mediaLocalRoots: opts.mediaLocalRoots
      });
      const fileInfo = await uploadMattermostFile(client, {
        channelId,
        buffer: media.buffer,
        fileName: media.fileName ?? "upload",
        contentType: media.contentType ?? void 0
      });
      fileIds = [fileInfo.id];
    } catch (err) {
      uploadError = err instanceof Error ? err : new Error(String(err));
      if (core.logging.shouldLogVerbose()) {
        logger.debug?.(
          `mattermost send: media upload failed, falling back to URL text: ${String(err)}`
        );
      }
      message = normalizeMessage(message, isHttpUrl(mediaUrl) ? mediaUrl : "");
    }
  }
  if (message) {
    const tableMode = core.channel.text.resolveMarkdownTableMode({
      cfg,
      channel: "mattermost",
      accountId
    });
    message = core.channel.text.convertMarkdownTables(message, tableMode);
  }
  if (!message && (!fileIds || fileIds.length === 0)) {
    if (uploadError) {
      throw new Error(`Mattermost media upload failed: ${uploadError.message}`);
    }
    throw new Error("Mattermost message is empty");
  }
  const post = await createMattermostPost(client, {
    channelId,
    message,
    rootId: opts.replyToId,
    fileIds,
    props
  });
  core.channel.activity.record({
    channel: "mattermost",
    accountId,
    direction: "outbound"
  });
  return {
    messageId: post.id ?? "unknown",
    channelId
  };
}

// src/core/extensions/mattermost/src/mattermost/slash-commands.ts
var DEFAULT_COMMAND_SPECS = [
  {
    trigger: "oc_status",
    originalName: "status",
    description: "Show session status (model, usage, uptime)",
    autoComplete: true
  },
  {
    trigger: "oc_model",
    originalName: "model",
    description: "View or change the current model",
    autoComplete: true,
    autoCompleteHint: "[model-name]"
  },
  {
    trigger: "oc_models",
    originalName: "models",
    description: "Browse available models",
    autoComplete: true,
    autoCompleteHint: "[provider]"
  },
  {
    trigger: "oc_new",
    originalName: "new",
    description: "Start a new conversation session",
    autoComplete: true
  },
  {
    trigger: "oc_help",
    originalName: "help",
    description: "Show available commands",
    autoComplete: true
  },
  {
    trigger: "oc_think",
    originalName: "think",
    description: "Set thinking/reasoning level",
    autoComplete: true,
    autoCompleteHint: "[off|low|medium|high]"
  },
  {
    trigger: "oc_reasoning",
    originalName: "reasoning",
    description: "Toggle reasoning mode",
    autoComplete: true,
    autoCompleteHint: "[on|off]"
  },
  {
    trigger: "oc_verbose",
    originalName: "verbose",
    description: "Toggle verbose mode",
    autoComplete: true,
    autoCompleteHint: "[on|off]"
  }
];
async function listMattermostCommands(client, teamId) {
  return await client.request(
    `/commands?team_id=${encodeURIComponent(teamId)}&custom_only=true`
  );
}
async function createMattermostCommand(client, params) {
  return await client.request("/commands", {
    method: "POST",
    body: JSON.stringify(params)
  });
}
async function deleteMattermostCommand(client, commandId) {
  await client.request(`/commands/${encodeURIComponent(commandId)}`, {
    method: "DELETE"
  });
}
async function updateMattermostCommand(client, params) {
  return await client.request(
    `/commands/${encodeURIComponent(params.id)}`,
    {
      method: "PUT",
      body: JSON.stringify(params)
    }
  );
}
async function registerSlashCommands(params) {
  const { client, teamId, creatorUserId, callbackUrl, commands, log } = params;
  const normalizedCreatorUserId = creatorUserId.trim();
  if (!normalizedCreatorUserId) {
    throw new Error("creatorUserId is required for slash command reconciliation");
  }
  let existing = [];
  try {
    existing = await listMattermostCommands(client, teamId);
  } catch (err) {
    log?.(`mattermost: failed to list existing commands: ${String(err)}`);
    throw err;
  }
  const existingByTrigger = /* @__PURE__ */ new Map();
  for (const cmd of existing) {
    const list = existingByTrigger.get(cmd.trigger) ?? [];
    list.push(cmd);
    existingByTrigger.set(cmd.trigger, list);
  }
  const registered = [];
  for (const spec of commands) {
    const existingForTrigger = existingByTrigger.get(spec.trigger) ?? [];
    const ownedCommands = existingForTrigger.filter(
      (cmd) => cmd.creator_id?.trim() === normalizedCreatorUserId
    );
    const foreignCommands = existingForTrigger.filter(
      (cmd) => cmd.creator_id?.trim() !== normalizedCreatorUserId
    );
    if (ownedCommands.length === 0 && foreignCommands.length > 0) {
      log?.(
        `mattermost: trigger /${spec.trigger} already used by non-Must-b command(s); skipping to avoid mutating external integrations`
      );
      continue;
    }
    if (ownedCommands.length > 1) {
      log?.(
        `mattermost: multiple owned commands found for /${spec.trigger}; using the first and leaving extras untouched`
      );
    }
    const existingCmd = ownedCommands[0];
    if (existingCmd && existingCmd.url === callbackUrl) {
      log?.(`mattermost: command /${spec.trigger} already registered (id=${existingCmd.id})`);
      registered.push({
        id: existingCmd.id,
        trigger: spec.trigger,
        teamId,
        token: existingCmd.token,
        managed: false
      });
      continue;
    }
    if (existingCmd && existingCmd.url !== callbackUrl) {
      log?.(
        `mattermost: command /${spec.trigger} exists with different callback URL; updating (id=${existingCmd.id})`
      );
      try {
        const updated = await updateMattermostCommand(client, {
          id: existingCmd.id,
          team_id: teamId,
          trigger: spec.trigger,
          method: "P",
          url: callbackUrl,
          description: spec.description,
          auto_complete: spec.autoComplete,
          auto_complete_desc: spec.description,
          auto_complete_hint: spec.autoCompleteHint
        });
        registered.push({
          id: updated.id,
          trigger: spec.trigger,
          teamId,
          token: updated.token,
          managed: false
        });
        continue;
      } catch (err) {
        log?.(
          `mattermost: failed to update command /${spec.trigger} (id=${existingCmd.id}): ${String(err)}`
        );
        try {
          await deleteMattermostCommand(client, existingCmd.id);
          log?.(`mattermost: deleted stale command /${spec.trigger} (id=${existingCmd.id})`);
        } catch (deleteErr) {
          log?.(
            `mattermost: failed to delete stale command /${spec.trigger} (id=${existingCmd.id}): ${String(deleteErr)}`
          );
          continue;
        }
      }
    }
    try {
      const created = await createMattermostCommand(client, {
        team_id: teamId,
        trigger: spec.trigger,
        method: "P",
        url: callbackUrl,
        description: spec.description,
        auto_complete: spec.autoComplete,
        auto_complete_desc: spec.description,
        auto_complete_hint: spec.autoCompleteHint
      });
      log?.(`mattermost: registered command /${spec.trigger} (id=${created.id})`);
      registered.push({
        id: created.id,
        trigger: spec.trigger,
        teamId,
        token: created.token,
        managed: true
      });
    } catch (err) {
      log?.(`mattermost: failed to register command /${spec.trigger}: ${String(err)}`);
    }
  }
  return registered;
}
async function cleanupSlashCommands(params) {
  const { client, commands, log } = params;
  for (const cmd of commands) {
    if (!cmd.managed) {
      continue;
    }
    try {
      await deleteMattermostCommand(client, cmd.id);
      log?.(`mattermost: deleted command /${cmd.trigger} (id=${cmd.id})`);
    } catch (err) {
      log?.(`mattermost: failed to delete command /${cmd.trigger}: ${String(err)}`);
    }
  }
}
function parseSlashCommandPayload(body, contentType) {
  if (!body) {
    return null;
  }
  try {
    if (contentType?.includes("application/json")) {
      const parsed = JSON.parse(body);
      const token2 = typeof parsed.token === "string" ? parsed.token : "";
      const teamId2 = typeof parsed.team_id === "string" ? parsed.team_id : "";
      const channelId2 = typeof parsed.channel_id === "string" ? parsed.channel_id : "";
      const userId2 = typeof parsed.user_id === "string" ? parsed.user_id : "";
      const command2 = typeof parsed.command === "string" ? parsed.command : "";
      if (!token2 || !teamId2 || !channelId2 || !userId2 || !command2) {
        return null;
      }
      return {
        token: token2,
        team_id: teamId2,
        team_domain: typeof parsed.team_domain === "string" ? parsed.team_domain : void 0,
        channel_id: channelId2,
        channel_name: typeof parsed.channel_name === "string" ? parsed.channel_name : void 0,
        user_id: userId2,
        user_name: typeof parsed.user_name === "string" ? parsed.user_name : void 0,
        command: command2,
        text: typeof parsed.text === "string" ? parsed.text : "",
        trigger_id: typeof parsed.trigger_id === "string" ? parsed.trigger_id : void 0,
        response_url: typeof parsed.response_url === "string" ? parsed.response_url : void 0
      };
    }
    const params = new URLSearchParams(body);
    const token = params.get("token");
    const teamId = params.get("team_id");
    const channelId = params.get("channel_id");
    const userId = params.get("user_id");
    const command = params.get("command");
    if (!token || !teamId || !channelId || !userId || !command) {
      return null;
    }
    return {
      token,
      team_id: teamId,
      team_domain: params.get("team_domain") ?? void 0,
      channel_id: channelId,
      channel_name: params.get("channel_name") ?? void 0,
      user_id: userId,
      user_name: params.get("user_name") ?? void 0,
      command,
      text: params.get("text") ?? "",
      trigger_id: params.get("trigger_id") ?? void 0,
      response_url: params.get("response_url") ?? void 0
    };
  } catch {
    return null;
  }
}
function resolveCommandText(trigger, text, triggerMap) {
  const commandName = triggerMap?.get(trigger) ?? (trigger.startsWith("oc_") ? trigger.slice(3) : trigger);
  const args = text.trim();
  return args ? `/${commandName} ${args}` : `/${commandName}`;
}
var DEFAULT_CALLBACK_PATH = "/api/channels/mattermost/command";
function normalizeCallbackPath(path) {
  const trimmed = path.trim();
  if (!trimmed) return DEFAULT_CALLBACK_PATH;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function resolveSlashCommandConfig(raw) {
  return {
    native: raw?.native ?? "auto",
    nativeSkills: raw?.nativeSkills ?? "auto",
    callbackPath: normalizeCallbackPath(raw?.callbackPath ?? DEFAULT_CALLBACK_PATH),
    callbackUrl: raw?.callbackUrl?.trim() || void 0
  };
}
function isSlashCommandsEnabled(config) {
  if (config.native === true) {
    return true;
  }
  if (config.native === false) {
    return false;
  }
  return false;
}
function resolveCallbackUrl(params) {
  if (params.config.callbackUrl) {
    return params.config.callbackUrl;
  }
  const isWildcardBindHost2 = (rawHost) => {
    const trimmed = rawHost.trim();
    if (!trimmed) return false;
    const host2 = trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
    return host2 === "0.0.0.0" || host2 === "::" || host2 === "0:0:0:0:0:0:0:0" || host2 === "::0";
  };
  let host = params.gatewayHost && !isWildcardBindHost2(params.gatewayHost) ? params.gatewayHost : "localhost";
  const path = normalizeCallbackPath(params.config.callbackPath);
  if (host.includes(":") && !(host.startsWith("[") && host.endsWith("]"))) {
    host = `[${host}]`;
  }
  return `http://${host}:${params.gatewayPort}${path}`;
}

// src/core/extensions/mattermost/src/mattermost/slash-http.ts
var import_mattermost11 = require("src/core/source/plugin-sdk/mattermost");
function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function sendJsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
async function authorizeSlashInvocation(params) {
  const { account, cfg, client, commandText, channelId, senderId, senderName, log } = params;
  const core = getMattermostRuntime();
  let channelInfo = null;
  try {
    channelInfo = await fetchMattermostChannel(client, channelId);
  } catch (err) {
    log?.(`mattermost: slash channel lookup failed for ${channelId}: ${String(err)}`);
  }
  if (!channelInfo) {
    return {
      ok: false,
      denyResponse: {
        response_type: "ephemeral",
        text: "Temporary error: unable to determine channel type. Please try again."
      },
      commandAuthorized: false,
      channelInfo: null,
      kind: "channel",
      chatType: "channel",
      channelName: "",
      channelDisplay: "",
      roomLabel: `#${channelId}`
    };
  }
  const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
    cfg,
    surface: "mattermost"
  });
  const hasControlCommand = core.channel.text.hasControlCommand(commandText, cfg);
  const storeAllowFrom = normalizeMattermostAllowList(
    await core.channel.pairing.readAllowFromStore({
      channel: "mattermost",
      accountId: account.accountId
    }).catch(() => [])
  );
  const decision = authorizeMattermostCommandInvocation({
    account,
    cfg,
    senderId,
    senderName,
    channelId,
    channelInfo,
    storeAllowFrom,
    allowTextCommands,
    hasControlCommand
  });
  if (!decision.ok) {
    if (decision.denyReason === "dm-pairing") {
      const { code } = await core.channel.pairing.upsertPairingRequest({
        channel: "mattermost",
        accountId: account.accountId,
        id: senderId,
        meta: { name: senderName }
      });
      return {
        ...decision,
        denyResponse: {
          response_type: "ephemeral",
          text: core.channel.pairing.buildPairingReply({
            channel: "mattermost",
            idLine: `Your Mattermost user id: ${senderId}`,
            code
          })
        }
      };
    }
    const denyText = decision.denyReason === "unknown-channel" ? "Temporary error: unable to determine channel type. Please try again." : decision.denyReason === "dm-disabled" ? "This bot is not accepting direct messages." : decision.denyReason === "channels-disabled" ? "Slash commands are disabled in channels." : decision.denyReason === "channel-no-allowlist" ? "Slash commands are not configured for this channel (no allowlist)." : "Unauthorized.";
    return {
      ...decision,
      denyResponse: {
        response_type: "ephemeral",
        text: denyText
      }
    };
  }
  return {
    ...decision,
    denyResponse: void 0
  };
}
function createSlashCommandHttpHandler(params) {
  const { account, cfg, runtime, commandTokens, triggerMap, log } = params;
  const MAX_BODY_BYTES = 64 * 1024;
  return async (req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      res.end("Method Not Allowed");
      return;
    }
    let body;
    try {
      body = await readBody(req, MAX_BODY_BYTES);
    } catch {
      res.statusCode = 413;
      res.end("Payload Too Large");
      return;
    }
    const contentType = req.headers["content-type"] ?? "";
    const payload = parseSlashCommandPayload(body, contentType);
    if (!payload) {
      sendJsonResponse(res, 400, {
        response_type: "ephemeral",
        text: "Invalid slash command payload."
      });
      return;
    }
    if (commandTokens.size === 0 || !commandTokens.has(payload.token)) {
      sendJsonResponse(res, 401, {
        response_type: "ephemeral",
        text: "Unauthorized: invalid command token."
      });
      return;
    }
    const trigger = payload.command.replace(/^\//, "").trim();
    const commandText = resolveCommandText(trigger, payload.text, triggerMap);
    const channelId = payload.channel_id;
    const senderId = payload.user_id;
    const senderName = payload.user_name ?? senderId;
    const client = createMattermostClient({
      baseUrl: account.baseUrl ?? "",
      botToken: account.botToken ?? ""
    });
    const auth = await authorizeSlashInvocation({
      account,
      cfg,
      client,
      commandText,
      channelId,
      senderId,
      senderName,
      log
    });
    if (!auth.ok) {
      sendJsonResponse(
        res,
        200,
        auth.denyResponse ?? { response_type: "ephemeral", text: "Unauthorized." }
      );
      return;
    }
    log?.(`mattermost: slash command /${trigger} from ${senderName} in ${channelId}`);
    sendJsonResponse(res, 200, {
      response_type: "ephemeral",
      text: "Processing..."
    });
    try {
      await handleSlashCommandAsync({
        account,
        cfg,
        runtime,
        client,
        commandText,
        channelId,
        senderId,
        senderName,
        teamId: payload.team_id,
        triggerId: payload.trigger_id,
        kind: auth.kind,
        chatType: auth.chatType,
        channelName: auth.channelName,
        channelDisplay: auth.channelDisplay,
        roomLabel: auth.roomLabel,
        commandAuthorized: auth.commandAuthorized,
        log
      });
    } catch (err) {
      log?.(`mattermost: slash command handler error: ${String(err)}`);
      try {
        const to = `channel:${channelId}`;
        await sendMessageMattermost(to, "Sorry, something went wrong processing that command.", {
          accountId: account.accountId
        });
      } catch {
      }
    }
  };
}
async function handleSlashCommandAsync(params) {
  const {
    account,
    cfg,
    runtime,
    client,
    commandText,
    channelId,
    senderId,
    senderName,
    teamId,
    kind,
    chatType,
    channelName,
    channelDisplay,
    roomLabel,
    commandAuthorized,
    triggerId,
    log
  } = params;
  const core = getMattermostRuntime();
  const route = core.channel.routing.resolveAgentRoute({
    cfg,
    channel: "mattermost",
    accountId: account.accountId,
    teamId,
    peer: {
      kind,
      id: kind === "direct" ? senderId : channelId
    }
  });
  const fromLabel = kind === "direct" ? `Mattermost DM from ${senderName}` : `Mattermost message in ${roomLabel} from ${senderName}`;
  const to = kind === "direct" ? `user:${senderId}` : `channel:${channelId}`;
  const pickerEntry = resolveMattermostModelPickerEntry(commandText);
  if (pickerEntry) {
    const data = await (0, import_mattermost11.buildModelsProviderData)(cfg, route.agentId);
    if (data.providers.length === 0) {
      await sendMessageMattermost(to, "No models available.", {
        accountId: account.accountId
      });
      return;
    }
    const currentModel = resolveMattermostModelPickerCurrentModel({
      cfg,
      route,
      data
    });
    const view = pickerEntry.kind === "summary" ? renderMattermostModelSummaryView({
      ownerUserId: senderId,
      currentModel
    }) : pickerEntry.kind === "providers" ? renderMattermostProviderPickerView({
      ownerUserId: senderId,
      data,
      currentModel
    }) : renderMattermostModelsPickerView({
      ownerUserId: senderId,
      data,
      provider: pickerEntry.provider,
      page: 1,
      currentModel
    });
    await sendMessageMattermost(to, view.text, {
      accountId: account.accountId,
      buttons: view.buttons
    });
    runtime.log?.(`delivered model picker to ${to}`);
    return;
  }
  const ctxPayload = core.channel.reply.finalizeInboundContext({
    Body: commandText,
    BodyForAgent: commandText,
    RawBody: commandText,
    CommandBody: commandText,
    From: kind === "direct" ? `mattermost:${senderId}` : kind === "group" ? `mattermost:group:${channelId}` : `mattermost:channel:${channelId}`,
    To: to,
    SessionKey: route.sessionKey,
    AccountId: route.accountId,
    ChatType: chatType,
    ConversationLabel: fromLabel,
    GroupSubject: kind !== "direct" ? channelDisplay || roomLabel : void 0,
    SenderName: senderName,
    SenderId: senderId,
    Provider: "mattermost",
    Surface: "mattermost",
    MessageSid: triggerId ?? `slash-${Date.now()}`,
    Timestamp: Date.now(),
    WasMentioned: true,
    CommandAuthorized: commandAuthorized,
    CommandSource: "native",
    OriginatingChannel: "mattermost",
    OriginatingTo: to
  });
  const textLimit = core.channel.text.resolveTextChunkLimit(cfg, "mattermost", account.accountId, {
    fallbackLimit: account.textChunkLimit ?? 4e3
  });
  const tableMode = core.channel.text.resolveMarkdownTableMode({
    cfg,
    channel: "mattermost",
    accountId: account.accountId
  });
  const { onModelSelected, ...prefixOptions } = (0, import_mattermost11.createReplyPrefixOptions)({
    cfg,
    agentId: route.agentId,
    channel: "mattermost",
    accountId: account.accountId
  });
  const typingCallbacks = (0, import_mattermost11.createTypingCallbacks)({
    start: () => sendMattermostTyping(client, { channelId }),
    onStartError: (err) => {
      (0, import_mattermost11.logTypingFailure)({
        log: (message) => log?.(message),
        channel: "mattermost",
        target: channelId,
        error: err
      });
    }
  });
  const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
    ...prefixOptions,
    humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, route.agentId),
    deliver: async (payload) => {
      await deliverMattermostReplyPayload({
        core,
        cfg,
        payload,
        to,
        accountId: account.accountId,
        agentId: route.agentId,
        textLimit,
        tableMode,
        sendMessage: sendMessageMattermost
      });
      runtime.log?.(`delivered slash reply to ${to}`);
    },
    onError: (err, info) => {
      runtime.error?.(`mattermost slash ${info.kind} reply failed: ${String(err)}`);
    },
    onReplyStart: typingCallbacks.onReplyStart
  });
  await core.channel.reply.withReplyDispatcher({
    dispatcher,
    onSettled: () => {
      markDispatchIdle();
    },
    run: () => core.channel.reply.dispatchReplyFromConfig({
      ctx: ctxPayload,
      cfg,
      dispatcher,
      replyOptions: {
        ...replyOptions,
        disableBlockStreaming: typeof account.blockStreaming === "boolean" ? !account.blockStreaming : void 0,
        onModelSelected
      }
    })
  });
}

// src/core/extensions/mattermost/src/mattermost/slash-state.ts
var accountStates = /* @__PURE__ */ new Map();
function resolveSlashHandlerForToken(token) {
  const matches = [];
  for (const [accountId, state] of accountStates) {
    if (state.commandTokens.has(token) && state.handler) {
      matches.push({ accountId, handler: state.handler });
    }
  }
  if (matches.length === 0) {
    return { kind: "none" };
  }
  if (matches.length === 1) {
    return { kind: "single", handler: matches[0].handler, accountIds: [matches[0].accountId] };
  }
  return {
    kind: "ambiguous",
    accountIds: matches.map((entry) => entry.accountId)
  };
}
function getSlashCommandState(accountId) {
  return accountStates.get(accountId) ?? null;
}
function activateSlashCommands(params) {
  const { account, commandTokens, registeredCommands, triggerMap, api, log } = params;
  const accountId = account.accountId;
  const tokenSet = new Set(commandTokens);
  const handler = createSlashCommandHttpHandler({
    account,
    cfg: api.cfg,
    runtime: api.runtime,
    commandTokens: tokenSet,
    triggerMap,
    log
  });
  accountStates.set(accountId, {
    commandTokens: tokenSet,
    registeredCommands,
    handler,
    account,
    triggerMap: triggerMap ?? /* @__PURE__ */ new Map()
  });
  log?.(
    `mattermost: slash commands activated for account ${accountId} (${registeredCommands.length} commands)`
  );
}
function deactivateSlashCommands(accountId) {
  if (accountId) {
    const state = accountStates.get(accountId);
    if (state) {
      state.commandTokens.clear();
      state.registeredCommands = [];
      state.handler = null;
      accountStates.delete(accountId);
    }
  } else {
    for (const [, state] of accountStates) {
      state.commandTokens.clear();
      state.registeredCommands = [];
      state.handler = null;
    }
    accountStates.clear();
  }
}
function registerSlashCommandRoute(api) {
  const mmConfig = api.config.channels?.mattermost;
  const callbackPaths = /* @__PURE__ */ new Set();
  const addCallbackPaths = (raw) => {
    const resolved = resolveSlashCommandConfig(raw);
    callbackPaths.add(resolved.callbackPath);
    if (resolved.callbackUrl) {
      try {
        const urlPath = new URL(resolved.callbackUrl).pathname;
        if (urlPath && urlPath !== resolved.callbackPath) {
          callbackPaths.add(urlPath);
        }
      } catch {
      }
    }
  };
  const commandsRaw = mmConfig?.commands;
  addCallbackPaths(commandsRaw);
  const accountsRaw = mmConfig?.accounts ?? {};
  for (const accountId of Object.keys(accountsRaw)) {
    const accountCfg = accountsRaw[accountId];
    const accountCommandsRaw = accountCfg?.commands;
    addCallbackPaths(accountCommandsRaw);
  }
  const routeHandler = async (req, res) => {
    if (accountStates.size === 0) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          response_type: "ephemeral",
          text: "Slash commands are not yet initialized. Please try again in a moment."
        })
      );
      return;
    }
    if (accountStates.size === 1) {
      const [, state] = [...accountStates.entries()][0];
      if (!state.handler) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            response_type: "ephemeral",
            text: "Slash commands are not yet initialized. Please try again in a moment."
          })
        );
        return;
      }
      await state.handler(req, res);
      return;
    }
    const chunks = [];
    const MAX_BODY = 64 * 1024;
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) {
        res.statusCode = 413;
        res.end("Payload Too Large");
        return;
      }
      chunks.push(chunk);
    }
    const bodyStr = Buffer.concat(chunks).toString("utf8");
    let token = null;
    const ct = req.headers["content-type"] ?? "";
    try {
      if (ct.includes("application/json")) {
        token = JSON.parse(bodyStr).token ?? null;
      } else {
        token = new URLSearchParams(bodyStr).get("token");
      }
    } catch {
    }
    const match = token ? resolveSlashHandlerForToken(token) : { kind: "none" };
    if (match.kind === "none") {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          response_type: "ephemeral",
          text: "Unauthorized: invalid command token."
        })
      );
      return;
    }
    if (match.kind === "ambiguous") {
      api.logger.warn?.(
        `mattermost: slash callback token matched multiple accounts (${match.accountIds?.join(", ")})`
      );
      res.statusCode = 409;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          response_type: "ephemeral",
          text: "Conflict: command token is not unique across accounts."
        })
      );
      return;
    }
    const matchedHandler = match.handler;
    const { Readable } = await import("node:stream");
    const syntheticReq = new Readable({
      read() {
        this.push(Buffer.from(bodyStr, "utf8"));
        this.push(null);
      }
    });
    syntheticReq.method = req.method;
    syntheticReq.url = req.url;
    syntheticReq.headers = req.headers;
    await matchedHandler(syntheticReq, res);
  };
  for (const callbackPath of callbackPaths) {
    api.registerHttpRoute({
      path: callbackPath,
      auth: "plugin",
      handler: routeHandler
    });
    api.logger.info?.(`mattermost: registered slash command callback at ${callbackPath}`);
  }
}

// src/core/extensions/mattermost/src/mattermost/monitor.ts
var RECENT_MATTERMOST_MESSAGE_TTL_MS = 5 * 6e4;
var RECENT_MATTERMOST_MESSAGE_MAX = 2e3;
var CHANNEL_CACHE_TTL_MS = 5 * 6e4;
var USER_CACHE_TTL_MS = 10 * 6e4;
function isLoopbackHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}
function normalizeInteractionSourceIps(values) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}
var recentInboundMessages = (0, import_mattermost8.createDedupeCache)({
  ttlMs: RECENT_MATTERMOST_MESSAGE_TTL_MS,
  maxSize: RECENT_MATTERMOST_MESSAGE_MAX
});
function resolveRuntime(opts) {
  return opts.runtime ?? {
    log: console.log,
    error: console.error,
    exit: (code) => {
      throw new Error(`exit ${code}`);
    }
  };
}
function isSystemPost(post) {
  const type = post.type?.trim();
  return Boolean(type);
}
function mapMattermostChannelTypeToChatType(channelType) {
  if (!channelType) {
    return "channel";
  }
  const normalized = channelType.trim().toUpperCase();
  if (normalized === "D") {
    return "direct";
  }
  if (normalized === "G") {
    return "group";
  }
  if (normalized === "P") {
    return "group";
  }
  return "channel";
}
function channelChatType(kind) {
  if (kind === "direct") {
    return "direct";
  }
  if (kind === "group") {
    return "group";
  }
  return "channel";
}
function evaluateMattermostMentionGate(params) {
  const shouldRequireMention = params.kind !== "direct" && params.resolveRequireMention({
    cfg: params.cfg,
    channel: "mattermost",
    accountId: params.accountId,
    groupId: params.channelId,
    requireMentionOverride: params.requireMentionOverride
  });
  const shouldBypassMention = params.isControlCommand && shouldRequireMention && !params.wasMentioned && params.commandAuthorized;
  const effectiveWasMentioned = params.wasMentioned || shouldBypassMention || params.oncharTriggered;
  if (params.oncharEnabled && !params.oncharTriggered && !params.wasMentioned && !params.isControlCommand) {
    return {
      shouldRequireMention,
      shouldBypassMention,
      effectiveWasMentioned,
      dropReason: "onchar-not-triggered"
    };
  }
  if (params.kind !== "direct" && shouldRequireMention && params.canDetectMention && !effectiveWasMentioned) {
    return {
      shouldRequireMention,
      shouldBypassMention,
      effectiveWasMentioned,
      dropReason: "missing-mention"
    };
  }
  return {
    shouldRequireMention,
    shouldBypassMention,
    effectiveWasMentioned,
    dropReason: null
  };
}
function resolveMattermostReplyRootId(params) {
  const threadRootId = params.threadRootId?.trim();
  if (threadRootId) {
    return threadRootId;
  }
  return params.replyToId?.trim() || void 0;
}
function resolveMattermostEffectiveReplyToId(params) {
  const threadRootId = params.threadRootId?.trim();
  if (threadRootId) {
    return threadRootId;
  }
  if (params.kind === "direct") {
    return void 0;
  }
  const postId = params.postId?.trim();
  if (!postId) {
    return void 0;
  }
  return params.replyToMode === "all" || params.replyToMode === "first" ? postId : void 0;
}
function resolveMattermostThreadSessionContext(params) {
  const effectiveReplyToId = resolveMattermostEffectiveReplyToId({
    kind: params.kind,
    postId: params.postId,
    replyToMode: params.replyToMode,
    threadRootId: params.threadRootId
  });
  const threadKeys = resolveThreadSessionKeys({
    baseSessionKey: params.baseSessionKey,
    threadId: effectiveReplyToId,
    parentSessionKey: effectiveReplyToId ? params.baseSessionKey : void 0
  });
  return {
    effectiveReplyToId,
    sessionKey: threadKeys.sessionKey,
    parentSessionKey: threadKeys.parentSessionKey
  };
}
function buildMattermostAttachmentPlaceholder(mediaList) {
  if (mediaList.length === 0) {
    return "";
  }
  if (mediaList.length === 1) {
    const kind = mediaList[0].kind === "unknown" ? "document" : mediaList[0].kind;
    return `<media:${kind}>`;
  }
  const allImages = mediaList.every((media) => media.kind === "image");
  const label = allImages ? "image" : "file";
  const suffix = mediaList.length === 1 ? label : `${label}s`;
  const tag = allImages ? "<media:image>" : "<media:document>";
  return `${tag} (${mediaList.length} ${suffix})`;
}
function buildMattermostWsUrl(baseUrl) {
  const normalized = normalizeMattermostBaseUrl(baseUrl);
  if (!normalized) {
    throw new Error("Mattermost baseUrl is required");
  }
  const wsBase = normalized.replace(/^http/i, "ws");
  return `${wsBase}/api/v4/websocket`;
}
async function monitorMattermostProvider(opts = {}) {
  const core = getMattermostRuntime();
  const runtime = resolveRuntime(opts);
  const cfg = opts.config ?? core.config.loadConfig();
  const account = resolveMattermostAccount({
    cfg,
    accountId: opts.accountId
  });
  const pairing = (0, import_mattermost12.createScopedPairingAccess)({
    core,
    channel: "mattermost",
    accountId: account.accountId
  });
  const allowNameMatching = (0, import_mattermost12.isDangerousNameMatchingEnabled)(account.config);
  const botToken = opts.botToken?.trim() || account.botToken?.trim();
  if (!botToken) {
    throw new Error(
      `Mattermost bot token missing for account "${account.accountId}" (set channels.mattermost.accounts.${account.accountId}.botToken or MATTERMOST_BOT_TOKEN for default).`
    );
  }
  const baseUrl = normalizeMattermostBaseUrl(opts.baseUrl ?? account.baseUrl);
  if (!baseUrl) {
    throw new Error(
      `Mattermost baseUrl missing for account "${account.accountId}" (set channels.mattermost.accounts.${account.accountId}.baseUrl or MATTERMOST_URL for default).`
    );
  }
  const client = createMattermostClient({ baseUrl, botToken });
  const botUser = await fetchMattermostMe(client);
  const botUserId = botUser.id;
  const botUsername = botUser.username?.trim() || void 0;
  runtime.log?.(`mattermost connected as ${botUsername ? `@${botUsername}` : botUserId}`);
  const commandsRaw = account.config.commands;
  const slashConfig = resolveSlashCommandConfig(commandsRaw);
  const slashEnabled = isSlashCommandsEnabled(slashConfig);
  if (slashEnabled) {
    try {
      const teams = await fetchMattermostUserTeams(client, botUserId);
      const envPortRaw = process.env.MUSTB_GATEWAY_PORT?.trim();
      const envPort = (0, import_mattermost12.parseStrictPositiveInteger)(envPortRaw);
      const slashGatewayPort = envPort ?? cfg.gateway?.port ?? 18789;
      const slashCallbackUrl = resolveCallbackUrl({
        config: slashConfig,
        gatewayPort: slashGatewayPort,
        gatewayHost: cfg.gateway?.customBindHost ?? void 0
      });
      try {
        const mmHost = new URL(baseUrl).hostname;
        const callbackHost = new URL(slashCallbackUrl).hostname;
        if (isLoopbackHost(callbackHost) && !isLoopbackHost(mmHost)) {
          runtime.error?.(
            `mattermost: slash commands callbackUrl resolved to ${slashCallbackUrl} (loopback) while baseUrl is ${baseUrl}. This MAY be unreachable depending on your deployment. If native slash commands don't work, set channels.mattermost.commands.callbackUrl to a URL reachable from the Mattermost server (e.g. your public reverse proxy URL).`
          );
        }
      } catch {
      }
      const commandsToRegister = [
        ...DEFAULT_COMMAND_SPECS
      ];
      if (slashConfig.nativeSkills === true) {
        try {
          const skillCommands = (0, import_mattermost12.listSkillCommandsForAgents)({ cfg });
          for (const spec of skillCommands) {
            const name = typeof spec.name === "string" ? spec.name.trim() : "";
            if (!name) continue;
            const trigger = name.startsWith("oc_") ? name : `oc_${name}`;
            commandsToRegister.push({
              trigger,
              description: spec.description || `Run skill ${name}`,
              autoComplete: true,
              autoCompleteHint: "[args]",
              originalName: name
            });
          }
        } catch (err) {
          runtime.error?.(`mattermost: failed to list skill commands: ${String(err)}`);
        }
      }
      const seen = /* @__PURE__ */ new Set();
      const dedupedCommands = commandsToRegister.filter((cmd) => {
        const key = cmd.trigger.trim();
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const allRegistered = [];
      let teamRegistrationFailures = 0;
      for (const team of teams) {
        try {
          const registered = await registerSlashCommands({
            client,
            teamId: team.id,
            creatorUserId: botUserId,
            callbackUrl: slashCallbackUrl,
            commands: dedupedCommands,
            log: (msg) => runtime.log?.(msg)
          });
          allRegistered.push(...registered);
        } catch (err) {
          teamRegistrationFailures += 1;
          runtime.error?.(
            `mattermost: failed to register slash commands for team ${team.id}: ${String(err)}`
          );
        }
      }
      if (allRegistered.length === 0) {
        runtime.error?.(
          "mattermost: native slash commands enabled but no commands could be registered; keeping slash callbacks inactive"
        );
      } else {
        if (teamRegistrationFailures > 0) {
          runtime.error?.(
            `mattermost: slash command registration completed with ${teamRegistrationFailures} team error(s)`
          );
        }
        const triggerMap = /* @__PURE__ */ new Map();
        for (const cmd of dedupedCommands) {
          if (cmd.originalName) {
            triggerMap.set(cmd.trigger, cmd.originalName);
          }
        }
        activateSlashCommands({
          account,
          commandTokens: allRegistered.map((cmd) => cmd.token).filter(Boolean),
          registeredCommands: allRegistered,
          triggerMap,
          api: { cfg, runtime },
          log: (msg) => runtime.log?.(msg)
        });
        runtime.log?.(
          `mattermost: slash commands registered (${allRegistered.length} commands across ${teams.length} teams, callback=${slashCallbackUrl})`
        );
      }
    } catch (err) {
      runtime.error?.(`mattermost: failed to register slash commands: ${String(err)}`);
    }
  }
  setInteractionSecret(account.accountId, botToken);
  const interactionPath = resolveInteractionCallbackPath(account.accountId);
  const callbackUrl = computeInteractionCallbackUrl(account.accountId, {
    gateway: cfg.gateway,
    interactions: account.config.interactions
  });
  setInteractionCallbackUrl(account.accountId, callbackUrl);
  const allowedInteractionSourceIps = normalizeInteractionSourceIps(
    account.config.interactions?.allowedSourceIps
  );
  try {
    const mmHost = new URL(baseUrl).hostname;
    const callbackHost = new URL(callbackUrl).hostname;
    if (isLoopbackHost(callbackHost) && !isLoopbackHost(mmHost)) {
      runtime.error?.(
        `mattermost: interactions callbackUrl resolved to ${callbackUrl} (loopback) while baseUrl is ${baseUrl}. This MAY be unreachable depending on your deployment. If button clicks don't work, set channels.mattermost.interactions.callbackBaseUrl to a URL reachable from the Mattermost server (e.g. your public reverse proxy URL).`
      );
    }
    if (!isLoopbackHost(callbackHost) && allowedInteractionSourceIps.length === 0) {
      runtime.error?.(
        `mattermost: interactions callbackUrl resolved to ${callbackUrl} without channels.mattermost.interactions.allowedSourceIps. For safety, non-loopback callback sources will be rejected until you allowlist the Mattermost server or trusted ingress IPs.`
      );
    }
  } catch {
  }
  const effectiveInteractionSourceIps = allowedInteractionSourceIps.length > 0 ? allowedInteractionSourceIps : ["127.0.0.1", "::1"];
  const unregisterInteractions = (0, import_mattermost12.registerPluginHttpRoute)({
    path: interactionPath,
    fallbackPath: "/mattermost/interactions/default",
    auth: "plugin",
    handler: createMattermostInteractionHandler({
      client,
      botUserId,
      accountId: account.accountId,
      allowedSourceIps: effectiveInteractionSourceIps,
      trustedProxies: cfg.gateway?.trustedProxies,
      allowRealIpFallback: cfg.gateway?.allowRealIpFallback === true,
      handleInteraction: handleModelPickerInteraction,
      resolveSessionKey: async ({ channelId, userId, post }) => {
        const channelInfo = await resolveChannelInfo(channelId);
        const kind = mapMattermostChannelTypeToChatType(channelInfo?.type);
        const teamId = channelInfo?.team_id ?? void 0;
        const route = core.channel.routing.resolveAgentRoute({
          cfg,
          channel: "mattermost",
          accountId: account.accountId,
          teamId,
          peer: {
            kind,
            id: kind === "direct" ? userId : channelId
          }
        });
        const replyToMode = resolveMattermostReplyToMode(account, kind);
        return resolveMattermostThreadSessionContext({
          baseSessionKey: route.sessionKey,
          kind,
          postId: post.id || void 0,
          replyToMode,
          threadRootId: post.root_id
        }).sessionKey;
      },
      dispatchButtonClick: async (opts2) => {
        const channelInfo = await resolveChannelInfo(opts2.channelId);
        const kind = mapMattermostChannelTypeToChatType(channelInfo?.type);
        const chatType = channelChatType(kind);
        const teamId = channelInfo?.team_id ?? void 0;
        const channelName = channelInfo?.name ?? void 0;
        const channelDisplay = channelInfo?.display_name ?? channelName ?? opts2.channelId;
        const route = core.channel.routing.resolveAgentRoute({
          cfg,
          channel: "mattermost",
          accountId: account.accountId,
          teamId,
          peer: {
            kind,
            id: kind === "direct" ? opts2.userId : opts2.channelId
          }
        });
        const replyToMode = resolveMattermostReplyToMode(account, kind);
        const threadContext = resolveMattermostThreadSessionContext({
          baseSessionKey: route.sessionKey,
          kind,
          postId: opts2.post.id || opts2.postId,
          replyToMode,
          threadRootId: opts2.post.root_id
        });
        const to = kind === "direct" ? `user:${opts2.userId}` : `channel:${opts2.channelId}`;
        const bodyText = `[Button click: user @${opts2.userName} selected "${opts2.actionName}"]`;
        const ctxPayload = core.channel.reply.finalizeInboundContext({
          Body: bodyText,
          BodyForAgent: bodyText,
          RawBody: bodyText,
          CommandBody: bodyText,
          From: kind === "direct" ? `mattermost:${opts2.userId}` : kind === "group" ? `mattermost:group:${opts2.channelId}` : `mattermost:channel:${opts2.channelId}`,
          To: to,
          SessionKey: threadContext.sessionKey,
          ParentSessionKey: threadContext.parentSessionKey,
          AccountId: route.accountId,
          ChatType: chatType,
          ConversationLabel: `mattermost:${opts2.userName}`,
          GroupSubject: kind !== "direct" ? channelDisplay : void 0,
          GroupChannel: channelName ? `#${channelName}` : void 0,
          GroupSpace: teamId,
          SenderName: opts2.userName,
          SenderId: opts2.userId,
          Provider: "mattermost",
          Surface: "mattermost",
          MessageSid: `interaction:${opts2.postId}:${opts2.actionId}`,
          ReplyToId: threadContext.effectiveReplyToId,
          MessageThreadId: threadContext.effectiveReplyToId,
          WasMentioned: true,
          CommandAuthorized: false,
          OriginatingChannel: "mattermost",
          OriginatingTo: to
        });
        const textLimit = core.channel.text.resolveTextChunkLimit(
          cfg,
          "mattermost",
          account.accountId,
          { fallbackLimit: account.textChunkLimit ?? 4e3 }
        );
        const tableMode = core.channel.text.resolveMarkdownTableMode({
          cfg,
          channel: "mattermost",
          accountId: account.accountId
        });
        const { onModelSelected, ...prefixOptions } = (0, import_mattermost12.createReplyPrefixOptions)({
          cfg,
          agentId: route.agentId,
          channel: "mattermost",
          accountId: account.accountId
        });
        const typingCallbacks = (0, import_mattermost12.createTypingCallbacks)({
          start: () => sendTypingIndicator(opts2.channelId, threadContext.effectiveReplyToId),
          onStartError: (err) => {
            (0, import_mattermost12.logTypingFailure)({
              log: (message) => logger.debug?.(message),
              channel: "mattermost",
              target: opts2.channelId,
              error: err
            });
          }
        });
        const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
          ...prefixOptions,
          humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, route.agentId),
          deliver: async (payload) => {
            await deliverMattermostReplyPayload({
              core,
              cfg,
              payload,
              to,
              accountId: account.accountId,
              agentId: route.agentId,
              replyToId: resolveMattermostReplyRootId({
                threadRootId: threadContext.effectiveReplyToId,
                replyToId: payload.replyToId
              }),
              textLimit,
              tableMode,
              sendMessage: sendMessageMattermost
            });
            runtime.log?.(`delivered button-click reply to ${to}`);
          },
          onError: (err, info) => {
            runtime.error?.(`mattermost button-click ${info.kind} reply failed: ${String(err)}`);
          },
          onReplyStart: typingCallbacks.onReplyStart
        });
        await core.channel.reply.dispatchReplyFromConfig({
          ctx: ctxPayload,
          cfg,
          dispatcher,
          replyOptions: {
            ...replyOptions,
            disableBlockStreaming: typeof account.blockStreaming === "boolean" ? !account.blockStreaming : void 0,
            onModelSelected
          }
        });
        markDispatchIdle();
      },
      log: (msg) => runtime.log?.(msg)
    }),
    pluginId: "mattermost",
    source: "mattermost-interactions",
    accountId: account.accountId,
    log: (msg) => runtime.log?.(msg)
  });
  const channelCache = /* @__PURE__ */ new Map();
  const userCache = /* @__PURE__ */ new Map();
  const logger = core.logging.getChildLogger({ module: "mattermost" });
  const logVerboseMessage = (message) => {
    if (!core.logging.shouldLogVerbose()) {
      return;
    }
    logger.debug?.(message);
  };
  const mediaMaxBytes = (0, import_mattermost12.resolveChannelMediaMaxBytes)({
    cfg,
    resolveChannelLimitMb: () => void 0,
    accountId: account.accountId
  }) ?? 8 * 1024 * 1024;
  const historyLimit = Math.max(
    0,
    cfg.messages?.groupChat?.historyLimit ?? import_mattermost12.DEFAULT_GROUP_HISTORY_LIMIT
  );
  const channelHistories = /* @__PURE__ */ new Map();
  const defaultGroupPolicy = (0, import_mattermost12.resolveDefaultGroupPolicy)(cfg);
  const { groupPolicy, providerMissingFallbackApplied } = (0, import_mattermost12.resolveAllowlistProviderRuntimeGroupPolicy)({
    providerConfigPresent: cfg.channels?.mattermost !== void 0,
    groupPolicy: account.config.groupPolicy,
    defaultGroupPolicy
  });
  (0, import_mattermost12.warnMissingProviderGroupPolicyFallbackOnce)({
    providerMissingFallbackApplied,
    providerKey: "mattermost",
    accountId: account.accountId,
    log: (message) => logVerboseMessage(message)
  });
  const resolveMattermostMedia = async (fileIds) => {
    const ids = (fileIds ?? []).map((id) => id?.trim()).filter(Boolean);
    if (ids.length === 0) {
      return [];
    }
    const out = [];
    for (const fileId of ids) {
      try {
        const fetched = await core.channel.media.fetchRemoteMedia({
          url: `${client.apiBaseUrl}/files/${fileId}`,
          requestInit: {
            headers: {
              Authorization: `Bearer ${client.token}`
            }
          },
          filePathHint: fileId,
          maxBytes: mediaMaxBytes,
          // Allow fetching from the Mattermost server host (may be localhost or
          // a private IP). Without this, SSRF guards block media downloads.
          // Credit: #22594 (@webclerk)
          ssrfPolicy: { allowedHostnames: [new URL(client.baseUrl).hostname] }
        });
        const saved = await core.channel.media.saveMediaBuffer(
          fetched.buffer,
          fetched.contentType ?? void 0,
          "inbound",
          mediaMaxBytes
        );
        const contentType = saved.contentType ?? fetched.contentType ?? void 0;
        out.push({
          path: saved.path,
          contentType,
          kind: core.media.mediaKindFromMime(contentType) ?? "unknown"
        });
      } catch (err) {
        logger.debug?.(`mattermost: failed to download file ${fileId}: ${String(err)}`);
      }
    }
    return out;
  };
  const sendTypingIndicator = async (channelId, parentId) => {
    await sendMattermostTyping(client, { channelId, parentId });
  };
  const resolveChannelInfo = async (channelId) => {
    const cached = channelCache.get(channelId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    try {
      const info = await fetchMattermostChannel(client, channelId);
      channelCache.set(channelId, {
        value: info,
        expiresAt: Date.now() + CHANNEL_CACHE_TTL_MS
      });
      return info;
    } catch (err) {
      logger.debug?.(`mattermost: channel lookup failed: ${String(err)}`);
      channelCache.set(channelId, {
        value: null,
        expiresAt: Date.now() + CHANNEL_CACHE_TTL_MS
      });
      return null;
    }
  };
  const resolveUserInfo = async (userId) => {
    const cached = userCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    try {
      const info = await fetchMattermostUser(client, userId);
      userCache.set(userId, {
        value: info,
        expiresAt: Date.now() + USER_CACHE_TTL_MS
      });
      return info;
    } catch (err) {
      logger.debug?.(`mattermost: user lookup failed: ${String(err)}`);
      userCache.set(userId, {
        value: null,
        expiresAt: Date.now() + USER_CACHE_TTL_MS
      });
      return null;
    }
  };
  const buildModelPickerProps = (channelId, buttons) => buildButtonProps({
    callbackUrl,
    accountId: account.accountId,
    channelId,
    buttons
  });
  const updateModelPickerPost = async (params) => {
    const props = buildModelPickerProps(params.channelId, params.buttons ?? []) ?? {
      attachments: []
    };
    await updateMattermostPost(client, params.postId, {
      message: params.message,
      props
    });
    return {};
  };
  const runModelPickerCommand = async (params) => {
    const to = params.kind === "direct" ? `user:${params.senderId}` : `channel:${params.channelId}`;
    const fromLabel = params.kind === "direct" ? `Mattermost DM from ${params.senderName}` : `Mattermost message in ${params.roomLabel} from ${params.senderName}`;
    const ctxPayload = core.channel.reply.finalizeInboundContext({
      Body: params.commandText,
      BodyForAgent: params.commandText,
      RawBody: params.commandText,
      CommandBody: params.commandText,
      From: params.kind === "direct" ? `mattermost:${params.senderId}` : params.kind === "group" ? `mattermost:group:${params.channelId}` : `mattermost:channel:${params.channelId}`,
      To: to,
      SessionKey: params.sessionKey,
      ParentSessionKey: params.parentSessionKey,
      AccountId: params.route.accountId,
      ChatType: params.chatType,
      ConversationLabel: fromLabel,
      GroupSubject: params.kind !== "direct" ? params.channelDisplay || params.roomLabel : void 0,
      GroupChannel: params.channelName ? `#${params.channelName}` : void 0,
      GroupSpace: params.teamId,
      SenderName: params.senderName,
      SenderId: params.senderId,
      Provider: "mattermost",
      Surface: "mattermost",
      MessageSid: `interaction:${params.postId}:${Date.now()}`,
      ReplyToId: params.effectiveReplyToId,
      MessageThreadId: params.effectiveReplyToId,
      Timestamp: Date.now(),
      WasMentioned: true,
      CommandAuthorized: params.commandAuthorized,
      CommandSource: "native",
      OriginatingChannel: "mattermost",
      OriginatingTo: to
    });
    const tableMode = core.channel.text.resolveMarkdownTableMode({
      cfg,
      channel: "mattermost",
      accountId: account.accountId
    });
    const textLimit = core.channel.text.resolveTextChunkLimit(
      cfg,
      "mattermost",
      account.accountId,
      {
        fallbackLimit: account.textChunkLimit ?? 4e3
      }
    );
    const { onModelSelected, ...prefixOptions } = (0, import_mattermost12.createReplyPrefixOptions)({
      cfg,
      agentId: params.route.agentId,
      channel: "mattermost",
      accountId: account.accountId
    });
    const shouldDeliverReplies = params.deliverReplies === true;
    const capturedTexts = [];
    const typingCallbacks = shouldDeliverReplies ? (0, import_mattermost12.createTypingCallbacks)({
      start: () => sendTypingIndicator(params.channelId, params.effectiveReplyToId),
      onStartError: (err) => {
        (0, import_mattermost12.logTypingFailure)({
          log: (message) => logger.debug?.(message),
          channel: "mattermost",
          target: params.channelId,
          error: err
        });
      }
    }) : void 0;
    const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
      ...prefixOptions,
      // Picker-triggered confirmations should stay immediate.
      deliver: async (payload) => {
        const trimmedPayload = {
          ...payload,
          text: core.channel.text.convertMarkdownTables(payload.text ?? "", tableMode).trim()
        };
        if (!shouldDeliverReplies) {
          if (trimmedPayload.text) {
            capturedTexts.push(trimmedPayload.text);
          }
          return;
        }
        await deliverMattermostReplyPayload({
          core,
          cfg,
          payload: trimmedPayload,
          to,
          accountId: account.accountId,
          agentId: params.route.agentId,
          replyToId: resolveMattermostReplyRootId({
            threadRootId: params.effectiveReplyToId,
            replyToId: trimmedPayload.replyToId
          }),
          textLimit,
          // The picker path already converts and trims text before capture/delivery.
          tableMode: "off",
          sendMessage: sendMessageMattermost
        });
      },
      onError: (err, info) => {
        runtime.error?.(`mattermost model picker ${info.kind} reply failed: ${String(err)}`);
      },
      onReplyStart: typingCallbacks?.onReplyStart
    });
    await core.channel.reply.withReplyDispatcher({
      dispatcher,
      onSettled: () => {
        markDispatchIdle();
      },
      run: () => core.channel.reply.dispatchReplyFromConfig({
        ctx: ctxPayload,
        cfg,
        dispatcher,
        replyOptions: {
          ...replyOptions,
          disableBlockStreaming: typeof account.blockStreaming === "boolean" ? !account.blockStreaming : void 0,
          onModelSelected
        }
      })
    });
    return capturedTexts.join("\n\n").trim();
  };
  async function handleModelPickerInteraction(params) {
    const pickerState = parseMattermostModelPickerContext(params.context);
    if (!pickerState) {
      return null;
    }
    if (pickerState.ownerUserId !== params.payload.user_id) {
      return {
        ephemeral_text: "Only the person who opened this picker can use it."
      };
    }
    const channelInfo = await resolveChannelInfo(params.payload.channel_id);
    const pickerCommandText = pickerState.action === "select" ? `/model ${pickerState.provider}/${pickerState.model}` : pickerState.action === "list" ? `/models ${pickerState.provider}` : "/models";
    const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
      cfg,
      surface: "mattermost"
    });
    const hasControlCommand = core.channel.text.hasControlCommand(pickerCommandText, cfg);
    const dmPolicy = account.config.dmPolicy ?? "pairing";
    const storeAllowFrom = normalizeMattermostAllowList(
      await (0, import_mattermost12.readStoreAllowFromForDmPolicy)({
        provider: "mattermost",
        accountId: account.accountId,
        dmPolicy,
        readStore: pairing.readStoreForDmPolicy
      })
    );
    const auth = authorizeMattermostCommandInvocation({
      account,
      cfg,
      senderId: params.payload.user_id,
      senderName: params.userName,
      channelId: params.payload.channel_id,
      channelInfo,
      storeAllowFrom,
      allowTextCommands,
      hasControlCommand
    });
    if (!auth.ok) {
      if (auth.denyReason === "dm-pairing") {
        const { code } = await pairing.upsertPairingRequest({
          id: params.payload.user_id,
          meta: { name: params.userName }
        });
        return {
          ephemeral_text: core.channel.pairing.buildPairingReply({
            channel: "mattermost",
            idLine: `Your Mattermost user id: ${params.payload.user_id}`,
            code
          })
        };
      }
      const denyText = auth.denyReason === "unknown-channel" ? "Temporary error: unable to determine channel type. Please try again." : auth.denyReason === "dm-disabled" ? "This bot is not accepting direct messages." : auth.denyReason === "channels-disabled" ? "Model picker actions are disabled in channels." : auth.denyReason === "channel-no-allowlist" ? "Model picker actions are not configured for this channel." : "Unauthorized.";
      return {
        ephemeral_text: denyText
      };
    }
    const kind = auth.kind;
    const chatType = auth.chatType;
    const teamId = auth.channelInfo.team_id ?? params.payload.team_id ?? void 0;
    const channelName = auth.channelName || void 0;
    const channelDisplay = auth.channelDisplay || auth.channelName || params.payload.channel_id;
    const roomLabel = auth.roomLabel;
    const route = core.channel.routing.resolveAgentRoute({
      cfg,
      channel: "mattermost",
      accountId: account.accountId,
      teamId,
      peer: {
        kind,
        id: kind === "direct" ? params.payload.user_id : params.payload.channel_id
      }
    });
    const replyToMode = resolveMattermostReplyToMode(account, kind);
    const threadContext = resolveMattermostThreadSessionContext({
      baseSessionKey: route.sessionKey,
      kind,
      postId: params.post.id || params.payload.post_id,
      replyToMode,
      threadRootId: params.post.root_id
    });
    const modelSessionRoute = {
      agentId: route.agentId,
      sessionKey: threadContext.sessionKey
    };
    const data = await (0, import_mattermost12.buildModelsProviderData)(cfg, route.agentId);
    if (data.providers.length === 0) {
      return await updateModelPickerPost({
        channelId: params.payload.channel_id,
        postId: params.payload.post_id,
        message: "No models available."
      });
    }
    if (pickerState.action === "providers" || pickerState.action === "back") {
      const currentModel = resolveMattermostModelPickerCurrentModel({
        cfg,
        route: modelSessionRoute,
        data
      });
      const view = renderMattermostProviderPickerView({
        ownerUserId: pickerState.ownerUserId,
        data,
        currentModel
      });
      return await updateModelPickerPost({
        channelId: params.payload.channel_id,
        postId: params.payload.post_id,
        message: view.text,
        buttons: view.buttons
      });
    }
    if (pickerState.action === "list") {
      const currentModel = resolveMattermostModelPickerCurrentModel({
        cfg,
        route: modelSessionRoute,
        data
      });
      const view = renderMattermostModelsPickerView({
        ownerUserId: pickerState.ownerUserId,
        data,
        provider: pickerState.provider,
        page: pickerState.page,
        currentModel
      });
      return await updateModelPickerPost({
        channelId: params.payload.channel_id,
        postId: params.payload.post_id,
        message: view.text,
        buttons: view.buttons
      });
    }
    const targetModelRef = `${pickerState.provider}/${pickerState.model}`;
    if (!buildMattermostAllowedModelRefs(data).has(targetModelRef)) {
      return {
        ephemeral_text: `That model is no longer available: ${targetModelRef}`
      };
    }
    void (async () => {
      try {
        await runModelPickerCommand({
          commandText: `/model ${targetModelRef}`,
          commandAuthorized: auth.commandAuthorized,
          route,
          sessionKey: threadContext.sessionKey,
          parentSessionKey: threadContext.parentSessionKey,
          channelId: params.payload.channel_id,
          senderId: params.payload.user_id,
          senderName: params.userName,
          kind,
          chatType,
          channelName,
          channelDisplay,
          roomLabel,
          teamId,
          postId: params.payload.post_id,
          effectiveReplyToId: threadContext.effectiveReplyToId,
          deliverReplies: true
        });
        const updatedModel = resolveMattermostModelPickerCurrentModel({
          cfg,
          route: modelSessionRoute,
          data,
          skipCache: true
        });
        const view = renderMattermostModelsPickerView({
          ownerUserId: pickerState.ownerUserId,
          data,
          provider: pickerState.provider,
          page: pickerState.page,
          currentModel: updatedModel
        });
        await updateModelPickerPost({
          channelId: params.payload.channel_id,
          postId: params.payload.post_id,
          message: view.text,
          buttons: view.buttons
        });
      } catch (err) {
        runtime.error?.(`mattermost model picker select failed: ${String(err)}`);
      }
    })();
    return {};
  }
  const handlePost = async (post, payload, messageIds) => {
    const channelId = post.channel_id ?? payload.data?.channel_id ?? payload.broadcast?.channel_id;
    if (!channelId) {
      logVerboseMessage("mattermost: drop post (missing channel id)");
      return;
    }
    const allMessageIds = messageIds?.length ? messageIds : post.id ? [post.id] : [];
    if (allMessageIds.length === 0) {
      logVerboseMessage("mattermost: drop post (missing message id)");
      return;
    }
    const dedupeEntries = allMessageIds.map(
      (id) => recentInboundMessages.check(`${account.accountId}:${id}`)
    );
    if (dedupeEntries.length > 0 && dedupeEntries.every(Boolean)) {
      logVerboseMessage(
        `mattermost: drop post (dedupe account=${account.accountId} ids=${allMessageIds.length})`
      );
      return;
    }
    const senderId = post.user_id ?? payload.broadcast?.user_id;
    if (!senderId) {
      logVerboseMessage("mattermost: drop post (missing sender id)");
      return;
    }
    if (senderId === botUserId) {
      logVerboseMessage(`mattermost: drop post (self sender=${senderId})`);
      return;
    }
    if (isSystemPost(post)) {
      logVerboseMessage(`mattermost: drop post (system post type=${post.type ?? "unknown"})`);
      return;
    }
    const channelInfo = await resolveChannelInfo(channelId);
    const channelType = payload.data?.channel_type ?? channelInfo?.type ?? void 0;
    const kind = mapMattermostChannelTypeToChatType(channelType);
    const chatType = channelChatType(kind);
    const senderName = payload.data?.sender_name?.trim() || (await resolveUserInfo(senderId))?.username?.trim() || senderId;
    const rawText = post.message?.trim() || "";
    const dmPolicy = account.config.dmPolicy ?? "pairing";
    const normalizedAllowFrom = normalizeMattermostAllowList(account.config.allowFrom ?? []);
    const normalizedGroupAllowFrom = normalizeMattermostAllowList(
      account.config.groupAllowFrom ?? []
    );
    const storeAllowFrom = normalizeMattermostAllowList(
      await (0, import_mattermost12.readStoreAllowFromForDmPolicy)({
        provider: "mattermost",
        accountId: account.accountId,
        dmPolicy,
        readStore: pairing.readStoreForDmPolicy
      })
    );
    const accessDecision = (0, import_mattermost12.resolveDmGroupAccessWithLists)({
      isGroup: kind !== "direct",
      dmPolicy,
      groupPolicy,
      allowFrom: normalizedAllowFrom,
      groupAllowFrom: normalizedGroupAllowFrom,
      storeAllowFrom,
      isSenderAllowed: (allowFrom) => isMattermostSenderAllowed({
        senderId,
        senderName,
        allowFrom,
        allowNameMatching
      })
    });
    const effectiveAllowFrom = accessDecision.effectiveAllowFrom;
    const effectiveGroupAllowFrom = accessDecision.effectiveGroupAllowFrom;
    const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
      cfg,
      surface: "mattermost"
    });
    const hasControlCommand = core.channel.text.hasControlCommand(rawText, cfg);
    const isControlCommand = allowTextCommands && hasControlCommand;
    const useAccessGroups = cfg.commands?.useAccessGroups !== false;
    const commandDmAllowFrom = kind === "direct" ? effectiveAllowFrom : normalizedAllowFrom;
    const senderAllowedForCommands = isMattermostSenderAllowed({
      senderId,
      senderName,
      allowFrom: commandDmAllowFrom,
      allowNameMatching
    });
    const groupAllowedForCommands = isMattermostSenderAllowed({
      senderId,
      senderName,
      allowFrom: effectiveGroupAllowFrom,
      allowNameMatching
    });
    const commandGate = (0, import_mattermost12.resolveControlCommandGate)({
      useAccessGroups,
      authorizers: [
        { configured: commandDmAllowFrom.length > 0, allowed: senderAllowedForCommands },
        {
          configured: effectiveGroupAllowFrom.length > 0,
          allowed: groupAllowedForCommands
        }
      ],
      allowTextCommands,
      hasControlCommand
    });
    const commandAuthorized = commandGate.commandAuthorized;
    if (accessDecision.decision !== "allow") {
      if (kind === "direct") {
        if (accessDecision.reasonCode === import_mattermost12.DM_GROUP_ACCESS_REASON.DM_POLICY_DISABLED) {
          logVerboseMessage(`mattermost: drop dm (dmPolicy=disabled sender=${senderId})`);
          return;
        }
        if (accessDecision.decision === "pairing") {
          const { code, created } = await pairing.upsertPairingRequest({
            id: senderId,
            meta: { name: senderName }
          });
          logVerboseMessage(`mattermost: pairing request sender=${senderId} created=${created}`);
          if (created) {
            try {
              await sendMessageMattermost(
                `user:${senderId}`,
                core.channel.pairing.buildPairingReply({
                  channel: "mattermost",
                  idLine: `Your Mattermost user id: ${senderId}`,
                  code
                }),
                { accountId: account.accountId }
              );
              opts.statusSink?.({ lastOutboundAt: Date.now() });
            } catch (err) {
              logVerboseMessage(`mattermost: pairing reply failed for ${senderId}: ${String(err)}`);
            }
          }
          return;
        }
        logVerboseMessage(`mattermost: drop dm sender=${senderId} (dmPolicy=${dmPolicy})`);
        return;
      }
      if (accessDecision.reasonCode === import_mattermost12.DM_GROUP_ACCESS_REASON.GROUP_POLICY_DISABLED) {
        logVerboseMessage("mattermost: drop group message (groupPolicy=disabled)");
        return;
      }
      if (accessDecision.reasonCode === import_mattermost12.DM_GROUP_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST) {
        logVerboseMessage("mattermost: drop group message (no group allowlist)");
        return;
      }
      if (accessDecision.reasonCode === import_mattermost12.DM_GROUP_ACCESS_REASON.GROUP_POLICY_NOT_ALLOWLISTED) {
        logVerboseMessage(`mattermost: drop group sender=${senderId} (not in groupAllowFrom)`);
        return;
      }
      logVerboseMessage(
        `mattermost: drop group message (groupPolicy=${groupPolicy} reason=${accessDecision.reason})`
      );
      return;
    }
    if (kind !== "direct" && commandGate.shouldBlock) {
      (0, import_mattermost12.logInboundDrop)({
        log: logVerboseMessage,
        channel: "mattermost",
        reason: "control command (unauthorized)",
        target: senderId
      });
      return;
    }
    const teamId = payload.data?.team_id ?? channelInfo?.team_id ?? void 0;
    const channelName = payload.data?.channel_name ?? channelInfo?.name ?? "";
    const channelDisplay = payload.data?.channel_display_name ?? channelInfo?.display_name ?? channelName;
    const roomLabel = channelName ? `#${channelName}` : channelDisplay || `#${channelId}`;
    const route = core.channel.routing.resolveAgentRoute({
      cfg,
      channel: "mattermost",
      accountId: account.accountId,
      teamId,
      peer: {
        kind,
        id: kind === "direct" ? senderId : channelId
      }
    });
    const baseSessionKey = route.sessionKey;
    const threadRootId = post.root_id?.trim() || void 0;
    const replyToMode = resolveMattermostReplyToMode(account, kind);
    const threadContext = resolveMattermostThreadSessionContext({
      baseSessionKey,
      kind,
      postId: post.id,
      replyToMode,
      threadRootId
    });
    const { effectiveReplyToId, sessionKey, parentSessionKey } = threadContext;
    const historyKey = kind === "direct" ? null : sessionKey;
    const mentionRegexes = core.channel.mentions.buildMentionRegexes(cfg, route.agentId);
    const wasMentioned = kind !== "direct" && ((botUsername ? rawText.toLowerCase().includes(`@${botUsername.toLowerCase()}`) : false) || core.channel.mentions.matchesMentionPatterns(rawText, mentionRegexes));
    const pendingBody = rawText || (post.file_ids?.length ? `[Mattermost ${post.file_ids.length === 1 ? "file" : "files"}]` : "");
    const pendingSender = senderName;
    const recordPendingHistory = () => {
      const trimmed = pendingBody.trim();
      (0, import_mattermost12.recordPendingHistoryEntryIfEnabled)({
        historyMap: channelHistories,
        limit: historyLimit,
        historyKey: historyKey ?? "",
        entry: historyKey && trimmed ? {
          sender: pendingSender,
          body: trimmed,
          timestamp: typeof post.create_at === "number" ? post.create_at : void 0,
          messageId: post.id ?? void 0
        } : null
      });
    };
    const oncharEnabled = account.chatmode === "onchar" && kind !== "direct";
    const oncharPrefixes = oncharEnabled ? resolveOncharPrefixes(account.oncharPrefixes) : [];
    const oncharResult = oncharEnabled ? stripOncharPrefix(rawText, oncharPrefixes) : { triggered: false, stripped: rawText };
    const oncharTriggered = oncharResult.triggered;
    const canDetectMention = Boolean(botUsername) || mentionRegexes.length > 0;
    const mentionDecision = evaluateMattermostMentionGate({
      kind,
      cfg,
      accountId: account.accountId,
      channelId,
      threadRootId,
      requireMentionOverride: account.requireMention,
      resolveRequireMention: core.channel.groups.resolveRequireMention,
      wasMentioned,
      isControlCommand,
      commandAuthorized,
      oncharEnabled,
      oncharTriggered,
      canDetectMention
    });
    const { shouldRequireMention, shouldBypassMention } = mentionDecision;
    if (mentionDecision.dropReason === "onchar-not-triggered") {
      logVerboseMessage(
        `mattermost: drop group message (onchar not triggered channel=${channelId} sender=${senderId})`
      );
      recordPendingHistory();
      return;
    }
    if (mentionDecision.dropReason === "missing-mention") {
      logVerboseMessage(
        `mattermost: drop group message (missing mention channel=${channelId} sender=${senderId} requireMention=${shouldRequireMention} bypass=${shouldBypassMention} canDetectMention=${canDetectMention})`
      );
      recordPendingHistory();
      return;
    }
    const mediaList = await resolveMattermostMedia(post.file_ids);
    const mediaPlaceholder = buildMattermostAttachmentPlaceholder(mediaList);
    const bodySource = oncharTriggered ? oncharResult.stripped : rawText;
    const baseText = [bodySource, mediaPlaceholder].filter(Boolean).join("\n").trim();
    const bodyText = normalizeMention(baseText, botUsername);
    if (!bodyText) {
      logVerboseMessage(
        `mattermost: drop group message (empty body after normalization channel=${channelId} sender=${senderId})`
      );
      return;
    }
    core.channel.activity.record({
      channel: "mattermost",
      accountId: account.accountId,
      direction: "inbound"
    });
    const fromLabel = formatInboundFromLabel({
      isGroup: kind !== "direct",
      groupLabel: channelDisplay || roomLabel,
      groupId: channelId,
      groupFallback: roomLabel || "Channel",
      directLabel: senderName,
      directId: senderId
    });
    const preview = bodyText.replace(/\s+/g, " ").slice(0, 160);
    const inboundLabel = kind === "direct" ? `Mattermost DM from ${senderName}` : `Mattermost message in ${roomLabel} from ${senderName}`;
    core.system.enqueueSystemEvent(`${inboundLabel}: ${preview}`, {
      sessionKey,
      contextKey: `mattermost:message:${channelId}:${post.id ?? "unknown"}`
    });
    const textWithId = `${bodyText}
[mattermost message id: ${post.id ?? "unknown"} channel: ${channelId}]`;
    const body = core.channel.reply.formatInboundEnvelope({
      channel: "Mattermost",
      from: fromLabel,
      timestamp: typeof post.create_at === "number" ? post.create_at : void 0,
      body: textWithId,
      chatType,
      sender: { name: senderName, id: senderId }
    });
    let combinedBody = body;
    if (historyKey) {
      combinedBody = (0, import_mattermost12.buildPendingHistoryContextFromMap)({
        historyMap: channelHistories,
        historyKey,
        limit: historyLimit,
        currentMessage: combinedBody,
        formatEntry: (entry) => core.channel.reply.formatInboundEnvelope({
          channel: "Mattermost",
          from: fromLabel,
          timestamp: entry.timestamp,
          body: `${entry.body}${entry.messageId ? ` [id:${entry.messageId} channel:${channelId}]` : ""}`,
          chatType,
          senderLabel: entry.sender
        })
      });
    }
    const to = kind === "direct" ? `user:${senderId}` : `channel:${channelId}`;
    const mediaPayload = (0, import_mattermost12.buildAgentMediaPayload)(mediaList);
    const commandBody = rawText.trim();
    const inboundHistory = historyKey && historyLimit > 0 ? (channelHistories.get(historyKey) ?? []).map((entry) => ({
      sender: entry.sender,
      body: entry.body,
      timestamp: entry.timestamp
    })) : void 0;
    const ctxPayload = core.channel.reply.finalizeInboundContext({
      Body: combinedBody,
      BodyForAgent: bodyText,
      InboundHistory: inboundHistory,
      RawBody: bodyText,
      CommandBody: commandBody,
      BodyForCommands: commandBody,
      From: kind === "direct" ? `mattermost:${senderId}` : kind === "group" ? `mattermost:group:${channelId}` : `mattermost:channel:${channelId}`,
      To: to,
      SessionKey: sessionKey,
      ParentSessionKey: parentSessionKey,
      AccountId: route.accountId,
      ChatType: chatType,
      ConversationLabel: fromLabel,
      GroupSubject: kind !== "direct" ? channelDisplay || roomLabel : void 0,
      GroupChannel: channelName ? `#${channelName}` : void 0,
      GroupSpace: teamId,
      SenderName: senderName,
      SenderId: senderId,
      Provider: "mattermost",
      Surface: "mattermost",
      MessageSid: post.id ?? void 0,
      MessageSids: allMessageIds.length > 1 ? allMessageIds : void 0,
      MessageSidFirst: allMessageIds.length > 1 ? allMessageIds[0] : void 0,
      MessageSidLast: allMessageIds.length > 1 ? allMessageIds[allMessageIds.length - 1] : void 0,
      ReplyToId: effectiveReplyToId,
      MessageThreadId: effectiveReplyToId,
      Timestamp: typeof post.create_at === "number" ? post.create_at : void 0,
      WasMentioned: kind !== "direct" ? mentionDecision.effectiveWasMentioned : void 0,
      CommandAuthorized: commandAuthorized,
      OriginatingChannel: "mattermost",
      OriginatingTo: to,
      ...mediaPayload
    });
    if (kind === "direct") {
      const sessionCfg = cfg.session;
      const storePath = core.channel.session.resolveStorePath(sessionCfg?.store, {
        agentId: route.agentId
      });
      await core.channel.session.updateLastRoute({
        storePath,
        sessionKey: route.mainSessionKey,
        deliveryContext: {
          channel: "mattermost",
          to,
          accountId: route.accountId
        }
      });
    }
    const previewLine = bodyText.slice(0, 200).replace(/\n/g, "\\n");
    logVerboseMessage(
      `mattermost inbound: from=${ctxPayload.From} len=${bodyText.length} preview="${previewLine}"`
    );
    const textLimit = core.channel.text.resolveTextChunkLimit(
      cfg,
      "mattermost",
      account.accountId,
      {
        fallbackLimit: account.textChunkLimit ?? 4e3
      }
    );
    const tableMode = core.channel.text.resolveMarkdownTableMode({
      cfg,
      channel: "mattermost",
      accountId: account.accountId
    });
    const { onModelSelected, ...prefixOptions } = (0, import_mattermost12.createReplyPrefixOptions)({
      cfg,
      agentId: route.agentId,
      channel: "mattermost",
      accountId: account.accountId
    });
    const typingCallbacks = (0, import_mattermost12.createTypingCallbacks)({
      start: () => sendTypingIndicator(channelId, effectiveReplyToId),
      onStartError: (err) => {
        (0, import_mattermost12.logTypingFailure)({
          log: (message) => logger.debug?.(message),
          channel: "mattermost",
          target: channelId,
          error: err
        });
      }
    });
    const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
      ...prefixOptions,
      humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, route.agentId),
      typingCallbacks,
      deliver: async (payload2) => {
        await deliverMattermostReplyPayload({
          core,
          cfg,
          payload: payload2,
          to,
          accountId: account.accountId,
          agentId: route.agentId,
          replyToId: resolveMattermostReplyRootId({
            threadRootId: effectiveReplyToId,
            replyToId: payload2.replyToId
          }),
          textLimit,
          tableMode,
          sendMessage: sendMessageMattermost
        });
        runtime.log?.(`delivered reply to ${to}`);
      },
      onError: (err, info) => {
        runtime.error?.(`mattermost ${info.kind} reply failed: ${String(err)}`);
      }
    });
    await core.channel.reply.withReplyDispatcher({
      dispatcher,
      onSettled: () => {
        markDispatchIdle();
      },
      run: () => core.channel.reply.dispatchReplyFromConfig({
        ctx: ctxPayload,
        cfg,
        dispatcher,
        replyOptions: {
          ...replyOptions,
          disableBlockStreaming: typeof account.blockStreaming === "boolean" ? !account.blockStreaming : void 0,
          onModelSelected
        }
      })
    });
    if (historyKey) {
      (0, import_mattermost12.clearHistoryEntriesIfEnabled)({
        historyMap: channelHistories,
        historyKey,
        limit: historyLimit
      });
    }
  };
  const handleReactionEvent = async (payload) => {
    const reactionData = payload.data?.reaction;
    if (!reactionData) {
      return;
    }
    let reaction = null;
    if (typeof reactionData === "string") {
      try {
        reaction = JSON.parse(reactionData);
      } catch {
        return;
      }
    } else if (typeof reactionData === "object") {
      reaction = reactionData;
    }
    if (!reaction) {
      return;
    }
    const userId = reaction.user_id?.trim();
    const postId = reaction.post_id?.trim();
    const emojiName = reaction.emoji_name?.trim();
    if (!userId || !postId || !emojiName) {
      return;
    }
    if (userId === botUserId) {
      return;
    }
    const isRemoved = payload.event === "reaction_removed";
    const action = isRemoved ? "removed" : "added";
    const senderInfo = await resolveUserInfo(userId);
    const senderName = senderInfo?.username?.trim() || userId;
    const channelId = payload.broadcast?.channel_id;
    if (!channelId) {
      logVerboseMessage(
        `mattermost: drop reaction (no channel_id in broadcast, cannot enforce policy)`
      );
      return;
    }
    const channelInfo = await resolveChannelInfo(channelId);
    if (!channelInfo?.type) {
      logVerboseMessage(`mattermost: drop reaction (cannot resolve channel type for ${channelId})`);
      return;
    }
    const kind = mapMattermostChannelTypeToChatType(channelInfo.type);
    const dmPolicy = account.config.dmPolicy ?? "pairing";
    const storeAllowFrom = normalizeMattermostAllowList(
      await (0, import_mattermost12.readStoreAllowFromForDmPolicy)({
        provider: "mattermost",
        accountId: account.accountId,
        dmPolicy,
        readStore: pairing.readStoreForDmPolicy
      })
    );
    const reactionAccess = (0, import_mattermost12.resolveDmGroupAccessWithLists)({
      isGroup: kind !== "direct",
      dmPolicy,
      groupPolicy,
      allowFrom: normalizeMattermostAllowList(account.config.allowFrom ?? []),
      groupAllowFrom: normalizeMattermostAllowList(account.config.groupAllowFrom ?? []),
      storeAllowFrom,
      isSenderAllowed: (allowFrom) => isMattermostSenderAllowed({
        senderId: userId,
        senderName,
        allowFrom,
        allowNameMatching
      })
    });
    if (reactionAccess.decision !== "allow") {
      if (kind === "direct") {
        logVerboseMessage(
          `mattermost: drop reaction (dmPolicy=${dmPolicy} sender=${userId} reason=${reactionAccess.reason})`
        );
      } else {
        logVerboseMessage(
          `mattermost: drop reaction (groupPolicy=${groupPolicy} sender=${userId} reason=${reactionAccess.reason} channel=${channelId})`
        );
      }
      return;
    }
    const teamId = channelInfo?.team_id ?? void 0;
    const route = core.channel.routing.resolveAgentRoute({
      cfg,
      channel: "mattermost",
      accountId: account.accountId,
      teamId,
      peer: {
        kind,
        id: kind === "direct" ? userId : channelId
      }
    });
    const sessionKey = route.sessionKey;
    const eventText = `Mattermost reaction ${action}: :${emojiName}: by @${senderName} on post ${postId} in channel ${channelId}`;
    core.system.enqueueSystemEvent(eventText, {
      sessionKey,
      contextKey: `mattermost:reaction:${postId}:${emojiName}:${userId}:${action}`
    });
    logVerboseMessage(
      `mattermost reaction: ${action} :${emojiName}: by ${senderName} on ${postId}`
    );
  };
  const inboundDebounceMs = core.channel.debounce.resolveInboundDebounceMs({
    cfg,
    channel: "mattermost"
  });
  const debouncer = core.channel.debounce.createInboundDebouncer({
    debounceMs: inboundDebounceMs,
    buildKey: (entry) => {
      const channelId = entry.post.channel_id ?? entry.payload.data?.channel_id ?? entry.payload.broadcast?.channel_id;
      if (!channelId) {
        return null;
      }
      const threadId = entry.post.root_id?.trim();
      const threadKey = threadId ? `thread:${threadId}` : "channel";
      return `mattermost:${account.accountId}:${channelId}:${threadKey}`;
    },
    shouldDebounce: (entry) => {
      if (entry.post.file_ids && entry.post.file_ids.length > 0) {
        return false;
      }
      const text = entry.post.message?.trim() ?? "";
      if (!text) {
        return false;
      }
      return !core.channel.text.hasControlCommand(text, cfg);
    },
    onFlush: async (entries) => {
      const last = entries.at(-1);
      if (!last) {
        return;
      }
      if (entries.length === 1) {
        await handlePost(last.post, last.payload);
        return;
      }
      const combinedText = entries.map((entry) => entry.post.message?.trim() ?? "").filter(Boolean).join("\n");
      const mergedPost = {
        ...last.post,
        message: combinedText,
        file_ids: []
      };
      const ids = entries.map((entry) => entry.post.id).filter(Boolean);
      await handlePost(mergedPost, last.payload, ids.length > 0 ? ids : void 0);
    },
    onError: (err) => {
      runtime.error?.(`mattermost debounce flush failed: ${String(err)}`);
    }
  });
  const wsUrl = buildMattermostWsUrl(baseUrl);
  let seq = 1;
  const connectOnce = createMattermostConnectOnce({
    wsUrl,
    botToken,
    abortSignal: opts.abortSignal,
    statusSink: opts.statusSink,
    runtime,
    webSocketFactory: opts.webSocketFactory,
    nextSeq: () => seq++,
    onPosted: async (post, payload) => {
      await debouncer.enqueue({ post, payload });
    },
    onReaction: async (payload) => {
      await handleReactionEvent(payload);
    }
  });
  let slashShutdownCleanup = null;
  if (slashEnabled) {
    const runAbortCleanup = () => {
      if (slashShutdownCleanup) {
        return;
      }
      const commands = getSlashCommandState(account.accountId)?.registeredCommands ?? [];
      deactivateSlashCommands(account.accountId);
      slashShutdownCleanup = cleanupSlashCommands({
        client,
        commands,
        log: (msg) => runtime.log?.(msg)
      }).catch((err) => {
        runtime.error?.(`mattermost: slash cleanup failed: ${String(err)}`);
      });
    };
    if (opts.abortSignal?.aborted) {
      runAbortCleanup();
    } else {
      opts.abortSignal?.addEventListener("abort", runAbortCleanup, { once: true });
    }
  }
  try {
    await runWithReconnect(connectOnce, {
      abortSignal: opts.abortSignal,
      jitterRatio: 0.2,
      onError: (err) => {
        runtime.error?.(`mattermost connection failed: ${String(err)}`);
        opts.statusSink?.({ lastError: String(err), connected: false });
      },
      onReconnect: (delayMs) => {
        runtime.log?.(`mattermost reconnecting in ${Math.round(delayMs / 1e3)}s`);
      }
    });
  } finally {
    unregisterInteractions?.();
  }
  if (slashShutdownCleanup) {
    await slashShutdownCleanup;
  }
}

// src/core/extensions/mattermost/src/mattermost/probe.ts
async function probeMattermost(baseUrl, botToken, timeoutMs = 2500) {
  const normalized = normalizeMattermostBaseUrl(baseUrl);
  if (!normalized) {
    return { ok: false, error: "baseUrl missing" };
  }
  const url = `${normalized}/api/v4/users/me`;
  const start = Date.now();
  const controller = timeoutMs > 0 ? new AbortController() : void 0;
  let timer = null;
  if (controller) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${botToken}` },
      signal: controller?.signal
    });
    const elapsedMs = Date.now() - start;
    if (!res.ok) {
      const detail = await readMattermostError(res);
      return {
        ok: false,
        status: res.status,
        error: detail || res.statusText,
        elapsedMs
      };
    }
    const bot = await res.json();
    return {
      ok: true,
      status: res.status,
      elapsedMs,
      bot
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: null,
      error: message,
      elapsedMs: Date.now() - start
    };
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

// src/core/extensions/mattermost/src/mattermost/reactions.ts
var BOT_USER_CACHE_TTL_MS = 10 * 6e4;
var botUserIdCache = /* @__PURE__ */ new Map();
async function resolveBotUserId(client, cacheKey3) {
  const cached = botUserIdCache.get(cacheKey3);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.userId;
  }
  const me = await fetchMattermostMe(client);
  const userId = me?.id?.trim();
  if (!userId) {
    return null;
  }
  botUserIdCache.set(cacheKey3, { userId, expiresAt: Date.now() + BOT_USER_CACHE_TTL_MS });
  return userId;
}
async function addMattermostReaction(params) {
  return runMattermostReaction(params, {
    action: "add",
    mutation: createReaction
  });
}
async function removeMattermostReaction(params) {
  return runMattermostReaction(params, {
    action: "remove",
    mutation: deleteReaction
  });
}
async function runMattermostReaction(params, options) {
  const resolved = resolveMattermostAccount({ cfg: params.cfg, accountId: params.accountId });
  const baseUrl = resolved.baseUrl?.trim();
  const botToken = resolved.botToken?.trim();
  if (!baseUrl || !botToken) {
    return { ok: false, error: "Mattermost botToken/baseUrl missing." };
  }
  const client = createMattermostClient({
    baseUrl,
    botToken,
    fetchImpl: params.fetchImpl
  });
  const cacheKey3 = `${baseUrl}:${botToken}`;
  const userId = await resolveBotUserId(client, cacheKey3);
  if (!userId) {
    return { ok: false, error: "Mattermost reactions failed: could not resolve bot user id." };
  }
  try {
    await options.mutation(client, {
      userId,
      postId: params.postId,
      emojiName: params.emojiName
    });
  } catch (err) {
    return { ok: false, error: `Mattermost ${options.action} reaction failed: ${String(err)}` };
  }
  return { ok: true };
}
async function createReaction(client, params) {
  await client.request("/reactions", {
    method: "POST",
    body: JSON.stringify({
      user_id: params.userId,
      post_id: params.postId,
      emoji_name: params.emojiName
    })
  });
}
async function deleteReaction(client, params) {
  const emoji = encodeURIComponent(params.emojiName);
  await client.request(
    `/users/${params.userId}/posts/${params.postId}/reactions/${emoji}`,
    {
      method: "DELETE"
    }
  );
}

// src/core/extensions/mattermost/src/normalize.ts
function normalizeMattermostMessagingTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return void 0;
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("channel:")) {
    const id = trimmed.slice("channel:".length).trim();
    return id ? `channel:${id}` : void 0;
  }
  if (lower.startsWith("group:")) {
    const id = trimmed.slice("group:".length).trim();
    return id ? `channel:${id}` : void 0;
  }
  if (lower.startsWith("user:")) {
    const id = trimmed.slice("user:".length).trim();
    return id ? `user:${id}` : void 0;
  }
  if (lower.startsWith("mattermost:")) {
    const id = trimmed.slice("mattermost:".length).trim();
    return id ? `user:${id}` : void 0;
  }
  if (trimmed.startsWith("@")) {
    const id = trimmed.slice(1).trim();
    return id ? `@${id}` : void 0;
  }
  if (trimmed.startsWith("#")) {
    return void 0;
  }
  return void 0;
}
function looksLikeMattermostTargetId(raw, normalized) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (/^(user|channel|group|mattermost):/i.test(trimmed)) {
    return true;
  }
  if (trimmed.startsWith("@")) {
    return true;
  }
  return /^[a-z0-9]{26}$/i.test(trimmed) || /^[a-z0-9]{26}__[a-z0-9]{26}$/i.test(trimmed);
}

// src/core/extensions/mattermost/src/onboarding.ts
var import_account_id2 = require("src/core/source/plugin-sdk/account-id");
var import_mattermost14 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/onboarding-helpers.ts
var import_mattermost13 = require("src/core/source/plugin-sdk/mattermost");

// src/core/extensions/mattermost/src/onboarding.ts
var channel = "mattermost";
async function noteMattermostSetup(prompter) {
  await prompter.note(
    [
      "1) Mattermost System Console -> Integrations -> Bot Accounts",
      "2) Create a bot + copy its token",
      "3) Use your server base URL (e.g., https://chat.example.com)",
      "Tip: the bot must be a member of any channel you want it to monitor.",
      "Docs: https://docs.must-b.ai/channels/mattermost"
    ].join("\n"),
    "Mattermost bot token"
  );
}
async function promptMattermostBaseUrl(params) {
  const baseUrl = String(
    await params.prompter.text({
      message: "Enter Mattermost base URL",
      initialValue: params.initialValue,
      validate: (value) => value?.trim() ? void 0 : "Required"
    })
  ).trim();
  return baseUrl;
}
var mattermostOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const configured = listMattermostAccountIds(cfg).some((accountId) => {
      const account = resolveMattermostAccount({
        cfg,
        accountId,
        allowUnresolvedSecretRef: true
      });
      const tokenConfigured = Boolean(account.botToken) || (0, import_mattermost14.hasConfiguredSecretInput)(account.config.botToken);
      return tokenConfigured && Boolean(account.baseUrl);
    });
    return {
      channel,
      configured,
      statusLines: [`Mattermost: ${configured ? "configured" : "needs token + url"}`],
      selectionHint: configured ? "configured" : "needs setup",
      quickstartScore: configured ? 2 : 1
    };
  },
  configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
    const defaultAccountId = resolveDefaultMattermostAccountId(cfg);
    const accountId = await (0, import_mattermost13.resolveAccountIdForConfigure)({
      cfg,
      prompter,
      label: "Mattermost",
      accountOverride: accountOverrides.mattermost,
      shouldPromptAccountIds,
      listAccountIds: listMattermostAccountIds,
      defaultAccountId
    });
    let next = cfg;
    const resolvedAccount = resolveMattermostAccount({
      cfg: next,
      accountId,
      allowUnresolvedSecretRef: true
    });
    const accountConfigured = Boolean(resolvedAccount.botToken && resolvedAccount.baseUrl);
    const allowEnv = accountId === import_account_id2.DEFAULT_ACCOUNT_ID;
    const hasConfigToken = (0, import_mattermost14.hasConfiguredSecretInput)(resolvedAccount.config.botToken);
    const hasConfigValues = hasConfigToken || Boolean(resolvedAccount.config.baseUrl);
    const tokenPromptState = (0, import_mattermost14.buildSingleChannelSecretPromptState)({
      accountConfigured,
      hasConfigToken,
      allowEnv: allowEnv && !hasConfigValues,
      envValue: process.env.MATTERMOST_BOT_TOKEN?.trim() && process.env.MATTERMOST_URL?.trim() ? process.env.MATTERMOST_BOT_TOKEN : void 0
    });
    let botToken = null;
    let baseUrl = null;
    if (!accountConfigured) {
      await noteMattermostSetup(prompter);
    }
    const botTokenResult = await (0, import_mattermost14.promptSingleChannelSecretInput)({
      cfg: next,
      prompter,
      providerHint: "mattermost",
      credentialLabel: "bot token",
      accountConfigured: tokenPromptState.accountConfigured,
      canUseEnv: tokenPromptState.canUseEnv,
      hasConfigToken: tokenPromptState.hasConfigToken,
      envPrompt: "MATTERMOST_BOT_TOKEN + MATTERMOST_URL detected. Use env vars?",
      keepPrompt: "Mattermost bot token already configured. Keep it?",
      inputPrompt: "Enter Mattermost bot token",
      preferredEnvVar: "MATTERMOST_BOT_TOKEN"
    });
    if (botTokenResult.action === "keep") {
      return { cfg: next, accountId };
    }
    if (botTokenResult.action === "use-env") {
      if (accountId === import_account_id2.DEFAULT_ACCOUNT_ID) {
        next = {
          ...next,
          channels: {
            ...next.channels,
            mattermost: {
              ...next.channels?.mattermost,
              enabled: true
            }
          }
        };
      }
      return { cfg: next, accountId };
    }
    botToken = botTokenResult.value;
    baseUrl = await promptMattermostBaseUrl({
      prompter,
      initialValue: resolvedAccount.baseUrl ?? process.env.MATTERMOST_URL?.trim()
    });
    if (accountId === import_account_id2.DEFAULT_ACCOUNT_ID) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          mattermost: {
            ...next.channels?.mattermost,
            enabled: true,
            botToken,
            baseUrl
          }
        }
      };
    } else {
      next = {
        ...next,
        channels: {
          ...next.channels,
          mattermost: {
            ...next.channels?.mattermost,
            enabled: true,
            accounts: {
              ...next.channels?.mattermost?.accounts,
              [accountId]: {
                ...next.channels?.mattermost?.accounts?.[accountId],
                enabled: next.channels?.mattermost?.accounts?.[accountId]?.enabled ?? true,
                botToken,
                baseUrl
              }
            }
          }
        }
      };
    }
    return { cfg: next, accountId };
  },
  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      mattermost: { ...cfg.channels?.mattermost, enabled: false }
    }
  })
};

// src/core/extensions/mattermost/src/channel.ts
var mattermostMessageActions = {
  listActions: ({ cfg }) => {
    const enabledAccounts = listMattermostAccountIds(cfg).map((accountId) => resolveMattermostAccount({ cfg, accountId })).filter((account) => account.enabled).filter((account) => Boolean(account.botToken?.trim() && account.baseUrl?.trim()));
    const actions = [];
    if (enabledAccounts.length > 0) {
      actions.push("send");
    }
    const actionsConfig = cfg.channels?.mattermost?.actions;
    const baseReactions = actionsConfig?.reactions;
    const hasReactionCapableAccount = enabledAccounts.some((account) => {
      const accountActions = account.config.actions;
      return (accountActions?.reactions ?? baseReactions ?? true) !== false;
    });
    if (hasReactionCapableAccount) {
      actions.push("react");
    }
    return actions;
  },
  supportsAction: ({ action }) => {
    return action === "send" || action === "react";
  },
  supportsButtons: ({ cfg }) => {
    const accounts = listMattermostAccountIds(cfg).map((id) => resolveMattermostAccount({ cfg, accountId: id })).filter((a) => a.enabled && a.botToken?.trim() && a.baseUrl?.trim());
    return accounts.length > 0;
  },
  handleAction: async ({ action, params, cfg, accountId }) => {
    if (action === "react") {
      const mmBase = cfg?.channels?.mattermost;
      const accounts = mmBase?.accounts;
      const resolvedAccountId2 = accountId ?? resolveDefaultMattermostAccountId(cfg);
      const acctConfig = accounts?.[resolvedAccountId2];
      const acctActions = acctConfig?.actions;
      const baseActions = mmBase?.actions;
      const reactionsEnabled = acctActions?.reactions ?? baseActions?.reactions ?? true;
      if (!reactionsEnabled) {
        throw new Error("Mattermost reactions are disabled in config");
      }
      const postIdRaw = typeof params?.messageId === "string" ? params.messageId : typeof params?.postId === "string" ? params.postId : "";
      const postId = postIdRaw.trim();
      if (!postId) {
        throw new Error("Mattermost react requires messageId (post id)");
      }
      const emojiRaw = typeof params?.emoji === "string" ? params.emoji : "";
      const emojiName = emojiRaw.trim().replace(/^:+|:+$/g, "");
      if (!emojiName) {
        throw new Error("Mattermost react requires emoji");
      }
      const remove = params?.remove === true;
      if (remove) {
        const result3 = await removeMattermostReaction({
          cfg,
          postId,
          emojiName,
          accountId: resolvedAccountId2
        });
        if (!result3.ok) {
          throw new Error(result3.error);
        }
        return {
          content: [
            { type: "text", text: `Removed reaction :${emojiName}: from ${postId}` }
          ],
          details: {}
        };
      }
      const result2 = await addMattermostReaction({
        cfg,
        postId,
        emojiName,
        accountId: resolvedAccountId2
      });
      if (!result2.ok) {
        throw new Error(result2.error);
      }
      return {
        content: [{ type: "text", text: `Reacted with :${emojiName}: on ${postId}` }],
        details: {}
      };
    }
    if (action !== "send") {
      throw new Error(`Unsupported Mattermost action: ${action}`);
    }
    const to = typeof params.to === "string" ? params.to.trim() : typeof params.target === "string" ? params.target.trim() : "";
    if (!to) {
      throw new Error("Mattermost send requires a target (to).");
    }
    const message = typeof params.message === "string" ? params.message : "";
    const replyToId = readMattermostReplyToId(params);
    const resolvedAccountId = accountId || void 0;
    const mediaUrl = typeof params.media === "string" ? params.media.trim() || void 0 : void 0;
    const result = await sendMessageMattermost(to, message, {
      accountId: resolvedAccountId,
      replyToId,
      buttons: Array.isArray(params.buttons) ? params.buttons : void 0,
      attachmentText: typeof params.attachmentText === "string" ? params.attachmentText : void 0,
      mediaUrl
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: true,
            channel: "mattermost",
            messageId: result.messageId,
            channelId: result.channelId
          })
        }
      ],
      details: {}
    };
  }
};
var meta = {
  id: "mattermost",
  label: "Mattermost",
  selectionLabel: "Mattermost (plugin)",
  detailLabel: "Mattermost Bot",
  docsPath: "/channels/mattermost",
  docsLabel: "mattermost",
  blurb: "self-hosted Slack-style chat; install the plugin to enable.",
  systemImage: "bubble.left.and.bubble.right",
  order: 65,
  quickstartAllowFrom: true
};
function readMattermostReplyToId(params) {
  const readNormalizedValue = (value) => {
    if (typeof value !== "string") {
      return void 0;
    }
    const trimmed = value.trim();
    return trimmed || void 0;
  };
  return readNormalizedValue(params.replyToId) ?? readNormalizedValue(params.replyTo);
}
function normalizeAllowEntry(entry) {
  return entry.trim().replace(/^(mattermost|user):/i, "").replace(/^@/, "").toLowerCase();
}
function formatAllowEntry(entry) {
  const trimmed = entry.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("@")) {
    const username = trimmed.slice(1).trim();
    return username ? `@${username.toLowerCase()}` : "";
  }
  return trimmed.replace(/^(mattermost|user):/i, "").toLowerCase();
}
var mattermostConfigAccessors = (0, import_compat3.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => resolveMattermostAccount({ cfg, accountId }),
  resolveAllowFrom: (account) => account.config.allowFrom,
  formatAllowFrom: (allowFrom) => (0, import_compat3.formatNormalizedAllowFromEntries)({
    allowFrom,
    normalizeEntry: formatAllowEntry
  })
});
var mattermostPlugin = {
  id: "mattermost",
  meta: {
    ...meta
  },
  onboarding: mattermostOnboardingAdapter,
  pairing: {
    idLabel: "mattermostUserId",
    normalizeAllowEntry: (entry) => normalizeAllowEntry(entry),
    notifyApproval: async ({ id }) => {
      console.log(`[mattermost] User ${id} approved for pairing`);
    }
  },
  capabilities: {
    chatTypes: ["direct", "channel", "group", "thread"],
    reactions: true,
    threads: true,
    media: true,
    nativeCommands: true
  },
  streaming: {
    blockStreamingCoalesceDefaults: { minChars: 1500, idleMs: 1e3 }
  },
  threading: {
    resolveReplyToMode: ({ cfg, accountId, chatType }) => {
      const account = resolveMattermostAccount({ cfg, accountId: accountId ?? "default" });
      const kind = chatType === "direct" || chatType === "group" || chatType === "channel" ? chatType : "channel";
      return resolveMattermostReplyToMode(account, kind);
    }
  },
  reload: { configPrefixes: ["channels.mattermost"] },
  configSchema: (0, import_mattermost15.buildChannelConfigSchema)(MattermostConfigSchema),
  config: {
    listAccountIds: (cfg) => listMattermostAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveMattermostAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultMattermostAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => (0, import_mattermost15.setAccountEnabledInConfigSection)({
      cfg,
      sectionKey: "mattermost",
      accountId,
      enabled,
      allowTopLevel: true
    }),
    deleteAccount: ({ cfg, accountId }) => (0, import_mattermost15.deleteAccountFromConfigSection)({
      cfg,
      sectionKey: "mattermost",
      accountId,
      clearBaseFields: ["botToken", "baseUrl", "name"]
    }),
    isConfigured: (account) => Boolean(account.botToken && account.baseUrl),
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: Boolean(account.botToken && account.baseUrl),
      botTokenSource: account.botTokenSource,
      baseUrl: account.baseUrl
    }),
    ...mattermostConfigAccessors
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat3.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "mattermost",
        accountId,
        fallbackAccountId: account.accountId ?? import_mattermost15.DEFAULT_ACCOUNT_ID,
        policy: account.config.dmPolicy,
        allowFrom: account.config.allowFrom ?? [],
        policyPathSuffix: "dmPolicy",
        normalizeEntry: (raw) => normalizeAllowEntry(raw)
      });
    },
    collectWarnings: ({ account, cfg }) => {
      return (0, import_compat3.collectAllowlistProviderRestrictSendersWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.mattermost !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        surface: "Mattermost channels",
        openScope: "any member",
        groupPolicyPath: "channels.mattermost.groupPolicy",
        groupAllowFromPath: "channels.mattermost.groupAllowFrom"
      });
    }
  },
  groups: {
    resolveRequireMention: resolveMattermostGroupRequireMention
  },
  actions: mattermostMessageActions,
  directory: {
    listGroups: async (params) => listMattermostDirectoryGroups(params),
    listGroupsLive: async (params) => listMattermostDirectoryGroups(params),
    listPeers: async (params) => listMattermostDirectoryPeers(params),
    listPeersLive: async (params) => listMattermostDirectoryPeers(params)
  },
  messaging: {
    normalizeTarget: normalizeMattermostMessagingTarget,
    targetResolver: {
      looksLikeId: looksLikeMattermostTargetId,
      hint: "<channelId|user:ID|channel:ID>",
      resolveTarget: async ({ cfg, accountId, input }) => {
        const resolved = await resolveMattermostOpaqueTarget({
          input,
          cfg,
          accountId
        });
        if (!resolved) {
          return null;
        }
        return {
          to: resolved.to,
          kind: resolved.kind,
          source: "directory"
        };
      }
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getMattermostRuntime().channel.text.chunkMarkdownText(text, limit),
    chunkerMode: "markdown",
    textChunkLimit: 4e3,
    resolveTarget: ({ to }) => {
      const trimmed = to?.trim();
      if (!trimmed) {
        return {
          ok: false,
          error: new Error(
            "Delivering to Mattermost requires --to <channelId|@username|user:ID|channel:ID>"
          )
        };
      }
      return { ok: true, to: trimmed };
    },
    sendText: async ({ cfg, to, text, accountId, replyToId }) => {
      const result = await sendMessageMattermost(to, text, {
        cfg,
        accountId: accountId ?? void 0,
        replyToId: replyToId ?? void 0
      });
      return { channel: "mattermost", ...result };
    },
    sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, replyToId }) => {
      const result = await sendMessageMattermost(to, text, {
        cfg,
        accountId: accountId ?? void 0,
        mediaUrl,
        mediaLocalRoots,
        replyToId: replyToId ?? void 0
      });
      return { channel: "mattermost", ...result };
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_mattermost15.DEFAULT_ACCOUNT_ID,
      running: false,
      connected: false,
      lastConnectedAt: null,
      lastDisconnect: null,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      botTokenSource: snapshot.botTokenSource ?? "none",
      running: snapshot.running ?? false,
      connected: snapshot.connected ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      baseUrl: snapshot.baseUrl ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ account, timeoutMs }) => {
      const token = account.botToken?.trim();
      const baseUrl = account.baseUrl?.trim();
      if (!token || !baseUrl) {
        return { ok: false, error: "bot token or baseUrl missing" };
      }
      return await probeMattermost(baseUrl, token, timeoutMs);
    },
    buildAccountSnapshot: ({ account, runtime, probe }) => {
      const base = (0, import_mattermost15.buildComputedAccountStatusSnapshot)({
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured: Boolean(account.botToken && account.baseUrl),
        runtime,
        probe
      });
      return {
        ...base,
        botTokenSource: account.botTokenSource,
        baseUrl: account.baseUrl,
        connected: runtime?.connected ?? false,
        lastConnectedAt: runtime?.lastConnectedAt ?? null,
        lastDisconnect: runtime?.lastDisconnect ?? null
      };
    }
  },
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_mattermost15.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_mattermost15.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "mattermost",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      if (input.useEnv && accountId !== import_mattermost15.DEFAULT_ACCOUNT_ID) {
        return "Mattermost env vars can only be used for the default account.";
      }
      const token = input.botToken ?? input.token;
      const baseUrl = input.httpUrl;
      if (!input.useEnv && (!token || !baseUrl)) {
        return "Mattermost requires --bot-token and --http-url (or --use-env).";
      }
      if (baseUrl && !normalizeMattermostBaseUrl(baseUrl)) {
        return "Mattermost --http-url must include a valid base URL.";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const token = input.botToken ?? input.token;
      const baseUrl = input.httpUrl?.trim();
      const namedConfig = (0, import_mattermost15.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "mattermost",
        accountId,
        name: input.name
      });
      const next = accountId !== import_mattermost15.DEFAULT_ACCOUNT_ID ? (0, import_mattermost15.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "mattermost"
      }) : namedConfig;
      const patch = input.useEnv ? {} : {
        ...token ? { botToken: token } : {},
        ...baseUrl ? { baseUrl } : {}
      };
      return (0, import_mattermost15.applySetupAccountConfigPatch)({
        cfg: next,
        channelKey: "mattermost",
        accountId,
        patch
      });
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const statusSink = (0, import_mattermost15.createAccountStatusSink)({
        accountId: ctx.accountId,
        setStatus: ctx.setStatus
      });
      statusSink({
        baseUrl: account.baseUrl,
        botTokenSource: account.botTokenSource
      });
      ctx.log?.info(`[${account.accountId}] starting channel`);
      return monitorMattermostProvider({
        botToken: account.botToken ?? void 0,
        baseUrl: account.baseUrl ?? void 0,
        accountId: account.accountId,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        statusSink
      });
    }
  }
};

// src/core/extensions/mattermost/index.ts
var plugin = {
  id: "mattermost",
  name: "Mattermost",
  description: "Mattermost channel plugin",
  configSchema: (0, import_mattermost16.emptyPluginConfigSchema)(),
  register(api) {
    setMattermostRuntime(api.runtime);
    api.registerChannel({ plugin: mattermostPlugin });
    registerSlashCommandRoute(api);
  }
};
var index_default = plugin;
