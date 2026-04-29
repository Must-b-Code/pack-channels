"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/core/extensions/googlechat/src/auth.ts
function buildAuthKey(account) {
  if (account.credentialsFile) {
    return `file:${account.credentialsFile}`;
  }
  if (account.credentials) {
    return `inline:${JSON.stringify(account.credentials)}`;
  }
  return "none";
}
function getAuthInstance(account) {
  const key = buildAuthKey(account);
  const cached = authCache.get(account.accountId);
  if (cached && cached.key === key) {
    return cached.auth;
  }
  const evictOldest = () => {
    if (authCache.size > MAX_AUTH_CACHE_SIZE) {
      const oldest = authCache.keys().next().value;
      if (oldest !== void 0) {
        authCache.delete(oldest);
      }
    }
  };
  if (account.credentialsFile) {
    const auth2 = new import_google_auth_library.GoogleAuth({ keyFile: account.credentialsFile, scopes: [CHAT_SCOPE] });
    authCache.set(account.accountId, { key, auth: auth2 });
    evictOldest();
    return auth2;
  }
  if (account.credentials) {
    const auth2 = new import_google_auth_library.GoogleAuth({ credentials: account.credentials, scopes: [CHAT_SCOPE] });
    authCache.set(account.accountId, { key, auth: auth2 });
    evictOldest();
    return auth2;
  }
  const auth = new import_google_auth_library.GoogleAuth({ scopes: [CHAT_SCOPE] });
  authCache.set(account.accountId, { key, auth });
  evictOldest();
  return auth;
}
async function getGoogleChatAccessToken(account) {
  const auth = getAuthInstance(account);
  const client = await auth.getClient();
  const access = await client.getAccessToken();
  const token = typeof access === "string" ? access : access?.token;
  if (!token) {
    throw new Error("Missing Google Chat access token");
  }
  return token;
}
async function fetchChatCerts() {
  const now = Date.now();
  if (cachedCerts && now - cachedCerts.fetchedAt < 10 * 60 * 1e3) {
    return cachedCerts.certs;
  }
  const res = await fetch(CHAT_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Chat certs (${res.status})`);
  }
  const certs = await res.json();
  cachedCerts = { fetchedAt: now, certs };
  return certs;
}
async function verifyGoogleChatRequest(params) {
  const bearer = params.bearer?.trim();
  if (!bearer) {
    return { ok: false, reason: "missing token" };
  }
  const audience = params.audience?.trim();
  if (!audience) {
    return { ok: false, reason: "missing audience" };
  }
  const audienceType = params.audienceType ?? null;
  if (audienceType === "app-url") {
    try {
      const ticket = await verifyClient.verifyIdToken({
        idToken: bearer,
        audience
      });
      const payload = ticket.getPayload();
      const email = payload?.email ?? "";
      const ok = payload?.email_verified && (email === CHAT_ISSUER || ADDON_ISSUER_PATTERN.test(email));
      return ok ? { ok: true } : { ok: false, reason: `invalid issuer: ${email}` };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "invalid token" };
    }
  }
  if (audienceType === "project-number") {
    try {
      const certs = await fetchChatCerts();
      await verifyClient.verifySignedJwtWithCertsAsync(bearer, certs, audience, [CHAT_ISSUER]);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "invalid token" };
    }
  }
  return { ok: false, reason: "unsupported audience type" };
}
var import_google_auth_library, CHAT_SCOPE, CHAT_ISSUER, ADDON_ISSUER_PATTERN, CHAT_CERTS_URL, MAX_AUTH_CACHE_SIZE, authCache, verifyClient, cachedCerts;
var init_auth = __esm({
  "src/core/extensions/googlechat/src/auth.ts"() {
    "use strict";
    import_google_auth_library = require("google-auth-library");
    CHAT_SCOPE = "https://www.googleapis.com/auth/chat.bot";
    CHAT_ISSUER = "chat@system.gserviceaccount.com";
    ADDON_ISSUER_PATTERN = /^service-\d+@gcp-sa-gsuiteaddons\.iam\.gserviceaccount\.com$/;
    CHAT_CERTS_URL = "https://www.googleapis.com/service_accounts/v1/metadata/x509/chat@system.gserviceaccount.com";
    MAX_AUTH_CACHE_SIZE = 32;
    authCache = /* @__PURE__ */ new Map();
    verifyClient = new import_google_auth_library.OAuth2Client();
    cachedCerts = null;
  }
});

// src/core/extensions/googlechat/src/api.ts
var api_exports = {};
__export(api_exports, {
  createGoogleChatReaction: () => createGoogleChatReaction,
  deleteGoogleChatMessage: () => deleteGoogleChatMessage,
  deleteGoogleChatReaction: () => deleteGoogleChatReaction,
  downloadGoogleChatMedia: () => downloadGoogleChatMedia,
  findGoogleChatDirectMessage: () => findGoogleChatDirectMessage,
  listGoogleChatReactions: () => listGoogleChatReactions,
  probeGoogleChat: () => probeGoogleChat,
  sendGoogleChatMessage: () => sendGoogleChatMessage,
  updateGoogleChatMessage: () => updateGoogleChatMessage,
  uploadGoogleChatAttachment: () => uploadGoogleChatAttachment
});
async function fetchJson(account, url, init) {
  const token = await getGoogleChatAccessToken(account);
  const { response: res, release } = await (0, import_googlechat3.fetchWithSsrFGuard)({
    url,
    init: {
      ...init,
      headers: {
        ...headersToObject(init.headers),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    },
    auditContext: "googlechat.api.json"
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Chat API ${res.status}: ${text || res.statusText}`);
    }
    return await res.json();
  } finally {
    await release();
  }
}
async function fetchOk(account, url, init) {
  const token = await getGoogleChatAccessToken(account);
  const { response: res, release } = await (0, import_googlechat3.fetchWithSsrFGuard)({
    url,
    init: {
      ...init,
      headers: {
        ...headersToObject(init.headers),
        Authorization: `Bearer ${token}`
      }
    },
    auditContext: "googlechat.api.ok"
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Chat API ${res.status}: ${text || res.statusText}`);
    }
  } finally {
    await release();
  }
}
async function fetchBuffer(account, url, init, options) {
  const token = await getGoogleChatAccessToken(account);
  const { response: res, release } = await (0, import_googlechat3.fetchWithSsrFGuard)({
    url,
    init: {
      ...init,
      headers: {
        ...headersToObject(init?.headers),
        Authorization: `Bearer ${token}`
      }
    },
    auditContext: "googlechat.api.buffer"
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Chat API ${res.status}: ${text || res.statusText}`);
    }
    const maxBytes = options?.maxBytes;
    const lengthHeader = res.headers.get("content-length");
    if (maxBytes && lengthHeader) {
      const length = Number(lengthHeader);
      if (Number.isFinite(length) && length > maxBytes) {
        throw new Error(`Google Chat media exceeds max bytes (${maxBytes})`);
      }
    }
    if (!maxBytes || !res.body) {
      const buffer2 = Buffer.from(await res.arrayBuffer());
      const contentType2 = res.headers.get("content-type") ?? void 0;
      return { buffer: buffer2, contentType: contentType2 };
    }
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (!value) {
        continue;
      }
      total += value.length;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`Google Chat media exceeds max bytes (${maxBytes})`);
      }
      chunks.push(Buffer.from(value));
    }
    const buffer = Buffer.concat(chunks, total);
    const contentType = res.headers.get("content-type") ?? void 0;
    return { buffer, contentType };
  } finally {
    await release();
  }
}
async function sendGoogleChatMessage(params) {
  const { account, space, text, thread, attachments } = params;
  const body = {};
  if (text) {
    body.text = text;
  }
  if (thread) {
    body.thread = { name: thread };
  }
  if (attachments && attachments.length > 0) {
    body.attachment = attachments.map((item) => ({
      attachmentDataRef: { attachmentUploadToken: item.attachmentUploadToken },
      ...item.contentName ? { contentName: item.contentName } : {}
    }));
  }
  const urlObj = new URL(`${CHAT_API_BASE}/${space}/messages`);
  if (thread) {
    urlObj.searchParams.set("messageReplyOption", "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD");
  }
  const url = urlObj.toString();
  const result = await fetchJson(account, url, {
    method: "POST",
    body: JSON.stringify(body)
  });
  return result ? { messageName: result.name } : null;
}
async function updateGoogleChatMessage(params) {
  const { account, messageName, text } = params;
  const url = `${CHAT_API_BASE}/${messageName}?updateMask=text`;
  const result = await fetchJson(account, url, {
    method: "PATCH",
    body: JSON.stringify({ text })
  });
  return { messageName: result.name };
}
async function deleteGoogleChatMessage(params) {
  const { account, messageName } = params;
  const url = `${CHAT_API_BASE}/${messageName}`;
  await fetchOk(account, url, { method: "DELETE" });
}
async function uploadGoogleChatAttachment(params) {
  const { account, space, filename, buffer, contentType } = params;
  const boundary = `must-b-${import_node_crypto.default.randomUUID()}`;
  const metadata = JSON.stringify({ filename });
  const header = `--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
${metadata}\r
`;
  const mediaHeader = `--${boundary}\r
Content-Type: ${contentType ?? "application/octet-stream"}\r
\r
`;
  const footer = `\r
--${boundary}--\r
`;
  const body = Buffer.concat([
    Buffer.from(header, "utf8"),
    Buffer.from(mediaHeader, "utf8"),
    buffer,
    Buffer.from(footer, "utf8")
  ]);
  const token = await getGoogleChatAccessToken(account);
  const url = `${CHAT_UPLOAD_BASE}/${space}/attachments:upload?uploadType=multipart`;
  const { response: res, release } = await (0, import_googlechat3.fetchWithSsrFGuard)({
    url,
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    },
    auditContext: "googlechat.upload"
  });
  try {
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Google Chat upload ${res.status}: ${text || res.statusText}`);
    }
    const payload = await res.json();
    return {
      attachmentUploadToken: payload.attachmentDataRef?.attachmentUploadToken
    };
  } finally {
    await release();
  }
}
async function downloadGoogleChatMedia(params) {
  const { account, resourceName, maxBytes } = params;
  const url = `${CHAT_API_BASE}/media/${resourceName}?alt=media`;
  return await fetchBuffer(account, url, void 0, { maxBytes });
}
async function createGoogleChatReaction(params) {
  const { account, messageName, emoji } = params;
  const url = `${CHAT_API_BASE}/${messageName}/reactions`;
  return await fetchJson(account, url, {
    method: "POST",
    body: JSON.stringify({ emoji: { unicode: emoji } })
  });
}
async function listGoogleChatReactions(params) {
  const { account, messageName, limit } = params;
  const url = new URL(`${CHAT_API_BASE}/${messageName}/reactions`);
  if (limit && limit > 0) {
    url.searchParams.set("pageSize", String(limit));
  }
  const result = await fetchJson(account, url.toString(), {
    method: "GET"
  });
  return result.reactions ?? [];
}
async function deleteGoogleChatReaction(params) {
  const { account, reactionName } = params;
  const url = `${CHAT_API_BASE}/${reactionName}`;
  await fetchOk(account, url, { method: "DELETE" });
}
async function findGoogleChatDirectMessage(params) {
  const { account, userName } = params;
  const url = new URL(`${CHAT_API_BASE}/spaces:findDirectMessage`);
  url.searchParams.set("name", userName);
  return await fetchJson(account, url.toString(), {
    method: "GET"
  });
}
async function probeGoogleChat(account) {
  try {
    const url = new URL(`${CHAT_API_BASE}/spaces`);
    url.searchParams.set("pageSize", "1");
    await fetchJson(account, url.toString(), {
      method: "GET"
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
var import_node_crypto, import_googlechat3, CHAT_API_BASE, CHAT_UPLOAD_BASE, headersToObject;
var init_api = __esm({
  "src/core/extensions/googlechat/src/api.ts"() {
    "use strict";
    import_node_crypto = __toESM(require("node:crypto"), 1);
    import_googlechat3 = require("src/core/source/plugin-sdk/googlechat");
    init_auth();
    CHAT_API_BASE = "https://chat.googleapis.com/v1";
    CHAT_UPLOAD_BASE = "https://chat.googleapis.com/upload/v1";
    headersToObject = (headers) => headers instanceof Headers ? Object.fromEntries(headers.entries()) : Array.isArray(headers) ? Object.fromEntries(headers) : headers || {};
  }
});

// src/core/extensions/googlechat/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_googlechat11 = require("src/core/source/plugin-sdk/googlechat");

// src/core/extensions/googlechat/src/channel.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_googlechat9 = require("src/core/source/plugin-sdk/googlechat");
var import_googlechat10 = require("src/core/source/plugin-sdk/googlechat");

// src/core/extensions/googlechat/src/accounts.ts
var import_account_id = require("src/core/source/plugin-sdk/account-id");
var import_googlechat = require("src/core/source/plugin-sdk/googlechat");
var import_googlechat2 = require("src/core/source/plugin-sdk/googlechat");
var ENV_SERVICE_ACCOUNT = "GOOGLE_CHAT_SERVICE_ACCOUNT";
var ENV_SERVICE_ACCOUNT_FILE = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
var {
  listAccountIds: listGoogleChatAccountIds,
  resolveDefaultAccountId: resolveDefaultGoogleChatAccountId
} = (0, import_googlechat2.createAccountListHelpers)("googlechat");
function resolveAccountConfig(cfg, accountId) {
  const accounts = cfg.channels?.["googlechat"]?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return void 0;
  }
  return accounts[accountId];
}
function mergeGoogleChatAccountConfig(cfg, accountId) {
  const raw = cfg.channels?.["googlechat"] ?? {};
  const { accounts: _ignored, defaultAccount: _ignored2, ...base } = raw;
  const defaultAccountConfig = resolveAccountConfig(cfg, import_account_id.DEFAULT_ACCOUNT_ID) ?? {};
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  if (accountId === import_account_id.DEFAULT_ACCOUNT_ID) {
    return { ...base, ...defaultAccountConfig };
  }
  const {
    enabled: _ignoredEnabled,
    dangerouslyAllowNameMatching: _ignoredDangerouslyAllowNameMatching,
    serviceAccount: _ignoredServiceAccount,
    serviceAccountRef: _ignoredServiceAccountRef,
    serviceAccountFile: _ignoredServiceAccountFile,
    ...defaultAccountShared
  } = defaultAccountConfig;
  return { ...defaultAccountShared, ...base, ...account };
}
function parseServiceAccount(value) {
  if (value && typeof value === "object") {
    if ((0, import_googlechat.isSecretRef)(value)) {
      return null;
    }
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
function resolveCredentialsFromConfig(params) {
  const { account, accountId } = params;
  const inline = parseServiceAccount(account.serviceAccount);
  if (inline) {
    return { credentials: inline, source: "inline" };
  }
  if ((0, import_googlechat.isSecretRef)(account.serviceAccount)) {
    throw new Error(
      `channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccount.source}:${account.serviceAccount.provider}:${account.serviceAccount.id}". Resolve this command against an active gateway runtime snapshot before reading it.`
    );
  }
  if ((0, import_googlechat.isSecretRef)(account.serviceAccountRef)) {
    throw new Error(
      `channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccountRef.source}:${account.serviceAccountRef.provider}:${account.serviceAccountRef.id}". Resolve this command against an active gateway runtime snapshot before reading it.`
    );
  }
  const file = account.serviceAccountFile?.trim();
  if (file) {
    return { credentialsFile: file, source: "file" };
  }
  if (accountId === import_account_id.DEFAULT_ACCOUNT_ID) {
    const envJson = process.env[ENV_SERVICE_ACCOUNT];
    const envInline = parseServiceAccount(envJson);
    if (envInline) {
      return { credentials: envInline, source: "env" };
    }
    const envFile = process.env[ENV_SERVICE_ACCOUNT_FILE]?.trim();
    if (envFile) {
      return { credentialsFile: envFile, source: "env" };
    }
  }
  return { source: "none" };
}
function resolveGoogleChatAccount(params) {
  const accountId = (0, import_account_id.normalizeAccountId)(params.accountId);
  const baseEnabled = params.cfg.channels?.["googlechat"]?.enabled !== false;
  const merged = mergeGoogleChatAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const credentials = resolveCredentialsFromConfig({ accountId, account: merged });
  return {
    accountId,
    name: merged.name?.trim() || void 0,
    enabled,
    config: merged,
    credentialSource: credentials.source,
    credentials: credentials.credentials,
    credentialsFile: credentials.credentialsFile
  };
}
function listEnabledGoogleChatAccounts(cfg) {
  return listGoogleChatAccountIds(cfg).map((accountId) => resolveGoogleChatAccount({ cfg, accountId })).filter((account) => account.enabled);
}

// src/core/extensions/googlechat/src/actions.ts
var import_googlechat4 = require("src/core/source/plugin-sdk/googlechat");
init_api();

// src/core/extensions/googlechat/src/runtime.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
var { setRuntime: setGoogleChatRuntime, getRuntime: getGoogleChatRuntime } = (0, import_compat.createPluginRuntimeStore)("Google Chat runtime not initialized");

// src/core/extensions/googlechat/src/targets.ts
init_api();
function normalizeGoogleChatTarget(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return void 0;
  }
  const withoutPrefix = trimmed.replace(/^(googlechat|google-chat|gchat):/i, "");
  const normalized = withoutPrefix.replace(/^user:(users\/)?/i, "users/").replace(/^space:(spaces\/)?/i, "spaces/");
  if (isGoogleChatUserTarget(normalized)) {
    const suffix = normalized.slice("users/".length);
    return suffix.includes("@") ? `users/${suffix.toLowerCase()}` : normalized;
  }
  if (isGoogleChatSpaceTarget(normalized)) {
    return normalized;
  }
  if (normalized.includes("@")) {
    return `users/${normalized.toLowerCase()}`;
  }
  return normalized;
}
function isGoogleChatUserTarget(value) {
  return value.toLowerCase().startsWith("users/");
}
function isGoogleChatSpaceTarget(value) {
  return value.toLowerCase().startsWith("spaces/");
}
function stripMessageSuffix(target) {
  const index = target.indexOf("/messages/");
  if (index === -1) {
    return target;
  }
  return target.slice(0, index);
}
async function resolveGoogleChatOutboundSpace(params) {
  const normalized = normalizeGoogleChatTarget(params.target);
  if (!normalized) {
    throw new Error("Missing Google Chat target.");
  }
  const base = stripMessageSuffix(normalized);
  if (isGoogleChatSpaceTarget(base)) {
    return base;
  }
  if (isGoogleChatUserTarget(base)) {
    const dm = await findGoogleChatDirectMessage({
      account: params.account,
      userName: base
    });
    if (!dm?.name) {
      throw new Error(`No Google Chat DM found for ${base}`);
    }
    return dm.name;
  }
  return base;
}

// src/core/extensions/googlechat/src/actions.ts
var providerId = "googlechat";
function listEnabledAccounts(cfg) {
  return listEnabledGoogleChatAccounts(cfg).filter(
    (account) => account.enabled && account.credentialSource !== "none"
  );
}
function isReactionsEnabled(accounts, cfg) {
  for (const account of accounts) {
    const gate = (0, import_googlechat4.createActionGate)(
      account.config.actions ?? cfg.channels?.["googlechat"]?.actions
    );
    if (gate("reactions")) {
      return true;
    }
  }
  return false;
}
function resolveAppUserNames(account) {
  return new Set(["users/app", account.config.botUser?.trim()].filter(Boolean));
}
var googlechatMessageActions = {
  listActions: ({ cfg }) => {
    const accounts = listEnabledAccounts(cfg);
    if (accounts.length === 0) {
      return [];
    }
    const actions = /* @__PURE__ */ new Set([]);
    actions.add("send");
    if (isReactionsEnabled(accounts, cfg)) {
      actions.add("react");
      actions.add("reactions");
    }
    return Array.from(actions);
  },
  extractToolSend: ({ args }) => {
    return (0, import_googlechat4.extractToolSend)(args, "sendMessage");
  },
  handleAction: async ({ action, params, cfg, accountId }) => {
    const account = resolveGoogleChatAccount({
      cfg,
      accountId
    });
    if (account.credentialSource === "none") {
      throw new Error("Google Chat credentials are missing.");
    }
    if (action === "send") {
      const to = (0, import_googlechat4.readStringParam)(params, "to", { required: true });
      const content = (0, import_googlechat4.readStringParam)(params, "message", {
        required: true,
        allowEmpty: true
      });
      const mediaUrl = (0, import_googlechat4.readStringParam)(params, "media", { trim: false });
      const threadId = (0, import_googlechat4.readStringParam)(params, "threadId") ?? (0, import_googlechat4.readStringParam)(params, "replyTo");
      const space = await resolveGoogleChatOutboundSpace({ account, target: to });
      if (mediaUrl) {
        const core = getGoogleChatRuntime();
        const maxBytes = (account.config.mediaMaxMb ?? 20) * 1024 * 1024;
        const loaded = await core.channel.media.fetchRemoteMedia({ url: mediaUrl, maxBytes });
        const upload = await uploadGoogleChatAttachment({
          account,
          space,
          filename: loaded.fileName ?? "attachment",
          buffer: loaded.buffer,
          contentType: loaded.contentType
        });
        await sendGoogleChatMessage({
          account,
          space,
          text: content,
          thread: threadId ?? void 0,
          attachments: upload.attachmentUploadToken ? [
            {
              attachmentUploadToken: upload.attachmentUploadToken,
              contentName: loaded.fileName
            }
          ] : void 0
        });
        return (0, import_googlechat4.jsonResult)({ ok: true, to: space });
      }
      await sendGoogleChatMessage({
        account,
        space,
        text: content,
        thread: threadId ?? void 0
      });
      return (0, import_googlechat4.jsonResult)({ ok: true, to: space });
    }
    if (action === "react") {
      const messageName = (0, import_googlechat4.readStringParam)(params, "messageId", { required: true });
      const { emoji, remove, isEmpty } = (0, import_googlechat4.readReactionParams)(params, {
        removeErrorMessage: "Emoji is required to remove a Google Chat reaction."
      });
      if (remove || isEmpty) {
        const reactions = await listGoogleChatReactions({ account, messageName });
        const appUsers = resolveAppUserNames(account);
        const toRemove = reactions.filter((reaction2) => {
          const userName = reaction2.user?.name?.trim();
          if (appUsers.size > 0 && !appUsers.has(userName ?? "")) {
            return false;
          }
          if (emoji) {
            return reaction2.emoji?.unicode === emoji;
          }
          return true;
        });
        for (const reaction2 of toRemove) {
          if (!reaction2.name) {
            continue;
          }
          await deleteGoogleChatReaction({ account, reactionName: reaction2.name });
        }
        return (0, import_googlechat4.jsonResult)({ ok: true, removed: toRemove.length });
      }
      const reaction = await createGoogleChatReaction({
        account,
        messageName,
        emoji
      });
      return (0, import_googlechat4.jsonResult)({ ok: true, reaction });
    }
    if (action === "reactions") {
      const messageName = (0, import_googlechat4.readStringParam)(params, "messageId", { required: true });
      const limit = (0, import_googlechat4.readNumberParam)(params, "limit", { integer: true });
      const reactions = await listGoogleChatReactions({
        account,
        messageName,
        limit: limit ?? void 0
      });
      return (0, import_googlechat4.jsonResult)({ ok: true, reactions });
    }
    throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
  }
};

// src/core/extensions/googlechat/src/channel.ts
init_api();

// src/core/extensions/googlechat/src/monitor.ts
var import_googlechat7 = require("src/core/source/plugin-sdk/googlechat");
init_api();

// src/core/extensions/googlechat/src/monitor-access.ts
var import_googlechat5 = require("src/core/source/plugin-sdk/googlechat");
init_api();
function normalizeUserId(raw) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return "";
  }
  return trimmed.replace(/^users\//i, "").toLowerCase();
}
function isEmailLike(value) {
  return value.includes("@");
}
function isSenderAllowed(senderId, senderEmail, allowFrom, allowNameMatching = false) {
  if (allowFrom.includes("*")) {
    return true;
  }
  const normalizedSenderId = normalizeUserId(senderId);
  const normalizedEmail = senderEmail?.trim().toLowerCase() ?? "";
  return allowFrom.some((entry) => {
    const normalized = String(entry).trim().toLowerCase();
    if (!normalized) {
      return false;
    }
    const withoutPrefix = normalized.replace(/^(googlechat|google-chat|gchat):/i, "");
    if (withoutPrefix.startsWith("users/")) {
      return normalizeUserId(withoutPrefix) === normalizedSenderId;
    }
    if (allowNameMatching && normalizedEmail && isEmailLike(withoutPrefix)) {
      return withoutPrefix === normalizedEmail;
    }
    return withoutPrefix.replace(/^users\//i, "") === normalizedSenderId;
  });
}
function resolveGroupConfig(params) {
  const { groupId, groupName, groups } = params;
  const entries = groups ?? {};
  const keys = Object.keys(entries);
  if (keys.length === 0) {
    return { entry: void 0, allowlistConfigured: false };
  }
  const normalizedName = groupName?.trim().toLowerCase();
  const candidates = [groupId, groupName ?? "", normalizedName ?? ""].filter(Boolean);
  let entry = candidates.map((candidate) => entries[candidate]).find(Boolean);
  if (!entry && normalizedName) {
    entry = entries[normalizedName];
  }
  const fallback = entries["*"];
  return { entry: entry ?? fallback, allowlistConfigured: true, fallback };
}
function extractMentionInfo(annotations, botUser) {
  const mentionAnnotations = annotations.filter((entry) => entry.type === "USER_MENTION");
  const hasAnyMention = mentionAnnotations.length > 0;
  const botTargets = new Set(["users/app", botUser?.trim()].filter(Boolean));
  const wasMentioned = mentionAnnotations.some((entry) => {
    const userName = entry.userMention?.user?.name;
    if (!userName) {
      return false;
    }
    if (botTargets.has(userName)) {
      return true;
    }
    return normalizeUserId(userName) === "app";
  });
  return { hasAnyMention, wasMentioned };
}
var warnedDeprecatedUsersEmailAllowFrom = /* @__PURE__ */ new Set();
function warnDeprecatedUsersEmailEntries(logVerbose2, entries) {
  const deprecated = entries.map((v) => String(v).trim()).filter((v) => /^users\/.+@.+/i.test(v));
  if (deprecated.length === 0) {
    return;
  }
  const key = deprecated.map((v) => v.toLowerCase()).sort().join(",");
  if (warnedDeprecatedUsersEmailAllowFrom.has(key)) {
    return;
  }
  warnedDeprecatedUsersEmailAllowFrom.add(key);
  logVerbose2(
    `Deprecated allowFrom entry detected: "users/<email>" is no longer treated as an email allowlist. Use raw email (alice@example.com) or immutable user id (users/<id>). entries=${deprecated.join(", ")}`
  );
}
async function applyGoogleChatInboundAccessPolicy(params) {
  const {
    account,
    config,
    core,
    space,
    message,
    isGroup,
    senderId,
    senderName,
    senderEmail,
    rawBody,
    statusSink,
    logVerbose: logVerbose2
  } = params;
  const allowNameMatching = (0, import_googlechat5.isDangerousNameMatchingEnabled)(account.config);
  const spaceId = space.name ?? "";
  const pairing = (0, import_googlechat5.createScopedPairingAccess)({
    core,
    channel: "googlechat",
    accountId: account.accountId
  });
  const defaultGroupPolicy = (0, import_googlechat5.resolveDefaultGroupPolicy)(config);
  const { groupPolicy, providerMissingFallbackApplied } = (0, import_googlechat5.resolveAllowlistProviderRuntimeGroupPolicy)({
    providerConfigPresent: config.channels?.googlechat !== void 0,
    groupPolicy: account.config.groupPolicy,
    defaultGroupPolicy
  });
  (0, import_googlechat5.warnMissingProviderGroupPolicyFallbackOnce)({
    providerMissingFallbackApplied,
    providerKey: "googlechat",
    accountId: account.accountId,
    blockedLabel: import_googlechat5.GROUP_POLICY_BLOCKED_LABEL.space,
    log: logVerbose2
  });
  const groupConfigResolved = resolveGroupConfig({
    groupId: spaceId,
    groupName: space.displayName ?? null,
    groups: account.config.groups ?? void 0
  });
  const groupEntry = groupConfigResolved.entry;
  const groupUsers = groupEntry?.users ?? account.config.groupAllowFrom ?? [];
  let effectiveWasMentioned;
  if (isGroup) {
    const groupAllowlistConfigured = groupConfigResolved.allowlistConfigured;
    const routeAccess = (0, import_googlechat5.evaluateGroupRouteAccessForPolicy)({
      groupPolicy,
      routeAllowlistConfigured: groupAllowlistConfigured,
      routeMatched: Boolean(groupEntry),
      routeEnabled: groupEntry?.enabled !== false && groupEntry?.allow !== false
    });
    if (!routeAccess.allowed) {
      if (routeAccess.reason === "disabled") {
        logVerbose2(`drop group message (groupPolicy=disabled, space=${spaceId})`);
      } else if (routeAccess.reason === "empty_allowlist") {
        logVerbose2(`drop group message (groupPolicy=allowlist, no allowlist, space=${spaceId})`);
      } else if (routeAccess.reason === "route_not_allowlisted") {
        logVerbose2(`drop group message (not allowlisted, space=${spaceId})`);
      } else if (routeAccess.reason === "route_disabled") {
        logVerbose2(`drop group message (space disabled, space=${spaceId})`);
      }
      return { ok: false };
    }
    if (groupUsers.length > 0) {
      const normalizedGroupUsers2 = groupUsers.map((v) => String(v));
      warnDeprecatedUsersEmailEntries(logVerbose2, normalizedGroupUsers2);
      const ok = isSenderAllowed(senderId, senderEmail, normalizedGroupUsers2, allowNameMatching);
      if (!ok) {
        logVerbose2(`drop group message (sender not allowed, ${senderId})`);
        return { ok: false };
      }
    }
  }
  const dmPolicy2 = account.config.dm?.policy ?? "pairing";
  const configAllowFrom = (account.config.dm?.allowFrom ?? []).map((v) => String(v));
  const normalizedGroupUsers = groupUsers.map((v) => String(v));
  const senderGroupPolicy = (0, import_googlechat5.resolveSenderScopedGroupPolicy)({
    groupPolicy,
    groupAllowFrom: normalizedGroupUsers
  });
  const shouldComputeAuth = core.channel.commands.shouldComputeCommandAuthorized(rawBody, config);
  const storeAllowFrom = !isGroup && dmPolicy2 !== "allowlist" && (dmPolicy2 !== "open" || shouldComputeAuth) ? await pairing.readAllowFromStore().catch(() => []) : [];
  const access = (0, import_googlechat5.resolveDmGroupAccessWithLists)({
    isGroup,
    dmPolicy: dmPolicy2,
    groupPolicy: senderGroupPolicy,
    allowFrom: configAllowFrom,
    groupAllowFrom: normalizedGroupUsers,
    storeAllowFrom,
    groupAllowFromFallbackToAllowFrom: false,
    isSenderAllowed: (allowFrom) => isSenderAllowed(senderId, senderEmail, allowFrom, allowNameMatching)
  });
  const effectiveAllowFrom = access.effectiveAllowFrom;
  const effectiveGroupAllowFrom = access.effectiveGroupAllowFrom;
  warnDeprecatedUsersEmailEntries(logVerbose2, effectiveAllowFrom);
  const commandAllowFrom = isGroup ? effectiveGroupAllowFrom : effectiveAllowFrom;
  const useAccessGroups = config.commands?.useAccessGroups !== false;
  const senderAllowedForCommands = isSenderAllowed(
    senderId,
    senderEmail,
    commandAllowFrom,
    allowNameMatching
  );
  const commandAuthorized = shouldComputeAuth ? core.channel.commands.resolveCommandAuthorizedFromAuthorizers({
    useAccessGroups,
    authorizers: [
      { configured: commandAllowFrom.length > 0, allowed: senderAllowedForCommands }
    ]
  }) : void 0;
  if (isGroup) {
    const requireMention = groupEntry?.requireMention ?? account.config.requireMention ?? true;
    const annotations = message.annotations ?? [];
    const mentionInfo = extractMentionInfo(annotations, account.config.botUser);
    const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
      cfg: config,
      surface: "googlechat"
    });
    const mentionGate = (0, import_googlechat5.resolveMentionGatingWithBypass)({
      isGroup: true,
      requireMention,
      canDetectMention: true,
      wasMentioned: mentionInfo.wasMentioned,
      implicitMention: false,
      hasAnyMention: mentionInfo.hasAnyMention,
      allowTextCommands,
      hasControlCommand: core.channel.text.hasControlCommand(rawBody, config),
      commandAuthorized: commandAuthorized === true
    });
    effectiveWasMentioned = mentionGate.effectiveWasMentioned;
    if (mentionGate.shouldSkip) {
      logVerbose2(`drop group message (mention required, space=${spaceId})`);
      return { ok: false };
    }
  }
  if (isGroup && access.decision !== "allow") {
    logVerbose2(
      `drop group message (sender policy blocked, reason=${access.reason}, space=${spaceId})`
    );
    return { ok: false };
  }
  if (!isGroup) {
    if (account.config.dm?.enabled === false) {
      logVerbose2(`Blocked Google Chat DM from ${senderId} (dmPolicy=disabled)`);
      return { ok: false };
    }
    if (access.decision !== "allow") {
      if (access.decision === "pairing") {
        await (0, import_googlechat5.issuePairingChallenge)({
          channel: "googlechat",
          senderId,
          senderIdLine: `Your Google Chat user id: ${senderId}`,
          meta: { name: senderName || void 0, email: senderEmail },
          upsertPairingRequest: pairing.upsertPairingRequest,
          onCreated: () => {
            logVerbose2(`googlechat pairing request sender=${senderId}`);
          },
          sendPairingReply: async (text) => {
            await sendGoogleChatMessage({
              account,
              space: spaceId,
              text
            });
            statusSink?.({ lastOutboundAt: Date.now() });
          },
          onReplyError: (err) => {
            logVerbose2(`pairing reply failed for ${senderId}: ${String(err)}`);
          }
        });
      } else {
        logVerbose2(`Blocked unauthorized Google Chat sender ${senderId} (dmPolicy=${dmPolicy2})`);
      }
      return { ok: false };
    }
  }
  if (isGroup && core.channel.commands.isControlCommandMessage(rawBody, config) && commandAuthorized !== true) {
    logVerbose2(`googlechat: drop control command from ${senderId}`);
    return { ok: false };
  }
  return {
    ok: true,
    commandAuthorized,
    effectiveWasMentioned,
    groupSystemPrompt: groupEntry?.systemPrompt?.trim() || void 0
  };
}

// src/core/extensions/googlechat/src/monitor-webhook.ts
var import_googlechat6 = require("src/core/source/plugin-sdk/googlechat");
init_auth();
function extractBearerToken(header) {
  const authHeader = Array.isArray(header) ? String(header[0] ?? "") : String(header ?? "");
  return authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice("bearer ".length).trim() : "";
}
function parseGoogleChatInboundPayload(raw, res) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    res.statusCode = 400;
    res.end("invalid payload");
    return { ok: false };
  }
  let eventPayload = raw;
  let addOnBearerToken = "";
  const rawObj = raw;
  if (rawObj.commonEventObject?.hostApp === "CHAT" && rawObj.chat?.messagePayload) {
    const chat = rawObj.chat;
    const messagePayload = chat.messagePayload;
    eventPayload = {
      type: "MESSAGE",
      space: messagePayload?.space,
      message: messagePayload?.message,
      user: chat.user,
      eventTime: chat.eventTime
    };
    addOnBearerToken = String(rawObj.authorizationEventObject?.systemIdToken ?? "").trim();
  }
  const event = eventPayload;
  const eventType = event.type ?? eventPayload.eventType;
  if (typeof eventType !== "string") {
    res.statusCode = 400;
    res.end("invalid payload");
    return { ok: false };
  }
  if (!event.space || typeof event.space !== "object" || Array.isArray(event.space)) {
    res.statusCode = 400;
    res.end("invalid payload");
    return { ok: false };
  }
  if (eventType === "MESSAGE") {
    if (!event.message || typeof event.message !== "object" || Array.isArray(event.message)) {
      res.statusCode = 400;
      res.end("invalid payload");
      return { ok: false };
    }
  }
  return { ok: true, event, addOnBearerToken };
}
function createGoogleChatWebhookRequestHandler(params) {
  return async (req, res) => {
    return await (0, import_googlechat6.withResolvedWebhookRequestPipeline)({
      req,
      res,
      targetsByPath: params.webhookTargets,
      allowMethods: ["POST"],
      requireJsonContentType: true,
      inFlightLimiter: params.webhookInFlightLimiter,
      handle: async ({ targets }) => {
        const headerBearer = extractBearerToken(req.headers.authorization);
        let selectedTarget = null;
        let parsedEvent = null;
        const readAndParseEvent = async (profile) => {
          const body = await (0, import_googlechat6.readJsonWebhookBodyOrReject)({
            req,
            res,
            profile,
            emptyObjectOnEmpty: false,
            invalidJsonMessage: "invalid payload"
          });
          if (!body.ok) {
            return null;
          }
          const parsed = parseGoogleChatInboundPayload(body.value, res);
          return parsed.ok ? parsed : null;
        };
        if (headerBearer) {
          selectedTarget = await (0, import_googlechat6.resolveWebhookTargetWithAuthOrReject)({
            targets,
            res,
            isMatch: async (target) => {
              const verification = await verifyGoogleChatRequest({
                bearer: headerBearer,
                audienceType: target.audienceType,
                audience: target.audience
              });
              return verification.ok;
            }
          });
          if (!selectedTarget) {
            return true;
          }
          const parsed = await readAndParseEvent("post-auth");
          if (!parsed) {
            return true;
          }
          parsedEvent = parsed.event;
        } else {
          const parsed = await readAndParseEvent("pre-auth");
          if (!parsed) {
            return true;
          }
          parsedEvent = parsed.event;
          if (!parsed.addOnBearerToken) {
            res.statusCode = 401;
            res.end("unauthorized");
            return true;
          }
          selectedTarget = await (0, import_googlechat6.resolveWebhookTargetWithAuthOrReject)({
            targets,
            res,
            isMatch: async (target) => {
              const verification = await verifyGoogleChatRequest({
                bearer: parsed.addOnBearerToken,
                audienceType: target.audienceType,
                audience: target.audience
              });
              return verification.ok;
            }
          });
          if (!selectedTarget) {
            return true;
          }
        }
        if (!selectedTarget || !parsedEvent) {
          res.statusCode = 401;
          res.end("unauthorized");
          return true;
        }
        const dispatchTarget = selectedTarget;
        dispatchTarget.statusSink?.({ lastInboundAt: Date.now() });
        params.processEvent(parsedEvent, dispatchTarget).catch((err) => {
          dispatchTarget.runtime.error?.(
            `[${dispatchTarget.account.accountId}] Google Chat webhook failed: ${String(err)}`
          );
        });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end("{}");
        return true;
      }
    });
  };
}

// src/core/extensions/googlechat/src/monitor.ts
var webhookTargets = /* @__PURE__ */ new Map();
var webhookInFlightLimiter = (0, import_googlechat7.createWebhookInFlightLimiter)();
var googleChatWebhookRequestHandler = createGoogleChatWebhookRequestHandler({
  webhookTargets,
  webhookInFlightLimiter,
  processEvent: async (event, target) => {
    await processGoogleChatEvent(event, target);
  }
});
function logVerbose(core, runtime, message) {
  if (core.logging.shouldLogVerbose()) {
    runtime.log?.(`[googlechat] ${message}`);
  }
}
function registerGoogleChatWebhookTarget(target) {
  return (0, import_googlechat7.registerWebhookTargetWithPluginRoute)({
    targetsByPath: webhookTargets,
    target,
    route: {
      auth: "plugin",
      match: "exact",
      pluginId: "googlechat",
      source: "googlechat-webhook",
      accountId: target.account.accountId,
      log: target.runtime.log,
      handler: async (req, res) => {
        const handled = await handleGoogleChatWebhookRequest(req, res);
        if (!handled && !res.headersSent) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Not Found");
        }
      }
    }
  }).unregister;
}
function normalizeAudienceType(value) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "app-url" || normalized === "app_url" || normalized === "app") {
    return "app-url";
  }
  if (normalized === "project-number" || normalized === "project_number" || normalized === "project") {
    return "project-number";
  }
  return void 0;
}
async function handleGoogleChatWebhookRequest(req, res) {
  return await googleChatWebhookRequestHandler(req, res);
}
async function processGoogleChatEvent(event, target) {
  const eventType = event.type ?? event.eventType;
  if (eventType !== "MESSAGE") {
    return;
  }
  if (!event.message || !event.space) {
    return;
  }
  await processMessageWithPipeline({
    event,
    account: target.account,
    config: target.config,
    runtime: target.runtime,
    core: target.core,
    statusSink: target.statusSink,
    mediaMaxMb: target.mediaMaxMb
  });
}
function resolveBotDisplayName(params) {
  const { accountName, agentId, config } = params;
  if (accountName?.trim()) {
    return accountName.trim();
  }
  const agent = config.agents?.list?.find((a) => a.id === agentId);
  if (agent?.name?.trim()) {
    return agent.name.trim();
  }
  return "Must-b";
}
async function processMessageWithPipeline(params) {
  const { event, account, config, runtime, core, statusSink, mediaMaxMb } = params;
  const space = event.space;
  const message = event.message;
  if (!space || !message) {
    return;
  }
  const spaceId = space.name ?? "";
  if (!spaceId) {
    return;
  }
  const spaceType = (space.type ?? "").toUpperCase();
  const isGroup = spaceType !== "DM";
  const sender = message.sender ?? event.user;
  const senderId = sender?.name ?? "";
  const senderName = sender?.displayName ?? "";
  const senderEmail = sender?.email ?? void 0;
  const allowBots = account.config.allowBots === true;
  if (!allowBots) {
    if (sender?.type?.toUpperCase() === "BOT") {
      logVerbose(core, runtime, `skip bot-authored message (${senderId || "unknown"})`);
      return;
    }
    if (senderId === "users/app") {
      logVerbose(core, runtime, "skip app-authored message");
      return;
    }
  }
  const messageText = (message.argumentText ?? message.text ?? "").trim();
  const attachments = message.attachment ?? [];
  const hasMedia = attachments.length > 0;
  const rawBody = messageText || (hasMedia ? "<media:attachment>" : "");
  if (!rawBody) {
    return;
  }
  const access = await applyGoogleChatInboundAccessPolicy({
    account,
    config,
    core,
    space,
    message,
    isGroup,
    senderId,
    senderName,
    senderEmail,
    rawBody,
    statusSink,
    logVerbose: (message2) => logVerbose(core, runtime, message2)
  });
  if (!access.ok) {
    return;
  }
  const { commandAuthorized, effectiveWasMentioned, groupSystemPrompt } = access;
  const { route, buildEnvelope } = (0, import_googlechat7.resolveInboundRouteEnvelopeBuilderWithRuntime)({
    cfg: config,
    channel: "googlechat",
    accountId: account.accountId,
    peer: {
      kind: isGroup ? "group" : "direct",
      id: spaceId
    },
    runtime: core.channel,
    sessionStore: config.session?.store
  });
  let mediaPath;
  let mediaType;
  if (attachments.length > 0) {
    const first = attachments[0];
    const attachmentData = await downloadAttachment(first, account, mediaMaxMb, core);
    if (attachmentData) {
      mediaPath = attachmentData.path;
      mediaType = attachmentData.contentType;
    }
  }
  const fromLabel = isGroup ? space.displayName || `space:${spaceId}` : senderName || `user:${senderId}`;
  const { storePath, body } = buildEnvelope({
    channel: "Google Chat",
    from: fromLabel,
    timestamp: event.eventTime ? Date.parse(event.eventTime) : void 0,
    body: rawBody
  });
  const ctxPayload = core.channel.reply.finalizeInboundContext({
    Body: body,
    BodyForAgent: rawBody,
    RawBody: rawBody,
    CommandBody: rawBody,
    From: `googlechat:${senderId}`,
    To: `googlechat:${spaceId}`,
    SessionKey: route.sessionKey,
    AccountId: route.accountId,
    ChatType: isGroup ? "channel" : "direct",
    ConversationLabel: fromLabel,
    SenderName: senderName || void 0,
    SenderId: senderId,
    SenderUsername: senderEmail,
    WasMentioned: isGroup ? effectiveWasMentioned : void 0,
    CommandAuthorized: commandAuthorized,
    Provider: "googlechat",
    Surface: "googlechat",
    MessageSid: message.name,
    MessageSidFull: message.name,
    ReplyToId: message.thread?.name,
    ReplyToIdFull: message.thread?.name,
    MediaPath: mediaPath,
    MediaType: mediaType,
    MediaUrl: mediaPath,
    GroupSpace: isGroup ? space.displayName ?? void 0 : void 0,
    GroupSystemPrompt: isGroup ? groupSystemPrompt : void 0,
    OriginatingChannel: "googlechat",
    OriginatingTo: `googlechat:${spaceId}`
  });
  void core.channel.session.recordSessionMetaFromInbound({
    storePath,
    sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
    ctx: ctxPayload
  }).catch((err) => {
    runtime.error?.(`googlechat: failed updating session meta: ${String(err)}`);
  });
  let typingIndicator = account.config.typingIndicator ?? "message";
  if (typingIndicator === "reaction") {
    runtime.error?.(
      `[${account.accountId}] typingIndicator="reaction" requires user OAuth (not supported with service account). Falling back to "message" mode.`
    );
    typingIndicator = "message";
  }
  let typingMessageName;
  if (typingIndicator === "message") {
    try {
      const botName = resolveBotDisplayName({
        accountName: account.config.name,
        agentId: route.agentId,
        config
      });
      const result = await sendGoogleChatMessage({
        account,
        space: spaceId,
        text: `_${botName} is typing..._`,
        thread: message.thread?.name
      });
      typingMessageName = result?.messageName;
    } catch (err) {
      runtime.error?.(`Failed sending typing message: ${String(err)}`);
    }
  }
  const { onModelSelected, ...prefixOptions } = (0, import_googlechat7.createReplyPrefixOptions)({
    cfg: config,
    agentId: route.agentId,
    channel: "googlechat",
    accountId: route.accountId
  });
  await core.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
    ctx: ctxPayload,
    cfg: config,
    dispatcherOptions: {
      ...prefixOptions,
      deliver: async (payload) => {
        await deliverGoogleChatReply({
          payload,
          account,
          spaceId,
          runtime,
          core,
          config,
          statusSink,
          typingMessageName
        });
        typingMessageName = void 0;
      },
      onError: (err, info) => {
        runtime.error?.(
          `[${account.accountId}] Google Chat ${info.kind} reply failed: ${String(err)}`
        );
      }
    },
    replyOptions: {
      onModelSelected
    }
  });
}
async function downloadAttachment(attachment, account, mediaMaxMb, core) {
  const resourceName = attachment.attachmentDataRef?.resourceName;
  if (!resourceName) {
    return null;
  }
  const maxBytes = Math.max(1, mediaMaxMb) * 1024 * 1024;
  const downloaded = await downloadGoogleChatMedia({ account, resourceName, maxBytes });
  const saved = await core.channel.media.saveMediaBuffer(
    downloaded.buffer,
    downloaded.contentType ?? attachment.contentType,
    "inbound",
    maxBytes,
    attachment.contentName
  );
  return { path: saved.path, contentType: saved.contentType };
}
async function deliverGoogleChatReply(params) {
  const { payload, account, spaceId, runtime, core, config, statusSink, typingMessageName } = params;
  const mediaList = payload.mediaUrls?.length ? payload.mediaUrls : payload.mediaUrl ? [payload.mediaUrl] : [];
  if (mediaList.length > 0) {
    let suppressCaption = false;
    if (typingMessageName) {
      try {
        await deleteGoogleChatMessage({
          account,
          messageName: typingMessageName
        });
      } catch (err) {
        runtime.error?.(`Google Chat typing cleanup failed: ${String(err)}`);
        const fallbackText = payload.text?.trim() ? payload.text : mediaList.length > 1 ? "Sent attachments." : "Sent attachment.";
        try {
          await updateGoogleChatMessage({
            account,
            messageName: typingMessageName,
            text: fallbackText
          });
          suppressCaption = Boolean(payload.text?.trim());
        } catch (updateErr) {
          runtime.error?.(`Google Chat typing update failed: ${String(updateErr)}`);
        }
      }
    }
    let first = true;
    for (const mediaUrl of mediaList) {
      const caption = first && !suppressCaption ? payload.text : void 0;
      first = false;
      try {
        const loaded = await core.channel.media.fetchRemoteMedia({
          url: mediaUrl,
          maxBytes: (account.config.mediaMaxMb ?? 20) * 1024 * 1024
        });
        const upload = await uploadAttachmentForReply({
          account,
          spaceId,
          buffer: loaded.buffer,
          contentType: loaded.contentType,
          filename: loaded.fileName ?? "attachment"
        });
        if (!upload.attachmentUploadToken) {
          throw new Error("missing attachment upload token");
        }
        await sendGoogleChatMessage({
          account,
          space: spaceId,
          text: caption,
          thread: payload.replyToId,
          attachments: [
            { attachmentUploadToken: upload.attachmentUploadToken, contentName: loaded.fileName }
          ]
        });
        statusSink?.({ lastOutboundAt: Date.now() });
      } catch (err) {
        runtime.error?.(`Google Chat attachment send failed: ${String(err)}`);
      }
    }
    return;
  }
  if (payload.text) {
    const chunkLimit = account.config.textChunkLimit ?? 4e3;
    const chunkMode = core.channel.text.resolveChunkMode(config, "googlechat", account.accountId);
    const chunks = core.channel.text.chunkMarkdownTextWithMode(payload.text, chunkLimit, chunkMode);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        if (i === 0 && typingMessageName) {
          await updateGoogleChatMessage({
            account,
            messageName: typingMessageName,
            text: chunk
          });
        } else {
          await sendGoogleChatMessage({
            account,
            space: spaceId,
            text: chunk,
            thread: payload.replyToId
          });
        }
        statusSink?.({ lastOutboundAt: Date.now() });
      } catch (err) {
        runtime.error?.(`Google Chat message send failed: ${String(err)}`);
      }
    }
  }
}
async function uploadAttachmentForReply(params) {
  const { account, spaceId, buffer, contentType, filename } = params;
  const { uploadGoogleChatAttachment: uploadGoogleChatAttachment2 } = await Promise.resolve().then(() => (init_api(), api_exports));
  return await uploadGoogleChatAttachment2({
    account,
    space: spaceId,
    filename,
    buffer,
    contentType
  });
}
function monitorGoogleChatProvider(options) {
  const core = getGoogleChatRuntime();
  const webhookPath = (0, import_googlechat7.resolveWebhookPath)({
    webhookPath: options.webhookPath,
    webhookUrl: options.webhookUrl,
    defaultPath: "/googlechat"
  });
  if (!webhookPath) {
    options.runtime.error?.(`[${options.account.accountId}] invalid webhook path`);
    return () => {
    };
  }
  const audienceType = normalizeAudienceType(options.account.config.audienceType);
  const audience = options.account.config.audience?.trim();
  const mediaMaxMb = options.account.config.mediaMaxMb ?? 20;
  const unregisterTarget = registerGoogleChatWebhookTarget({
    account: options.account,
    config: options.config,
    runtime: options.runtime,
    core,
    path: webhookPath,
    audienceType,
    audience,
    statusSink: options.statusSink,
    mediaMaxMb
  });
  return () => {
    unregisterTarget();
  };
}
async function startGoogleChatMonitor(params) {
  return monitorGoogleChatProvider(params);
}
function resolveGoogleChatWebhookPath(params) {
  return (0, import_googlechat7.resolveWebhookPath)({
    webhookPath: params.account.config.webhookPath,
    webhookUrl: params.account.config.webhookUrl,
    defaultPath: "/googlechat"
  }) ?? "/googlechat";
}

// src/core/extensions/googlechat/src/onboarding.ts
var import_googlechat8 = require("src/core/source/plugin-sdk/googlechat");
var channel = "googlechat";
var ENV_SERVICE_ACCOUNT2 = "GOOGLE_CHAT_SERVICE_ACCOUNT";
var ENV_SERVICE_ACCOUNT_FILE2 = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
function setGoogleChatDmPolicy(cfg, policy) {
  const allowFrom = policy === "open" ? (0, import_googlechat8.addWildcardAllowFrom)(cfg.channels?.["googlechat"]?.dm?.allowFrom) : void 0;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      googlechat: {
        ...cfg.channels?.["googlechat"],
        dm: {
          ...cfg.channels?.["googlechat"]?.dm,
          policy,
          ...allowFrom ? { allowFrom } : {}
        }
      }
    }
  };
}
async function promptAllowFrom(params) {
  const current = params.cfg.channels?.["googlechat"]?.dm?.allowFrom ?? [];
  const entry = await params.prompter.text({
    message: "Google Chat allowFrom (users/<id> or raw email; avoid users/<email>)",
    placeholder: "users/123456789, name@example.com",
    initialValue: current[0] ? String(current[0]) : void 0,
    validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
  });
  const parts = (0, import_googlechat8.splitOnboardingEntries)(String(entry));
  const unique = (0, import_googlechat8.mergeAllowFromEntries)(void 0, parts);
  return {
    ...params.cfg,
    channels: {
      ...params.cfg.channels,
      googlechat: {
        ...params.cfg.channels?.["googlechat"],
        enabled: true,
        dm: {
          ...params.cfg.channels?.["googlechat"]?.dm,
          policy: "allowlist",
          allowFrom: unique
        }
      }
    }
  };
}
var dmPolicy = {
  label: "Google Chat",
  channel,
  policyKey: "channels.googlechat.dm.policy",
  allowFromKey: "channels.googlechat.dm.allowFrom",
  getCurrent: (cfg) => cfg.channels?.["googlechat"]?.dm?.policy ?? "pairing",
  setPolicy: (cfg, policy) => setGoogleChatDmPolicy(cfg, policy),
  promptAllowFrom
};
async function promptCredentials(params) {
  const { cfg, prompter, accountId } = params;
  const envReady = accountId === import_googlechat8.DEFAULT_ACCOUNT_ID && (Boolean(process.env[ENV_SERVICE_ACCOUNT2]) || Boolean(process.env[ENV_SERVICE_ACCOUNT_FILE2]));
  if (envReady) {
    const useEnv = await prompter.confirm({
      message: "Use GOOGLE_CHAT_SERVICE_ACCOUNT env vars?",
      initialValue: true
    });
    if (useEnv) {
      return (0, import_googlechat8.applySetupAccountConfigPatch)({ cfg, channelKey: channel, accountId, patch: {} });
    }
  }
  const method = await prompter.select({
    message: "Google Chat auth method",
    options: [
      { value: "file", label: "Service account JSON file" },
      { value: "inline", label: "Paste service account JSON" }
    ],
    initialValue: "file"
  });
  if (method === "file") {
    const path = await prompter.text({
      message: "Service account JSON path",
      placeholder: "/path/to/service-account.json",
      validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
    });
    return (0, import_googlechat8.applySetupAccountConfigPatch)({
      cfg,
      channelKey: channel,
      accountId,
      patch: { serviceAccountFile: String(path).trim() }
    });
  }
  const json = await prompter.text({
    message: "Service account JSON (single line)",
    placeholder: '{"type":"service_account", ... }',
    validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
  });
  return (0, import_googlechat8.applySetupAccountConfigPatch)({
    cfg,
    channelKey: channel,
    accountId,
    patch: { serviceAccount: String(json).trim() }
  });
}
async function promptAudience(params) {
  const account = resolveGoogleChatAccount({
    cfg: params.cfg,
    accountId: params.accountId
  });
  const currentType = account.config.audienceType ?? "app-url";
  const currentAudience = account.config.audience ?? "";
  const audienceType = await params.prompter.select({
    message: "Webhook audience type",
    options: [
      { value: "app-url", label: "App URL (recommended)" },
      { value: "project-number", label: "Project number" }
    ],
    initialValue: currentType === "project-number" ? "project-number" : "app-url"
  });
  const audience = await params.prompter.text({
    message: audienceType === "project-number" ? "Project number" : "App URL",
    placeholder: audienceType === "project-number" ? "1234567890" : "https://your.host/googlechat",
    initialValue: currentAudience || void 0,
    validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
  });
  return (0, import_googlechat8.applySetupAccountConfigPatch)({
    cfg: params.cfg,
    channelKey: channel,
    accountId: params.accountId,
    patch: { audienceType, audience: String(audience).trim() }
  });
}
async function noteGoogleChatSetup(prompter) {
  await prompter.note(
    [
      "Google Chat apps use service-account auth and an HTTPS webhook.",
      "Set the Chat API scopes in your service account and configure the Chat app URL.",
      "Webhook verification requires audience type + audience value.",
      `Docs: ${(0, import_googlechat8.formatDocsLink)("/channels/googlechat", "channels/googlechat")}`
    ].join("\n"),
    "Google Chat setup"
  );
}
var googlechatOnboardingAdapter = {
  channel,
  dmPolicy,
  getStatus: async ({ cfg }) => {
    const configured = listGoogleChatAccountIds(cfg).some(
      (accountId) => resolveGoogleChatAccount({ cfg, accountId }).credentialSource !== "none"
    );
    return {
      channel,
      configured,
      statusLines: [`Google Chat: ${configured ? "configured" : "needs service account"}`],
      selectionHint: configured ? "configured" : "needs auth"
    };
  },
  configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
    const defaultAccountId = resolveDefaultGoogleChatAccountId(cfg);
    const accountId = await (0, import_googlechat8.resolveAccountIdForConfigure)({
      cfg,
      prompter,
      label: "Google Chat",
      accountOverride: accountOverrides["googlechat"],
      shouldPromptAccountIds,
      listAccountIds: listGoogleChatAccountIds,
      defaultAccountId
    });
    let next = cfg;
    await noteGoogleChatSetup(prompter);
    next = await promptCredentials({ cfg: next, prompter, accountId });
    next = await promptAudience({ cfg: next, prompter, accountId });
    const namedConfig = (0, import_googlechat8.migrateBaseNameToDefaultAccount)({
      cfg: next,
      channelKey: "googlechat"
    });
    return { cfg: namedConfig, accountId };
  }
};

// src/core/extensions/googlechat/src/channel.ts
var meta = (0, import_googlechat9.getChatChannelMeta)("googlechat");
var formatAllowFromEntry = (entry) => entry.trim().replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:/i, "").replace(/^users\//i, "").toLowerCase();
var googleChatConfigAccessors = (0, import_compat3.createScopedAccountConfigAccessors)({
  resolveAccount: ({ cfg, accountId }) => resolveGoogleChatAccount({ cfg, accountId }),
  resolveAllowFrom: (account) => account.config.dm?.allowFrom,
  formatAllowFrom: (allowFrom) => (0, import_compat3.formatNormalizedAllowFromEntries)({
    allowFrom,
    normalizeEntry: formatAllowFromEntry
  }),
  resolveDefaultTo: (account) => account.config.defaultTo
});
var googleChatConfigBase = (0, import_compat2.createScopedChannelConfigBase)({
  sectionKey: "googlechat",
  listAccountIds: listGoogleChatAccountIds,
  resolveAccount: (cfg, accountId) => resolveGoogleChatAccount({ cfg, accountId }),
  defaultAccountId: resolveDefaultGoogleChatAccountId,
  clearBaseFields: [
    "serviceAccount",
    "serviceAccountFile",
    "audienceType",
    "audience",
    "webhookPath",
    "webhookUrl",
    "botUser",
    "name"
  ]
});
var resolveGoogleChatDmPolicy = (0, import_compat3.createScopedDmSecurityResolver)({
  channelKey: "googlechat",
  resolvePolicy: (account) => account.config.dm?.policy,
  resolveAllowFrom: (account) => account.config.dm?.allowFrom,
  allowFromPathSuffix: "dm.",
  normalizeEntry: (raw) => formatAllowFromEntry(raw)
});
var googlechatDock = {
  id: "googlechat",
  capabilities: {
    chatTypes: ["direct", "group", "thread"],
    reactions: true,
    media: true,
    threads: true,
    blockStreaming: true
  },
  outbound: { textChunkLimit: 4e3 },
  config: googleChatConfigAccessors,
  groups: {
    resolveRequireMention: import_googlechat9.resolveGoogleChatGroupRequireMention
  },
  threading: {
    resolveReplyToMode: ({ cfg }) => cfg.channels?.["googlechat"]?.replyToMode ?? "off",
    buildToolContext: ({ context, hasRepliedRef }) => {
      const threadId = context.MessageThreadId ?? context.ReplyToId;
      return {
        currentChannelId: context.To?.trim() || void 0,
        currentThreadTs: threadId != null ? String(threadId) : void 0,
        hasRepliedRef
      };
    }
  }
};
var googlechatActions = {
  listActions: (ctx) => googlechatMessageActions.listActions?.(ctx) ?? [],
  extractToolSend: (ctx) => googlechatMessageActions.extractToolSend?.(ctx) ?? null,
  handleAction: async (ctx) => {
    if (!googlechatMessageActions.handleAction) {
      throw new Error("Google Chat actions are not available.");
    }
    return await googlechatMessageActions.handleAction(ctx);
  }
};
var googlechatPlugin = {
  id: "googlechat",
  meta: { ...meta },
  onboarding: googlechatOnboardingAdapter,
  pairing: {
    idLabel: "googlechatUserId",
    normalizeAllowEntry: (entry) => formatAllowFromEntry(entry),
    notifyApproval: async ({ cfg, id }) => {
      const account = resolveGoogleChatAccount({ cfg });
      if (account.credentialSource === "none") {
        return;
      }
      const user = normalizeGoogleChatTarget(id) ?? id;
      const target = isGoogleChatUserTarget(user) ? user : `users/${user}`;
      const space = await resolveGoogleChatOutboundSpace({ account, target });
      await sendGoogleChatMessage({
        account,
        space,
        text: import_googlechat9.PAIRING_APPROVED_MESSAGE
      });
    }
  },
  capabilities: {
    chatTypes: ["direct", "group", "thread"],
    reactions: true,
    threads: true,
    media: true,
    nativeCommands: false,
    blockStreaming: true
  },
  streaming: {
    blockStreamingCoalesceDefaults: { minChars: 1500, idleMs: 1e3 }
  },
  reload: { configPrefixes: ["channels.googlechat"] },
  configSchema: (0, import_googlechat9.buildChannelConfigSchema)(import_googlechat10.GoogleChatConfigSchema),
  config: {
    ...googleChatConfigBase,
    isConfigured: (account) => account.credentialSource !== "none",
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: account.credentialSource !== "none",
      credentialSource: account.credentialSource
    }),
    ...googleChatConfigAccessors
  },
  security: {
    resolveDmPolicy: resolveGoogleChatDmPolicy,
    collectWarnings: ({ account, cfg }) => {
      const warnings = (0, import_compat3.collectAllowlistProviderGroupPolicyWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.googlechat !== void 0,
        configuredGroupPolicy: account.config.groupPolicy,
        collect: (groupPolicy) => groupPolicy === "open" ? [
          (0, import_compat3.buildOpenGroupPolicyConfigureRouteAllowlistWarning)({
            surface: "Google Chat spaces",
            openScope: "any space",
            groupPolicyPath: "channels.googlechat.groupPolicy",
            routeAllowlistPath: "channels.googlechat.groups"
          })
        ] : []
      });
      if (account.config.dm?.policy === "open") {
        warnings.push(
          `- Google Chat DMs are open to anyone. Set channels.googlechat.dm.policy="pairing" or "allowlist".`
        );
      }
      return warnings;
    }
  },
  groups: {
    resolveRequireMention: import_googlechat9.resolveGoogleChatGroupRequireMention
  },
  threading: {
    resolveReplyToMode: ({ cfg }) => cfg.channels?.["googlechat"]?.replyToMode ?? "off"
  },
  messaging: {
    normalizeTarget: normalizeGoogleChatTarget,
    targetResolver: {
      looksLikeId: (raw, normalized) => {
        const value = normalized ?? raw.trim();
        return isGoogleChatSpaceTarget(value) || isGoogleChatUserTarget(value);
      },
      hint: "<spaces/{space}|users/{user}>"
    }
  },
  directory: {
    self: async () => null,
    listPeers: async ({ cfg, accountId, query, limit }) => {
      const account = resolveGoogleChatAccount({
        cfg,
        accountId
      });
      return (0, import_googlechat9.listDirectoryUserEntriesFromAllowFrom)({
        allowFrom: account.config.dm?.allowFrom,
        query,
        limit,
        normalizeId: (entry) => normalizeGoogleChatTarget(entry) ?? entry
      });
    },
    listGroups: async ({ cfg, accountId, query, limit }) => {
      const account = resolveGoogleChatAccount({
        cfg,
        accountId
      });
      return (0, import_googlechat9.listDirectoryGroupEntriesFromMapKeys)({
        groups: account.config.groups,
        query,
        limit
      });
    }
  },
  resolver: {
    resolveTargets: async ({ inputs, kind }) => {
      const resolved = inputs.map((input) => {
        const normalized = normalizeGoogleChatTarget(input);
        if (!normalized) {
          return { input, resolved: false, note: "empty target" };
        }
        if (kind === "user" && isGoogleChatUserTarget(normalized)) {
          return { input, resolved: true, id: normalized };
        }
        if (kind === "group" && isGoogleChatSpaceTarget(normalized)) {
          return { input, resolved: true, id: normalized };
        }
        return {
          input,
          resolved: false,
          note: "use spaces/{space} or users/{user}"
        };
      });
      return resolved;
    }
  },
  actions: googlechatActions,
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_googlechat9.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_googlechat9.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "googlechat",
      accountId,
      name
    }),
    validateInput: ({ accountId, input }) => {
      if (input.useEnv && accountId !== import_googlechat9.DEFAULT_ACCOUNT_ID) {
        return "GOOGLE_CHAT_SERVICE_ACCOUNT env vars can only be used for the default account.";
      }
      if (!input.useEnv && !input.token && !input.tokenFile) {
        return "Google Chat requires --token (service account JSON) or --token-file.";
      }
      return null;
    },
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_googlechat9.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "googlechat",
        accountId,
        name: input.name
      });
      const next = accountId !== import_googlechat9.DEFAULT_ACCOUNT_ID ? (0, import_googlechat9.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "googlechat"
      }) : namedConfig;
      const patch = input.useEnv ? {} : input.tokenFile ? { serviceAccountFile: input.tokenFile } : input.token ? { serviceAccount: input.token } : {};
      const audienceType = input.audienceType?.trim();
      const audience = input.audience?.trim();
      const webhookPath = input.webhookPath?.trim();
      const webhookUrl = input.webhookUrl?.trim();
      const configPatch = {
        ...patch,
        ...audienceType ? { audienceType } : {},
        ...audience ? { audience } : {},
        ...webhookPath ? { webhookPath } : {},
        ...webhookUrl ? { webhookUrl } : {}
      };
      return (0, import_googlechat9.applySetupAccountConfigPatch)({
        cfg: next,
        channelKey: "googlechat",
        accountId,
        patch: configPatch
      });
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getGoogleChatRuntime().channel.text.chunkMarkdownText(text, limit),
    chunkerMode: "markdown",
    textChunkLimit: 4e3,
    resolveTarget: ({ to }) => {
      const trimmed = to?.trim() ?? "";
      if (trimmed) {
        const normalized = normalizeGoogleChatTarget(trimmed);
        if (!normalized) {
          return {
            ok: false,
            error: (0, import_googlechat9.missingTargetError)("Google Chat", "<spaces/{space}|users/{user}>")
          };
        }
        return { ok: true, to: normalized };
      }
      return {
        ok: false,
        error: (0, import_googlechat9.missingTargetError)("Google Chat", "<spaces/{space}|users/{user}>")
      };
    },
    sendText: async ({ cfg, to, text, accountId, replyToId, threadId }) => {
      const account = resolveGoogleChatAccount({
        cfg,
        accountId
      });
      const space = await resolveGoogleChatOutboundSpace({ account, target: to });
      const thread = threadId ?? replyToId ?? void 0;
      const result = await sendGoogleChatMessage({
        account,
        space,
        text,
        thread
      });
      return {
        channel: "googlechat",
        messageId: result?.messageName ?? "",
        chatId: space
      };
    },
    sendMedia: async ({
      cfg,
      to,
      text,
      mediaUrl,
      mediaLocalRoots,
      accountId,
      replyToId,
      threadId
    }) => {
      if (!mediaUrl) {
        throw new Error("Google Chat mediaUrl is required.");
      }
      const account = resolveGoogleChatAccount({
        cfg,
        accountId
      });
      const space = await resolveGoogleChatOutboundSpace({ account, target: to });
      const thread = threadId ?? replyToId ?? void 0;
      const runtime = getGoogleChatRuntime();
      const maxBytes = (0, import_googlechat9.resolveChannelMediaMaxBytes)({
        cfg,
        resolveChannelLimitMb: ({ cfg: cfg2, accountId: accountId2 }) => cfg2.channels?.["googlechat"]?.accounts?.[accountId2]?.mediaMaxMb ?? cfg2.channels?.["googlechat"]?.mediaMaxMb,
        accountId
      });
      const effectiveMaxBytes = maxBytes ?? (account.config.mediaMaxMb ?? 20) * 1024 * 1024;
      const loaded = /^https?:\/\//i.test(mediaUrl) ? await runtime.channel.media.fetchRemoteMedia({
        url: mediaUrl,
        maxBytes: effectiveMaxBytes
      }) : await runtime.media.loadWebMedia(mediaUrl, {
        maxBytes: effectiveMaxBytes,
        localRoots: mediaLocalRoots?.length ? mediaLocalRoots : void 0
      });
      const upload = await uploadGoogleChatAttachment({
        account,
        space,
        filename: loaded.fileName ?? "attachment",
        buffer: loaded.buffer,
        contentType: loaded.contentType
      });
      const result = await sendGoogleChatMessage({
        account,
        space,
        text,
        thread,
        attachments: upload.attachmentUploadToken ? [{ attachmentUploadToken: upload.attachmentUploadToken, contentName: loaded.fileName }] : void 0
      });
      return {
        channel: "googlechat",
        messageId: result?.messageName ?? "",
        chatId: space
      };
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_googlechat9.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    collectStatusIssues: (accounts) => accounts.flatMap((entry) => {
      const accountId = String(entry.accountId ?? import_googlechat9.DEFAULT_ACCOUNT_ID);
      const enabled = entry.enabled !== false;
      const configured = entry.configured === true;
      if (!enabled || !configured) {
        return [];
      }
      const issues = [];
      if (!entry.audience) {
        issues.push({
          channel: "googlechat",
          accountId,
          kind: "config",
          message: "Google Chat audience is missing (set channels.googlechat.audience).",
          fix: "Set channels.googlechat.audienceType and channels.googlechat.audience."
        });
      }
      if (!entry.audienceType) {
        issues.push({
          channel: "googlechat",
          accountId,
          kind: "config",
          message: "Google Chat audienceType is missing (app-url or project-number).",
          fix: "Set channels.googlechat.audienceType and channels.googlechat.audience."
        });
      }
      return issues;
    }),
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      credentialSource: snapshot.credentialSource ?? "none",
      audienceType: snapshot.audienceType ?? null,
      audience: snapshot.audience ?? null,
      webhookPath: snapshot.webhookPath ?? null,
      webhookUrl: snapshot.webhookUrl ?? null,
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ account }) => probeGoogleChat(account),
    buildAccountSnapshot: ({ account, runtime, probe }) => {
      const base = (0, import_googlechat9.buildComputedAccountStatusSnapshot)({
        accountId: account.accountId,
        name: account.name,
        enabled: account.enabled,
        configured: account.credentialSource !== "none",
        runtime,
        probe
      });
      return {
        ...base,
        credentialSource: account.credentialSource,
        audienceType: account.config.audienceType,
        audience: account.config.audience,
        webhookPath: account.config.webhookPath,
        webhookUrl: account.config.webhookUrl,
        dmPolicy: account.config.dm?.policy ?? "pairing"
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      const statusSink = (0, import_googlechat9.createAccountStatusSink)({
        accountId: account.accountId,
        setStatus: ctx.setStatus
      });
      ctx.log?.info(`[${account.accountId}] starting Google Chat webhook`);
      statusSink({
        running: true,
        lastStartAt: Date.now(),
        webhookPath: resolveGoogleChatWebhookPath({ account }),
        audienceType: account.config.audienceType,
        audience: account.config.audience
      });
      await (0, import_googlechat9.runPassiveAccountLifecycle)({
        abortSignal: ctx.abortSignal,
        start: async () => await startGoogleChatMonitor({
          account,
          config: ctx.cfg,
          runtime: ctx.runtime,
          abortSignal: ctx.abortSignal,
          webhookPath: account.config.webhookPath,
          webhookUrl: account.config.webhookUrl,
          statusSink
        }),
        stop: async (unregister) => {
          unregister?.();
        },
        onStop: async () => {
          statusSink({
            running: false,
            lastStopAt: Date.now()
          });
        }
      });
    }
  }
};

// src/core/extensions/googlechat/index.ts
var plugin = {
  id: "googlechat",
  name: "Google Chat",
  description: "Must-b Google Chat channel plugin",
  configSchema: (0, import_googlechat11.emptyPluginConfigSchema)(),
  register(api) {
    setGoogleChatRuntime(api.runtime);
    api.registerChannel({ plugin: googlechatPlugin, dock: googlechatDock });
  }
};
var index_default = plugin;
