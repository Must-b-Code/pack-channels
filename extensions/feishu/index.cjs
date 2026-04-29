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

// src/core/extensions/feishu/src/secret-input.ts
var import_feishu;
var init_secret_input = __esm({
  "src/core/extensions/feishu/src/secret-input.ts"() {
    "use strict";
    import_feishu = require("src/core/source/plugin-sdk/feishu");
  }
});

// src/core/extensions/feishu/src/accounts.ts
function listConfiguredAccountIds(cfg) {
  const accounts = cfg.channels?.feishu?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return [];
  }
  return Object.keys(accounts).filter(Boolean);
}
function listFeishuAccountIds(cfg) {
  const ids = listConfiguredAccountIds(cfg);
  if (ids.length === 0) {
    return [import_account_id.DEFAULT_ACCOUNT_ID];
  }
  return [...ids].toSorted((a, b) => a.localeCompare(b));
}
function resolveDefaultFeishuAccountSelection(cfg) {
  const preferredRaw = cfg.channels?.feishu?.defaultAccount?.trim();
  const preferred = preferredRaw ? (0, import_account_id.normalizeAccountId)(preferredRaw) : void 0;
  if (preferred) {
    return {
      accountId: preferred,
      source: "explicit-default"
    };
  }
  const ids = listFeishuAccountIds(cfg);
  if (ids.includes(import_account_id.DEFAULT_ACCOUNT_ID)) {
    return {
      accountId: import_account_id.DEFAULT_ACCOUNT_ID,
      source: "mapped-default"
    };
  }
  return {
    accountId: ids[0] ?? import_account_id.DEFAULT_ACCOUNT_ID,
    source: "fallback"
  };
}
function resolveDefaultFeishuAccountId(cfg) {
  return resolveDefaultFeishuAccountSelection(cfg).accountId;
}
function resolveAccountConfig(cfg, accountId) {
  const accounts = cfg.channels?.feishu?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return void 0;
  }
  return accounts[accountId];
}
function mergeFeishuAccountConfig(cfg, accountId) {
  const feishuCfg = cfg.channels?.feishu;
  const { accounts: _ignored, defaultAccount: _ignoredDefaultAccount, ...base } = feishuCfg ?? {};
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  return { ...base, ...account };
}
function resolveFeishuCredentials(cfg, options) {
  const normalizeString2 = (value) => {
    if (typeof value !== "string") {
      return void 0;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : void 0;
  };
  const resolveSecretLike = (value, path5) => {
    const asString = normalizeString2(value);
    if (asString) {
      return asString;
    }
    if (options?.allowUnresolvedSecretRef && typeof value === "object" && value !== null) {
      const rec = value;
      const source = normalizeString2(rec.source)?.toLowerCase();
      const id = normalizeString2(rec.id);
      if (source === "env" && id) {
        const envValue = normalizeString2(process.env[id]);
        if (envValue) {
          return envValue;
        }
      }
    }
    if (options?.allowUnresolvedSecretRef) {
      return (0, import_feishu.normalizeSecretInputString)(value);
    }
    return (0, import_feishu.normalizeResolvedSecretInputString)({ value, path: path5 });
  };
  const appId = resolveSecretLike(cfg?.appId, "channels.feishu.appId");
  const appSecret = resolveSecretLike(cfg?.appSecret, "channels.feishu.appSecret");
  if (!appId || !appSecret) {
    return null;
  }
  const connectionMode = cfg?.connectionMode ?? "websocket";
  return {
    appId,
    appSecret,
    encryptKey: connectionMode === "webhook" ? resolveSecretLike(cfg?.encryptKey, "channels.feishu.encryptKey") : normalizeString2(cfg?.encryptKey),
    verificationToken: resolveSecretLike(
      cfg?.verificationToken,
      "channels.feishu.verificationToken"
    ),
    domain: cfg?.domain ?? "feishu"
  };
}
function resolveFeishuAccount(params) {
  const hasExplicitAccountId = typeof params.accountId === "string" && params.accountId.trim() !== "";
  const defaultSelection = hasExplicitAccountId ? null : resolveDefaultFeishuAccountSelection(params.cfg);
  const accountId = hasExplicitAccountId ? (0, import_account_id.normalizeAccountId)(params.accountId) : defaultSelection?.accountId ?? import_account_id.DEFAULT_ACCOUNT_ID;
  const selectionSource = hasExplicitAccountId ? "explicit" : defaultSelection?.source ?? "fallback";
  const feishuCfg = params.cfg.channels?.feishu;
  const baseEnabled = feishuCfg?.enabled !== false;
  const merged = mergeFeishuAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const creds = resolveFeishuCredentials(merged);
  const accountName = merged.name;
  return {
    accountId,
    selectionSource,
    enabled,
    configured: Boolean(creds),
    name: typeof accountName === "string" ? accountName.trim() || void 0 : void 0,
    appId: creds?.appId,
    appSecret: creds?.appSecret,
    encryptKey: creds?.encryptKey,
    verificationToken: creds?.verificationToken,
    domain: creds?.domain ?? "feishu",
    config: merged
  };
}
function listEnabledFeishuAccounts(cfg) {
  return listFeishuAccountIds(cfg).map((accountId) => resolveFeishuAccount({ cfg, accountId })).filter((account) => account.enabled && account.configured);
}
var import_account_id;
var init_accounts = __esm({
  "src/core/extensions/feishu/src/accounts.ts"() {
    "use strict";
    import_account_id = require("src/core/source/plugin-sdk/account-id");
    init_secret_input();
  }
});

// src/core/extensions/feishu/src/client.ts
function getWsProxyAgent() {
  const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
  if (!proxyUrl) return void 0;
  return new import_https_proxy_agent.HttpsProxyAgent(proxyUrl);
}
function resolveDomain(domain) {
  if (domain === "lark") {
    return Lark.Domain.Lark;
  }
  if (domain === "feishu" || !domain) {
    return Lark.Domain.Feishu;
  }
  return domain.replace(/\/+$/, "");
}
function createTimeoutHttpInstance(defaultTimeoutMs) {
  const base = Lark.defaultHttpInstance;
  function injectTimeout(opts) {
    return { timeout: defaultTimeoutMs, ...opts };
  }
  return {
    request: (opts) => base.request(injectTimeout(opts)),
    get: (url, opts) => base.get(url, injectTimeout(opts)),
    post: (url, data, opts) => base.post(url, data, injectTimeout(opts)),
    put: (url, data, opts) => base.put(url, data, injectTimeout(opts)),
    patch: (url, data, opts) => base.patch(url, data, injectTimeout(opts)),
    delete: (url, opts) => base.delete(url, injectTimeout(opts)),
    head: (url, opts) => base.head(url, injectTimeout(opts)),
    options: (url, opts) => base.options(url, injectTimeout(opts))
  };
}
function resolveConfiguredHttpTimeoutMs(creds) {
  const clampTimeout = (value) => {
    const rounded = Math.floor(value);
    return Math.min(Math.max(rounded, 1), FEISHU_HTTP_TIMEOUT_MAX_MS);
  };
  const fromDirectField = creds.httpTimeoutMs;
  if (typeof fromDirectField === "number" && Number.isFinite(fromDirectField) && fromDirectField > 0) {
    return clampTimeout(fromDirectField);
  }
  const envRaw = process.env[FEISHU_HTTP_TIMEOUT_ENV_VAR];
  if (envRaw) {
    const envValue = Number(envRaw);
    if (Number.isFinite(envValue) && envValue > 0) {
      return clampTimeout(envValue);
    }
  }
  const fromConfig = creds.config?.httpTimeoutMs;
  const timeout = fromConfig;
  if (typeof timeout !== "number" || !Number.isFinite(timeout) || timeout <= 0) {
    return FEISHU_HTTP_TIMEOUT_MS;
  }
  return clampTimeout(timeout);
}
function createFeishuClient(creds) {
  const { accountId = "default", appId, appSecret, domain } = creds;
  const defaultHttpTimeoutMs = resolveConfiguredHttpTimeoutMs(creds);
  if (!appId || !appSecret) {
    throw new Error(`Feishu credentials not configured for account "${accountId}"`);
  }
  const cached = clientCache.get(accountId);
  if (cached && cached.config.appId === appId && cached.config.appSecret === appSecret && cached.config.domain === domain && cached.config.httpTimeoutMs === defaultHttpTimeoutMs) {
    return cached.client;
  }
  const client = new Lark.Client({
    appId,
    appSecret,
    appType: Lark.AppType.SelfBuild,
    domain: resolveDomain(domain),
    httpInstance: createTimeoutHttpInstance(defaultHttpTimeoutMs)
  });
  clientCache.set(accountId, {
    client,
    config: { appId, appSecret, domain, httpTimeoutMs: defaultHttpTimeoutMs }
  });
  return client;
}
function createFeishuWSClient(account) {
  const { accountId, appId, appSecret, domain } = account;
  if (!appId || !appSecret) {
    throw new Error(`Feishu credentials not configured for account "${accountId}"`);
  }
  const agent = getWsProxyAgent();
  return new Lark.WSClient({
    appId,
    appSecret,
    domain: resolveDomain(domain),
    loggerLevel: Lark.LoggerLevel.info,
    ...agent ? { agent } : {}
  });
}
function createEventDispatcher(account) {
  return new Lark.EventDispatcher({
    encryptKey: account.encryptKey,
    verificationToken: account.verificationToken
  });
}
var Lark, import_https_proxy_agent, FEISHU_HTTP_TIMEOUT_MS, FEISHU_HTTP_TIMEOUT_MAX_MS, FEISHU_HTTP_TIMEOUT_ENV_VAR, clientCache;
var init_client = __esm({
  "src/core/extensions/feishu/src/client.ts"() {
    "use strict";
    Lark = __toESM(require("@larksuiteoapi/node-sdk"), 1);
    import_https_proxy_agent = require("https-proxy-agent");
    FEISHU_HTTP_TIMEOUT_MS = 3e4;
    FEISHU_HTTP_TIMEOUT_MAX_MS = 3e5;
    FEISHU_HTTP_TIMEOUT_ENV_VAR = "MUSTB_FEISHU_HTTP_TIMEOUT_MS";
    clientCache = /* @__PURE__ */ new Map();
  }
});

// src/core/extensions/feishu/src/targets.ts
function stripProviderPrefix(raw) {
  return raw.replace(/^(feishu|lark):/i, "").trim();
}
function normalizeFeishuTarget(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const withoutProvider = stripProviderPrefix(trimmed);
  const lowered = withoutProvider.toLowerCase();
  if (lowered.startsWith("chat:")) {
    return withoutProvider.slice("chat:".length).trim() || null;
  }
  if (lowered.startsWith("group:")) {
    return withoutProvider.slice("group:".length).trim() || null;
  }
  if (lowered.startsWith("channel:")) {
    return withoutProvider.slice("channel:".length).trim() || null;
  }
  if (lowered.startsWith("user:")) {
    return withoutProvider.slice("user:".length).trim() || null;
  }
  if (lowered.startsWith("dm:")) {
    return withoutProvider.slice("dm:".length).trim() || null;
  }
  if (lowered.startsWith("open_id:")) {
    return withoutProvider.slice("open_id:".length).trim() || null;
  }
  return withoutProvider;
}
function resolveReceiveIdType(id) {
  const trimmed = id.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered.startsWith("chat:") || lowered.startsWith("group:") || lowered.startsWith("channel:")) {
    return "chat_id";
  }
  if (lowered.startsWith("open_id:")) {
    return "open_id";
  }
  if (lowered.startsWith("user:") || lowered.startsWith("dm:")) {
    const normalized = trimmed.replace(/^(user|dm):/i, "").trim();
    return normalized.startsWith(OPEN_ID_PREFIX) ? "open_id" : "user_id";
  }
  if (trimmed.startsWith(CHAT_ID_PREFIX)) {
    return "chat_id";
  }
  if (trimmed.startsWith(OPEN_ID_PREFIX)) {
    return "open_id";
  }
  return "user_id";
}
function looksLikeFeishuId(raw) {
  const trimmed = stripProviderPrefix(raw.trim());
  if (!trimmed) {
    return false;
  }
  if (/^(chat|group|channel|user|dm|open_id):/i.test(trimmed)) {
    return true;
  }
  if (trimmed.startsWith(CHAT_ID_PREFIX)) {
    return true;
  }
  if (trimmed.startsWith(OPEN_ID_PREFIX)) {
    return true;
  }
  return false;
}
var CHAT_ID_PREFIX, OPEN_ID_PREFIX;
var init_targets = __esm({
  "src/core/extensions/feishu/src/targets.ts"() {
    "use strict";
    CHAT_ID_PREFIX = "oc_";
    OPEN_ID_PREFIX = "ou_";
  }
});

// src/core/extensions/feishu/src/async.ts
async function raceWithTimeoutAndAbort(promise, options = {}) {
  if (options.abortSignal?.aborted) {
    return { status: "aborted" };
  }
  if (options.timeoutMs === void 0 && !options.abortSignal) {
    return { status: "resolved", value: await promise };
  }
  let timeoutHandle;
  let abortHandler;
  const contenders = [promise];
  if (options.timeoutMs !== void 0) {
    contenders.push(
      new Promise((resolve) => {
        timeoutHandle = setTimeout(() => resolve(RACE_TIMEOUT), options.timeoutMs);
      })
    );
  }
  if (options.abortSignal) {
    contenders.push(
      new Promise((resolve) => {
        abortHandler = () => resolve(RACE_ABORT);
        options.abortSignal?.addEventListener("abort", abortHandler, { once: true });
      })
    );
  }
  try {
    const result = await Promise.race(contenders);
    if (result === RACE_TIMEOUT) {
      return { status: "timeout" };
    }
    if (result === RACE_ABORT) {
      return { status: "aborted" };
    }
    return { status: "resolved", value: result };
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    if (abortHandler) {
      options.abortSignal?.removeEventListener("abort", abortHandler);
    }
  }
}
var RACE_TIMEOUT, RACE_ABORT;
var init_async = __esm({
  "src/core/extensions/feishu/src/async.ts"() {
    "use strict";
    RACE_TIMEOUT = Symbol("race-timeout");
    RACE_ABORT = Symbol("race-abort");
  }
});

// src/core/extensions/feishu/src/probe.ts
function setCachedProbeResult(cacheKey, result, ttlMs) {
  probeCache.set(cacheKey, { result, expiresAt: Date.now() + ttlMs });
  if (probeCache.size > MAX_PROBE_CACHE_SIZE) {
    const oldest = probeCache.keys().next().value;
    if (oldest !== void 0) {
      probeCache.delete(oldest);
    }
  }
  return result;
}
async function probeFeishu(creds, options = {}) {
  if (!creds?.appId || !creds?.appSecret) {
    return {
      ok: false,
      error: "missing credentials (appId, appSecret)"
    };
  }
  if (options.abortSignal?.aborted) {
    return {
      ok: false,
      appId: creds.appId,
      error: "probe aborted"
    };
  }
  const timeoutMs = options.timeoutMs ?? FEISHU_PROBE_REQUEST_TIMEOUT_MS;
  const cacheKey = creds.accountId ?? `${creds.appId}:${creds.appSecret.slice(0, 8)}`;
  const cached = probeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }
  try {
    const client = createFeishuClient(creds);
    const responseResult = await raceWithTimeoutAndAbort(
      client.request({
        method: "GET",
        url: "/open-apis/bot/v3/info",
        data: {},
        timeout: timeoutMs
      }),
      {
        timeoutMs,
        abortSignal: options.abortSignal
      }
    );
    if (responseResult.status === "aborted") {
      return {
        ok: false,
        appId: creds.appId,
        error: "probe aborted"
      };
    }
    if (responseResult.status === "timeout") {
      return setCachedProbeResult(
        cacheKey,
        {
          ok: false,
          appId: creds.appId,
          error: `probe timed out after ${timeoutMs}ms`
        },
        PROBE_ERROR_TTL_MS
      );
    }
    const response = responseResult.value;
    if (options.abortSignal?.aborted) {
      return {
        ok: false,
        appId: creds.appId,
        error: "probe aborted"
      };
    }
    if (response.code !== 0) {
      return setCachedProbeResult(
        cacheKey,
        {
          ok: false,
          appId: creds.appId,
          error: `API error: ${response.msg || `code ${response.code}`}`
        },
        PROBE_ERROR_TTL_MS
      );
    }
    const bot = response.bot || response.data?.bot;
    return setCachedProbeResult(
      cacheKey,
      {
        ok: true,
        appId: creds.appId,
        botName: bot?.bot_name,
        botOpenId: bot?.open_id
      },
      PROBE_SUCCESS_TTL_MS
    );
  } catch (err) {
    return setCachedProbeResult(
      cacheKey,
      {
        ok: false,
        appId: creds.appId,
        error: err instanceof Error ? err.message : String(err)
      },
      PROBE_ERROR_TTL_MS
    );
  }
}
var probeCache, PROBE_SUCCESS_TTL_MS, PROBE_ERROR_TTL_MS, MAX_PROBE_CACHE_SIZE, FEISHU_PROBE_REQUEST_TIMEOUT_MS;
var init_probe = __esm({
  "src/core/extensions/feishu/src/probe.ts"() {
    "use strict";
    init_async();
    init_client();
    probeCache = /* @__PURE__ */ new Map();
    PROBE_SUCCESS_TTL_MS = 10 * 60 * 1e3;
    PROBE_ERROR_TTL_MS = 60 * 1e3;
    MAX_PROBE_CACHE_SIZE = 64;
    FEISHU_PROBE_REQUEST_TIMEOUT_MS = 1e4;
  }
});

// src/core/extensions/feishu/src/external-keys.ts
function normalizeFeishuExternalKey(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_EXTERNAL_KEY_LENGTH) {
    return void 0;
  }
  if (CONTROL_CHARS_RE.test(normalized)) {
    return void 0;
  }
  if (normalized.includes("/") || normalized.includes("\\") || normalized.includes("..")) {
    return void 0;
  }
  return normalized;
}
var CONTROL_CHARS_RE, MAX_EXTERNAL_KEY_LENGTH;
var init_external_keys = __esm({
  "src/core/extensions/feishu/src/external-keys.ts"() {
    "use strict";
    CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/;
    MAX_EXTERNAL_KEY_LENGTH = 512;
  }
});

// src/core/extensions/feishu/src/runtime.ts
var import_compat2, setFeishuRuntime, getFeishuRuntime;
var init_runtime = __esm({
  "src/core/extensions/feishu/src/runtime.ts"() {
    "use strict";
    import_compat2 = require("src/core/source/plugin-sdk/compat");
    ({ setRuntime: setFeishuRuntime, getRuntime: getFeishuRuntime } = (0, import_compat2.createPluginRuntimeStore)("Feishu runtime not initialized"));
  }
});

// src/core/extensions/feishu/src/send-result.ts
function assertFeishuMessageApiSuccess(response, errorPrefix) {
  if (response.code !== 0) {
    throw new Error(`${errorPrefix}: ${response.msg || `code ${response.code}`}`);
  }
}
function toFeishuSendResult(response, chatId) {
  return {
    messageId: response.data?.message_id ?? "unknown",
    chatId
  };
}
var init_send_result = __esm({
  "src/core/extensions/feishu/src/send-result.ts"() {
    "use strict";
  }
});

// src/core/extensions/feishu/src/send-target.ts
function resolveFeishuSendTarget(params) {
  const target = params.to.trim();
  const account = resolveFeishuAccount({ cfg: params.cfg, accountId: params.accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const receiveId = normalizeFeishuTarget(target);
  if (!receiveId) {
    throw new Error(`Invalid Feishu target: ${params.to}`);
  }
  const withoutProviderPrefix = target.replace(/^(feishu|lark):/i, "");
  return {
    client,
    receiveId,
    receiveIdType: resolveReceiveIdType(withoutProviderPrefix)
  };
}
var init_send_target = __esm({
  "src/core/extensions/feishu/src/send-target.ts"() {
    "use strict";
    init_accounts();
    init_client();
    init_targets();
  }
});

// src/core/extensions/feishu/src/media.ts
async function readFeishuResponseBuffer(params) {
  const { response } = params;
  const responseAny = response;
  if (responseAny.code !== void 0 && responseAny.code !== 0) {
    throw new Error(`${params.errorPrefix}: ${responseAny.msg || `code ${responseAny.code}`}`);
  }
  if (Buffer.isBuffer(response)) {
    return response;
  }
  if (response instanceof ArrayBuffer) {
    return Buffer.from(response);
  }
  if (responseAny.data && Buffer.isBuffer(responseAny.data)) {
    return responseAny.data;
  }
  if (responseAny.data instanceof ArrayBuffer) {
    return Buffer.from(responseAny.data);
  }
  if (typeof responseAny.getReadableStream === "function") {
    const stream = responseAny.getReadableStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  if (typeof responseAny.writeFile === "function") {
    return await (0, import_feishu3.withTempDownloadPath)({ prefix: params.tmpDirPrefix }, async (tmpPath) => {
      await responseAny.writeFile(tmpPath);
      return await import_fs.default.promises.readFile(tmpPath);
    });
  }
  if (typeof responseAny[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const chunk of responseAny) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  if (typeof responseAny.read === "function") {
    const chunks = [];
    for await (const chunk of responseAny) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  const keys = Object.keys(responseAny);
  const types = keys.map((k) => `${k}: ${typeof responseAny[k]}`).join(", ");
  throw new Error(`${params.errorPrefix}: unexpected response format. Keys: [${types}]`);
}
async function downloadMessageResourceFeishu(params) {
  const { cfg, messageId, fileKey, type, accountId } = params;
  const normalizedFileKey = normalizeFeishuExternalKey(fileKey);
  if (!normalizedFileKey) {
    throw new Error("Feishu message resource download failed: invalid file_key");
  }
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient({
    ...account,
    httpTimeoutMs: FEISHU_MEDIA_HTTP_TIMEOUT_MS
  });
  const response = await client.im.messageResource.get({
    path: { message_id: messageId, file_key: normalizedFileKey },
    params: { type }
  });
  const buffer = await readFeishuResponseBuffer({
    response,
    tmpDirPrefix: "must-b-feishu-resource-",
    errorPrefix: "Feishu message resource download failed"
  });
  return { buffer };
}
async function uploadImageFeishu(params) {
  const { cfg, image, imageType = "message", accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient({
    ...account,
    httpTimeoutMs: FEISHU_MEDIA_HTTP_TIMEOUT_MS
  });
  const imageData = typeof image === "string" ? import_fs.default.createReadStream(image) : image;
  const response = await client.im.image.create({
    data: {
      image_type: imageType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK accepts Buffer or ReadStream
      image: imageData
    }
  });
  const responseAny = response;
  if (responseAny.code !== void 0 && responseAny.code !== 0) {
    throw new Error(`Feishu image upload failed: ${responseAny.msg || `code ${responseAny.code}`}`);
  }
  const imageKey = responseAny.image_key ?? responseAny.data?.image_key;
  if (!imageKey) {
    throw new Error("Feishu image upload failed: no image_key returned");
  }
  return { imageKey };
}
function sanitizeFileNameForUpload(fileName) {
  const ASCII_ONLY = /^[\x20-\x7E]+$/;
  if (ASCII_ONLY.test(fileName)) {
    return fileName;
  }
  return encodeURIComponent(fileName).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
}
async function uploadFileFeishu(params) {
  const { cfg, file, fileName, fileType, duration, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient({
    ...account,
    httpTimeoutMs: FEISHU_MEDIA_HTTP_TIMEOUT_MS
  });
  const fileData = typeof file === "string" ? import_fs.default.createReadStream(file) : file;
  const safeFileName = sanitizeFileNameForUpload(fileName);
  const response = await client.im.file.create({
    data: {
      file_type: fileType,
      file_name: safeFileName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK accepts Buffer or ReadStream
      file: fileData,
      ...duration !== void 0 && { duration }
    }
  });
  const responseAny = response;
  if (responseAny.code !== void 0 && responseAny.code !== 0) {
    throw new Error(`Feishu file upload failed: ${responseAny.msg || `code ${responseAny.code}`}`);
  }
  const fileKey = responseAny.file_key ?? responseAny.data?.file_key;
  if (!fileKey) {
    throw new Error("Feishu file upload failed: no file_key returned");
  }
  return { fileKey };
}
async function sendImageFeishu(params) {
  const { cfg, to, imageKey, replyToMessageId, replyInThread, accountId } = params;
  const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
    cfg,
    to,
    accountId
  });
  const content = JSON.stringify({ image_key: imageKey });
  if (replyToMessageId) {
    const response2 = await client.im.message.reply({
      path: { message_id: replyToMessageId },
      data: {
        content,
        msg_type: "image",
        ...replyInThread ? { reply_in_thread: true } : {}
      }
    });
    assertFeishuMessageApiSuccess(response2, "Feishu image reply failed");
    return toFeishuSendResult(response2, receiveId);
  }
  const response = await client.im.message.create({
    params: { receive_id_type: receiveIdType },
    data: {
      receive_id: receiveId,
      content,
      msg_type: "image"
    }
  });
  assertFeishuMessageApiSuccess(response, "Feishu image send failed");
  return toFeishuSendResult(response, receiveId);
}
async function sendFileFeishu(params) {
  const { cfg, to, fileKey, replyToMessageId, replyInThread, accountId } = params;
  const msgType = params.msgType ?? "file";
  const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
    cfg,
    to,
    accountId
  });
  const content = JSON.stringify({ file_key: fileKey });
  if (replyToMessageId) {
    const response2 = await client.im.message.reply({
      path: { message_id: replyToMessageId },
      data: {
        content,
        msg_type: msgType,
        ...replyInThread ? { reply_in_thread: true } : {}
      }
    });
    assertFeishuMessageApiSuccess(response2, "Feishu file reply failed");
    return toFeishuSendResult(response2, receiveId);
  }
  const response = await client.im.message.create({
    params: { receive_id_type: receiveIdType },
    data: {
      receive_id: receiveId,
      content,
      msg_type: msgType
    }
  });
  assertFeishuMessageApiSuccess(response, "Feishu file send failed");
  return toFeishuSendResult(response, receiveId);
}
function detectFileType(fileName) {
  const ext = import_path.default.extname(fileName).toLowerCase();
  switch (ext) {
    case ".opus":
    case ".ogg":
      return "opus";
    case ".mp4":
    case ".mov":
    case ".avi":
      return "mp4";
    case ".pdf":
      return "pdf";
    case ".doc":
    case ".docx":
      return "doc";
    case ".xls":
    case ".xlsx":
      return "xls";
    case ".ppt":
    case ".pptx":
      return "ppt";
    default:
      return "stream";
  }
}
async function sendMediaFeishu(params) {
  const {
    cfg,
    to,
    mediaUrl,
    mediaBuffer,
    fileName,
    replyToMessageId,
    replyInThread,
    accountId,
    mediaLocalRoots
  } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const mediaMaxBytes = (account.config?.mediaMaxMb ?? 30) * 1024 * 1024;
  let buffer;
  let name;
  if (mediaBuffer) {
    buffer = mediaBuffer;
    name = fileName ?? "file";
  } else if (mediaUrl) {
    const loaded = await getFeishuRuntime().media.loadWebMedia(mediaUrl, {
      maxBytes: mediaMaxBytes,
      optimizeImages: false,
      localRoots: mediaLocalRoots?.length ? mediaLocalRoots : void 0
    });
    buffer = loaded.buffer;
    name = fileName ?? loaded.fileName ?? "file";
  } else {
    throw new Error("Either mediaUrl or mediaBuffer must be provided");
  }
  const ext = import_path.default.extname(name).toLowerCase();
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".ico", ".tiff"].includes(ext);
  if (isImage) {
    const { imageKey } = await uploadImageFeishu({ cfg, image: buffer, accountId });
    return sendImageFeishu({ cfg, to, imageKey, replyToMessageId, replyInThread, accountId });
  } else {
    const fileType = detectFileType(name);
    const { fileKey } = await uploadFileFeishu({
      cfg,
      file: buffer,
      fileName: name,
      fileType,
      accountId
    });
    const msgType = fileType === "opus" ? "audio" : fileType === "mp4" ? "media" : "file";
    return sendFileFeishu({
      cfg,
      to,
      fileKey,
      msgType,
      replyToMessageId,
      replyInThread,
      accountId
    });
  }
}
var import_fs, import_path, import_feishu3, FEISHU_MEDIA_HTTP_TIMEOUT_MS;
var init_media = __esm({
  "src/core/extensions/feishu/src/media.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"), 1);
    import_path = __toESM(require("path"), 1);
    import_feishu3 = require("src/core/source/plugin-sdk/feishu");
    init_accounts();
    init_client();
    init_external_keys();
    init_runtime();
    init_send_result();
    init_send_target();
    FEISHU_MEDIA_HTTP_TIMEOUT_MS = 12e4;
  }
});

// src/core/extensions/feishu/src/mention.ts
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function extractMentionTargets(event, botOpenId) {
  const mentions = event.message.mentions ?? [];
  return mentions.filter((m) => {
    if (botOpenId && m.id.open_id === botOpenId) {
      return false;
    }
    return !!m.id.open_id;
  }).map((m) => ({
    openId: m.id.open_id,
    name: m.name,
    key: m.key
  }));
}
function isMentionForwardRequest(event, botOpenId) {
  const mentions = event.message.mentions ?? [];
  if (mentions.length === 0) {
    return false;
  }
  const isDirectMessage = event.message.chat_type !== "group";
  const hasOtherMention = mentions.some((m) => m.id.open_id !== botOpenId);
  if (isDirectMessage) {
    return hasOtherMention;
  } else {
    const hasBotMention = mentions.some((m) => m.id.open_id === botOpenId);
    return hasBotMention && hasOtherMention;
  }
}
function extractMessageBody(text, allMentionKeys) {
  let result = text;
  for (const key of allMentionKeys) {
    result = result.replace(new RegExp(escapeRegExp(key), "g"), "");
  }
  return result.replace(/\s+/g, " ").trim();
}
function formatMentionForText(target) {
  return `<at user_id="${target.openId}">${target.name}</at>`;
}
function formatMentionAllForText() {
  return `<at user_id="all">Everyone</at>`;
}
function formatMentionForCard(target) {
  return `<at id=${target.openId}></at>`;
}
function formatMentionAllForCard() {
  return `<at id=all></at>`;
}
function buildMentionedMessage(targets, message) {
  if (targets.length === 0) {
    return message;
  }
  const mentionParts = targets.map((t) => formatMentionForText(t));
  return `${mentionParts.join(" ")} ${message}`;
}
function buildMentionedCardContent(targets, message) {
  if (targets.length === 0) {
    return message;
  }
  const mentionParts = targets.map((t) => formatMentionForCard(t));
  return `${mentionParts.join(" ")} ${message}`;
}
var init_mention = __esm({
  "src/core/extensions/feishu/src/mention.ts"() {
    "use strict";
  }
});

// src/core/extensions/feishu/src/post.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function toStringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}
function escapeMarkdownText(text) {
  return text.replace(MARKDOWN_SPECIAL_CHARS, "\\$1");
}
function toBoolean(value) {
  return value === true || value === 1 || value === "true";
}
function isStyleEnabled(style, key) {
  if (!style) {
    return false;
  }
  return toBoolean(style[key]);
}
function wrapInlineCode(text) {
  const maxRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(maxRun + 1);
  const needsPadding = text.startsWith("`") || text.endsWith("`");
  const body = needsPadding ? ` ${text} ` : text;
  return `${fence}${body}${fence}`;
}
function sanitizeFenceLanguage(language) {
  return language.trim().replace(/[^A-Za-z0-9_+#.-]/g, "");
}
function renderTextElement(element) {
  const text = toStringOrEmpty(element.text);
  const style = isRecord(element.style) ? element.style : void 0;
  if (isStyleEnabled(style, "code")) {
    return wrapInlineCode(text);
  }
  let rendered = escapeMarkdownText(text);
  if (!rendered) {
    return "";
  }
  if (isStyleEnabled(style, "bold")) {
    rendered = `**${rendered}**`;
  }
  if (isStyleEnabled(style, "italic")) {
    rendered = `*${rendered}*`;
  }
  if (isStyleEnabled(style, "underline")) {
    rendered = `<u>${rendered}</u>`;
  }
  if (isStyleEnabled(style, "strikethrough") || isStyleEnabled(style, "line_through") || isStyleEnabled(style, "lineThrough")) {
    rendered = `~~${rendered}~~`;
  }
  return rendered;
}
function renderLinkElement(element) {
  const href = toStringOrEmpty(element.href).trim();
  const rawText = toStringOrEmpty(element.text);
  const text = rawText || href;
  if (!text) {
    return "";
  }
  if (!href) {
    return escapeMarkdownText(text);
  }
  return `[${escapeMarkdownText(text)}](${href})`;
}
function renderMentionElement(element) {
  const mention = toStringOrEmpty(element.user_name) || toStringOrEmpty(element.user_id) || toStringOrEmpty(element.open_id);
  if (!mention) {
    return "";
  }
  return `@${escapeMarkdownText(mention)}`;
}
function renderEmotionElement(element) {
  const text = toStringOrEmpty(element.emoji) || toStringOrEmpty(element.text) || toStringOrEmpty(element.emoji_type);
  return escapeMarkdownText(text);
}
function renderCodeBlockElement(element) {
  const language = sanitizeFenceLanguage(
    toStringOrEmpty(element.language) || toStringOrEmpty(element.lang)
  );
  const code = (toStringOrEmpty(element.text) || toStringOrEmpty(element.content)).replace(
    /\r\n/g,
    "\n"
  );
  const trailingNewline = code.endsWith("\n") ? "" : "\n";
  return `\`\`\`${language}
${code}${trailingNewline}\`\`\``;
}
function renderElement(element, imageKeys, mediaKeys, mentionedOpenIds) {
  if (!isRecord(element)) {
    return escapeMarkdownText(toStringOrEmpty(element));
  }
  const tag = toStringOrEmpty(element.tag).toLowerCase();
  switch (tag) {
    case "text":
      return renderTextElement(element);
    case "a":
      return renderLinkElement(element);
    case "at":
      {
        const mentioned = toStringOrEmpty(element.open_id) || toStringOrEmpty(element.user_id);
        const normalizedMention = normalizeFeishuExternalKey(mentioned);
        if (normalizedMention) {
          mentionedOpenIds.push(normalizedMention);
        }
      }
      return renderMentionElement(element);
    case "img": {
      const imageKey = normalizeFeishuExternalKey(toStringOrEmpty(element.image_key));
      if (imageKey) {
        imageKeys.push(imageKey);
      }
      return "![image]";
    }
    case "media": {
      const fileKey = normalizeFeishuExternalKey(toStringOrEmpty(element.file_key));
      if (fileKey) {
        const fileName = toStringOrEmpty(element.file_name) || void 0;
        mediaKeys.push({ fileKey, fileName });
      }
      return "[media]";
    }
    case "emotion":
      return renderEmotionElement(element);
    case "br":
      return "\n";
    case "hr":
      return "\n\n---\n\n";
    case "code": {
      const code = toStringOrEmpty(element.text) || toStringOrEmpty(element.content);
      return code ? wrapInlineCode(code) : "";
    }
    case "code_block":
    case "pre":
      return renderCodeBlockElement(element);
    default:
      return escapeMarkdownText(toStringOrEmpty(element.text));
  }
}
function toPostPayload(candidate) {
  if (!isRecord(candidate) || !Array.isArray(candidate.content)) {
    return null;
  }
  return {
    title: toStringOrEmpty(candidate.title),
    content: candidate.content
  };
}
function resolveLocalePayload(candidate) {
  const direct = toPostPayload(candidate);
  if (direct) {
    return direct;
  }
  if (!isRecord(candidate)) {
    return null;
  }
  for (const value of Object.values(candidate)) {
    const localePayload = toPostPayload(value);
    if (localePayload) {
      return localePayload;
    }
  }
  return null;
}
function resolvePostPayload(parsed) {
  const direct = toPostPayload(parsed);
  if (direct) {
    return direct;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  const wrappedPost = resolveLocalePayload(parsed.post);
  if (wrappedPost) {
    return wrappedPost;
  }
  return resolveLocalePayload(parsed);
}
function parsePostContent(content) {
  try {
    const parsed = JSON.parse(content);
    const payload = resolvePostPayload(parsed);
    if (!payload) {
      return {
        textContent: FALLBACK_POST_TEXT,
        imageKeys: [],
        mediaKeys: [],
        mentionedOpenIds: []
      };
    }
    const imageKeys = [];
    const mediaKeys = [];
    const mentionedOpenIds = [];
    const paragraphs = [];
    for (const paragraph of payload.content) {
      if (!Array.isArray(paragraph)) {
        continue;
      }
      let renderedParagraph = "";
      for (const element of paragraph) {
        renderedParagraph += renderElement(element, imageKeys, mediaKeys, mentionedOpenIds);
      }
      paragraphs.push(renderedParagraph);
    }
    const title = escapeMarkdownText(payload.title.trim());
    const body = paragraphs.join("\n").trim();
    const textContent = [title, body].filter(Boolean).join("\n\n").trim();
    return {
      textContent: textContent || FALLBACK_POST_TEXT,
      imageKeys,
      mediaKeys,
      mentionedOpenIds
    };
  } catch {
    return { textContent: FALLBACK_POST_TEXT, imageKeys: [], mediaKeys: [], mentionedOpenIds: [] };
  }
}
var FALLBACK_POST_TEXT, MARKDOWN_SPECIAL_CHARS;
var init_post = __esm({
  "src/core/extensions/feishu/src/post.ts"() {
    "use strict";
    init_external_keys();
    FALLBACK_POST_TEXT = "[Rich text message]";
    MARKDOWN_SPECIAL_CHARS = /([\\`*_{}\[\]()#+\-!|>~])/g;
  }
});

// src/core/extensions/feishu/src/send.ts
function shouldFallbackFromReplyTarget(response) {
  if (response.code !== void 0 && WITHDRAWN_REPLY_ERROR_CODES.has(response.code)) {
    return true;
  }
  const msg = response.msg?.toLowerCase() ?? "";
  return msg.includes("withdrawn") || msg.includes("not found");
}
function isWithdrawnReplyError(err) {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const code = err.code;
  if (typeof code === "number" && WITHDRAWN_REPLY_ERROR_CODES.has(code)) {
    return true;
  }
  const response = err.response;
  if (typeof response?.data?.code === "number" && WITHDRAWN_REPLY_ERROR_CODES.has(response.data.code)) {
    return true;
  }
  return false;
}
async function sendFallbackDirect(client, params, errorPrefix) {
  const response = await client.im.message.create({
    params: { receive_id_type: params.receiveIdType },
    data: {
      receive_id: params.receiveId,
      content: params.content,
      msg_type: params.msgType
    }
  });
  assertFeishuMessageApiSuccess(response, errorPrefix);
  return toFeishuSendResult(response, params.receiveId);
}
function parseInteractiveCardContent(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return "[Interactive Card]";
  }
  const candidate = parsed;
  if (!Array.isArray(candidate.elements)) {
    return "[Interactive Card]";
  }
  const texts = [];
  for (const element of candidate.elements) {
    if (!element || typeof element !== "object") {
      continue;
    }
    const item = element;
    if (item.tag === "div" && typeof item.text?.content === "string") {
      texts.push(item.text.content);
      continue;
    }
    if (item.tag === "markdown" && typeof item.content === "string") {
      texts.push(item.content);
    }
  }
  return texts.join("\n").trim() || "[Interactive Card]";
}
function parseQuotedMessageContent(rawContent, msgType) {
  if (!rawContent) {
    return "";
  }
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return rawContent;
  }
  if (msgType === "text") {
    const text = parsed?.text;
    return typeof text === "string" ? text : "[Text message]";
  }
  if (msgType === "post") {
    return parsePostContent(rawContent).textContent;
  }
  if (msgType === "interactive") {
    return parseInteractiveCardContent(parsed);
  }
  if (typeof parsed === "string") {
    return parsed;
  }
  const genericText = parsed?.text;
  if (typeof genericText === "string" && genericText.trim()) {
    return genericText;
  }
  const genericTitle = parsed?.title;
  if (typeof genericTitle === "string" && genericTitle.trim()) {
    return genericTitle;
  }
  return `[${msgType || "unknown"} message]`;
}
async function getMessageFeishu(params) {
  const { cfg, messageId, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  try {
    const response = await client.im.message.get({
      path: { message_id: messageId }
    });
    if (response.code !== 0) {
      return null;
    }
    const rawItem = response.data?.items?.[0] ?? response.data;
    const item = rawItem && (rawItem.body !== void 0 || rawItem.message_id !== void 0) ? rawItem : null;
    if (!item) {
      return null;
    }
    const msgType = item.msg_type ?? "text";
    const rawContent = item.body?.content ?? "";
    const content = parseQuotedMessageContent(rawContent, msgType);
    return {
      messageId: item.message_id ?? messageId,
      chatId: item.chat_id ?? "",
      chatType: item.chat_type === "group" || item.chat_type === "private" || item.chat_type === "p2p" ? item.chat_type : void 0,
      senderId: item.sender?.id,
      senderOpenId: item.sender?.id_type === "open_id" ? item.sender?.id : void 0,
      senderType: item.sender?.sender_type,
      content,
      contentType: msgType,
      createTime: item.create_time ? parseInt(String(item.create_time), 10) : void 0
    };
  } catch {
    return null;
  }
}
function buildFeishuPostMessagePayload(params) {
  const { messageText } = params;
  return {
    content: JSON.stringify({
      zh_cn: {
        content: [
          [
            {
              tag: "md",
              text: messageText
            }
          ]
        ]
      }
    }),
    msgType: "post"
  };
}
async function sendMessageFeishu(params) {
  const { cfg, to, text, replyToMessageId, replyInThread, mentions, accountId } = params;
  const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({ cfg, to, accountId });
  const tableMode = getFeishuRuntime().channel.text.resolveMarkdownTableMode({
    cfg,
    channel: "feishu"
  });
  let rawText = text ?? "";
  if (mentions && mentions.length > 0) {
    rawText = buildMentionedMessage(mentions, rawText);
  }
  const messageText = getFeishuRuntime().channel.text.convertMarkdownTables(rawText, tableMode);
  const { content, msgType } = buildFeishuPostMessagePayload({ messageText });
  const directParams = { receiveId, receiveIdType, content, msgType };
  if (replyToMessageId) {
    let response;
    try {
      response = await client.im.message.reply({
        path: { message_id: replyToMessageId },
        data: {
          content,
          msg_type: msgType,
          ...replyInThread ? { reply_in_thread: true } : {}
        }
      });
    } catch (err) {
      if (!isWithdrawnReplyError(err)) {
        throw err;
      }
      return sendFallbackDirect(client, directParams, "Feishu send failed");
    }
    if (shouldFallbackFromReplyTarget(response)) {
      return sendFallbackDirect(client, directParams, "Feishu send failed");
    }
    assertFeishuMessageApiSuccess(response, "Feishu reply failed");
    return toFeishuSendResult(response, receiveId);
  }
  return sendFallbackDirect(client, directParams, "Feishu send failed");
}
async function sendCardFeishu(params) {
  const { cfg, to, card, replyToMessageId, replyInThread, accountId } = params;
  const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({ cfg, to, accountId });
  const content = JSON.stringify(card);
  const directParams = { receiveId, receiveIdType, content, msgType: "interactive" };
  if (replyToMessageId) {
    let response;
    try {
      response = await client.im.message.reply({
        path: { message_id: replyToMessageId },
        data: {
          content,
          msg_type: "interactive",
          ...replyInThread ? { reply_in_thread: true } : {}
        }
      });
    } catch (err) {
      if (!isWithdrawnReplyError(err)) {
        throw err;
      }
      return sendFallbackDirect(client, directParams, "Feishu card send failed");
    }
    if (shouldFallbackFromReplyTarget(response)) {
      return sendFallbackDirect(client, directParams, "Feishu card send failed");
    }
    assertFeishuMessageApiSuccess(response, "Feishu card reply failed");
    return toFeishuSendResult(response, receiveId);
  }
  return sendFallbackDirect(client, directParams, "Feishu card send failed");
}
async function updateCardFeishu(params) {
  const { cfg, messageId, card, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const content = JSON.stringify(card);
  const response = await client.im.message.patch({
    path: { message_id: messageId },
    data: { content }
  });
  if (response.code !== 0) {
    throw new Error(`Feishu card update failed: ${response.msg || `code ${response.code}`}`);
  }
}
function buildMarkdownCard(text) {
  return {
    schema: "2.0",
    config: {
      wide_screen_mode: true
    },
    body: {
      elements: [
        {
          tag: "markdown",
          content: text
        }
      ]
    }
  };
}
async function sendMarkdownCardFeishu(params) {
  const { cfg, to, text, replyToMessageId, replyInThread, mentions, accountId } = params;
  let cardText = text;
  if (mentions && mentions.length > 0) {
    cardText = buildMentionedCardContent(mentions, text);
  }
  const card = buildMarkdownCard(cardText);
  return sendCardFeishu({ cfg, to, card, replyToMessageId, replyInThread, accountId });
}
async function editMessageFeishu(params) {
  const { cfg, messageId, text, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const tableMode = getFeishuRuntime().channel.text.resolveMarkdownTableMode({
    cfg,
    channel: "feishu"
  });
  const messageText = getFeishuRuntime().channel.text.convertMarkdownTables(text ?? "", tableMode);
  const { content, msgType } = buildFeishuPostMessagePayload({ messageText });
  const response = await client.im.message.update({
    path: { message_id: messageId },
    data: {
      msg_type: msgType,
      content
    }
  });
  if (response.code !== 0) {
    throw new Error(`Feishu message edit failed: ${response.msg || `code ${response.code}`}`);
  }
}
var WITHDRAWN_REPLY_ERROR_CODES;
var init_send = __esm({
  "src/core/extensions/feishu/src/send.ts"() {
    "use strict";
    init_accounts();
    init_client();
    init_mention();
    init_post();
    init_runtime();
    init_send_result();
    init_send_target();
    WITHDRAWN_REPLY_ERROR_CODES = /* @__PURE__ */ new Set([230011, 231003]);
  }
});

// src/core/extensions/feishu/src/policy.ts
function normalizeFeishuAllowEntry(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed === "*") {
    return "*";
  }
  const withoutProviderPrefix = trimmed.replace(/^feishu:/i, "");
  const normalized = normalizeFeishuTarget(withoutProviderPrefix) ?? withoutProviderPrefix;
  return normalized.trim().toLowerCase();
}
function resolveFeishuAllowlistMatch(params) {
  const allowFrom = params.allowFrom.map((entry) => normalizeFeishuAllowEntry(String(entry))).filter(Boolean);
  if (allowFrom.length === 0) {
    return { allowed: false };
  }
  if (allowFrom.includes("*")) {
    return { allowed: true, matchKey: "*", matchSource: "wildcard" };
  }
  const senderCandidates = [params.senderId, ...params.senderIds ?? []].map((entry) => normalizeFeishuAllowEntry(String(entry ?? ""))).filter(Boolean);
  for (const senderId of senderCandidates) {
    if (allowFrom.includes(senderId)) {
      return { allowed: true, matchKey: senderId, matchSource: "id" };
    }
  }
  return { allowed: false };
}
function resolveFeishuGroupConfig(params) {
  const groups = params.cfg?.groups ?? {};
  const wildcard = groups["*"];
  const groupId = params.groupId?.trim();
  if (!groupId) {
    return void 0;
  }
  const direct = groups[groupId];
  if (direct) {
    return direct;
  }
  const lowered = groupId.toLowerCase();
  const matchKey = Object.keys(groups).find((key) => key.toLowerCase() === lowered);
  if (matchKey) {
    return groups[matchKey];
  }
  return wildcard;
}
function resolveFeishuGroupToolPolicy(params) {
  const cfg = params.cfg.channels?.feishu;
  if (!cfg) {
    return void 0;
  }
  const groupConfig = resolveFeishuGroupConfig({
    cfg,
    groupId: params.groupId
  });
  return groupConfig?.tools;
}
function isFeishuGroupAllowed(params) {
  return (0, import_feishu4.evaluateSenderGroupAccessForPolicy)({
    groupPolicy: params.groupPolicy === "allowall" ? "open" : params.groupPolicy,
    groupAllowFrom: params.allowFrom.map((entry) => String(entry)),
    senderId: params.senderId,
    isSenderAllowed: () => resolveFeishuAllowlistMatch(params).allowed
  }).allowed;
}
function resolveFeishuReplyPolicy(params) {
  if (params.isDirectMessage) {
    return { requireMention: false };
  }
  const requireMention = params.groupConfig?.requireMention ?? params.globalConfig?.requireMention ?? true;
  return { requireMention };
}
var import_feishu4;
var init_policy = __esm({
  "src/core/extensions/feishu/src/policy.ts"() {
    "use strict";
    import_feishu4 = require("src/core/source/plugin-sdk/feishu");
    init_targets();
  }
});

// src/core/extensions/feishu/src/dedup.ts
function resolveStateDirFromEnv(env = process.env) {
  const stateOverride = env.MUSTB_STATE_DIR?.trim() || env.CLAWDBOT_STATE_DIR?.trim();
  if (stateOverride) {
    return stateOverride;
  }
  if (env.VITEST || env.NODE_ENV === "test") {
    return import_node_path.default.join(import_node_os.default.tmpdir(), ["must-b-vitest", String(process.pid)].join("-"));
  }
  return import_node_path.default.join(import_node_os.default.homedir(), ".must-b");
}
function resolveNamespaceFilePath(namespace) {
  const safe = namespace.replace(/[^a-zA-Z0-9_-]/g, "_");
  return import_node_path.default.join(resolveStateDirFromEnv(), "feishu", "dedup", `${safe}.json`);
}
function tryRecordMessage(messageId) {
  return !memoryDedupe.check(messageId);
}
function hasRecordedMessage(messageId) {
  const trimmed = messageId.trim();
  if (!trimmed) {
    return false;
  }
  return memoryDedupe.peek(trimmed);
}
async function tryRecordMessagePersistent(messageId, namespace = "global", log) {
  return persistentDedupe.checkAndRecord(messageId, {
    namespace,
    onDiskError: (error) => {
      log?.(`feishu-dedup: disk error, falling back to memory: ${String(error)}`);
    }
  });
}
async function hasRecordedMessagePersistent(messageId, namespace = "global", log) {
  const trimmed = messageId.trim();
  if (!trimmed) {
    return false;
  }
  const now = Date.now();
  const filePath = resolveNamespaceFilePath(namespace);
  try {
    const { value } = await (0, import_feishu5.readJsonFileWithFallback)(filePath, {});
    const seenAt = value[trimmed];
    if (typeof seenAt !== "number" || !Number.isFinite(seenAt)) {
      return false;
    }
    return DEDUP_TTL_MS <= 0 || now - seenAt < DEDUP_TTL_MS;
  } catch (error) {
    log?.(`feishu-dedup: persistent peek failed: ${String(error)}`);
    return false;
  }
}
async function warmupDedupFromDisk(namespace, log) {
  return persistentDedupe.warmup(namespace, (error) => {
    log?.(`feishu-dedup: warmup disk error: ${String(error)}`);
  });
}
var import_node_os, import_node_path, import_feishu5, DEDUP_TTL_MS, MEMORY_MAX_SIZE, FILE_MAX_ENTRIES, memoryDedupe, persistentDedupe;
var init_dedup = __esm({
  "src/core/extensions/feishu/src/dedup.ts"() {
    "use strict";
    import_node_os = __toESM(require("node:os"), 1);
    import_node_path = __toESM(require("node:path"), 1);
    import_feishu5 = require("src/core/source/plugin-sdk/feishu");
    DEDUP_TTL_MS = 24 * 60 * 60 * 1e3;
    MEMORY_MAX_SIZE = 1e3;
    FILE_MAX_ENTRIES = 1e4;
    memoryDedupe = (0, import_feishu5.createDedupeCache)({ ttlMs: DEDUP_TTL_MS, maxSize: MEMORY_MAX_SIZE });
    persistentDedupe = (0, import_feishu5.createPersistentDedupe)({
      ttlMs: DEDUP_TTL_MS,
      memoryMaxSize: MEMORY_MAX_SIZE,
      fileMaxEntries: FILE_MAX_ENTRIES,
      resolveFilePath: resolveNamespaceFilePath
    });
  }
});

// src/core/extensions/feishu/src/dynamic-agent.ts
async function maybeCreateDynamicAgent(params) {
  const { cfg, runtime, senderOpenId, dynamicCfg, log } = params;
  const existingBindings = cfg.bindings ?? [];
  const hasBinding = existingBindings.some(
    (b) => b.match?.channel === "feishu" && b.match?.peer?.kind === "direct" && b.match?.peer?.id === senderOpenId
  );
  if (hasBinding) {
    return { created: false, updatedCfg: cfg };
  }
  if (dynamicCfg.maxAgents !== void 0) {
    const feishuAgentCount = (cfg.agents?.list ?? []).filter(
      (a) => a.id.startsWith("feishu-")
    ).length;
    if (feishuAgentCount >= dynamicCfg.maxAgents) {
      log(
        `feishu: maxAgents limit (${dynamicCfg.maxAgents}) reached, not creating agent for ${senderOpenId}`
      );
      return { created: false, updatedCfg: cfg };
    }
  }
  const agentId = `feishu-${senderOpenId}`;
  const existingAgent = (cfg.agents?.list ?? []).find((a) => a.id === agentId);
  if (existingAgent) {
    log(`feishu: agent "${agentId}" exists, adding missing binding for ${senderOpenId}`);
    const updatedCfg2 = {
      ...cfg,
      bindings: [
        ...existingBindings,
        {
          agentId,
          match: {
            channel: "feishu",
            peer: { kind: "direct", id: senderOpenId }
          }
        }
      ]
    };
    await runtime.config.writeConfigFile(updatedCfg2);
    return { created: true, updatedCfg: updatedCfg2, agentId };
  }
  const workspaceTemplate = dynamicCfg.workspaceTemplate ?? "~/.must-b/workspace-{agentId}";
  const agentDirTemplate = dynamicCfg.agentDirTemplate ?? "~/.must-b/agents/{agentId}/agent";
  const workspace = resolveUserPath(
    workspaceTemplate.replace("{userId}", senderOpenId).replace("{agentId}", agentId)
  );
  const agentDir = resolveUserPath(
    agentDirTemplate.replace("{userId}", senderOpenId).replace("{agentId}", agentId)
  );
  log(`feishu: creating dynamic agent "${agentId}" for user ${senderOpenId}`);
  log(`  workspace: ${workspace}`);
  log(`  agentDir: ${agentDir}`);
  await import_node_fs.default.promises.mkdir(workspace, { recursive: true });
  await import_node_fs.default.promises.mkdir(agentDir, { recursive: true });
  const updatedCfg = {
    ...cfg,
    agents: {
      ...cfg.agents,
      list: [...cfg.agents?.list ?? [], { id: agentId, workspace, agentDir }]
    },
    bindings: [
      ...existingBindings,
      {
        agentId,
        match: {
          channel: "feishu",
          peer: { kind: "direct", id: senderOpenId }
        }
      }
    ]
  };
  await runtime.config.writeConfigFile(updatedCfg);
  return { created: true, updatedCfg, agentId };
}
function resolveUserPath(p) {
  if (p.startsWith("~/")) {
    return import_node_path2.default.join(import_node_os2.default.homedir(), p.slice(2));
  }
  return p;
}
var import_node_fs, import_node_os2, import_node_path2;
var init_dynamic_agent = __esm({
  "src/core/extensions/feishu/src/dynamic-agent.ts"() {
    "use strict";
    import_node_fs = __toESM(require("node:fs"), 1);
    import_node_os2 = __toESM(require("node:os"), 1);
    import_node_path2 = __toESM(require("node:path"), 1);
  }
});

// src/core/extensions/feishu/src/streaming-card.ts
function resolveApiBase(domain) {
  if (domain === "lark") {
    return "https://open.larksuite.com/open-apis";
  }
  if (domain && domain !== "feishu" && domain.startsWith("http")) {
    return `${domain.replace(/\/+$/, "")}/open-apis`;
  }
  return "https://open.feishu.cn/open-apis";
}
function resolveAllowedHostnames(domain) {
  if (domain === "lark") {
    return ["open.larksuite.com"];
  }
  if (domain && domain !== "feishu" && domain.startsWith("http")) {
    try {
      return [new URL(domain).hostname];
    } catch {
      return [];
    }
  }
  return ["open.feishu.cn"];
}
async function getToken(creds) {
  const key = `${creds.domain ?? "feishu"}|${creds.appId}`;
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > Date.now() + 6e4) {
    return cached.token;
  }
  const { response, release } = await (0, import_feishu6.fetchWithSsrFGuard)({
    url: `${resolveApiBase(creds.domain)}/auth/v3/tenant_access_token/internal`,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: creds.appId, app_secret: creds.appSecret })
    },
    policy: { allowedHostnames: resolveAllowedHostnames(creds.domain) },
    auditContext: "feishu.streaming-card.token"
  });
  if (!response.ok) {
    await release();
    throw new Error(`Token request failed with HTTP ${response.status}`);
  }
  const data = await response.json();
  await release();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Token error: ${data.msg}`);
  }
  tokenCache.set(key, {
    token: data.tenant_access_token,
    expiresAt: Date.now() + (data.expire ?? 7200) * 1e3
  });
  return data.tenant_access_token;
}
function truncateSummary(text, max = 50) {
  if (!text) {
    return "";
  }
  const clean = text.replace(/\n/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 3) + "...";
}
function mergeStreamingText(previousText, nextText) {
  const previous = typeof previousText === "string" ? previousText : "";
  const next = typeof nextText === "string" ? nextText : "";
  if (!next) {
    return previous;
  }
  if (!previous || next === previous) {
    return next;
  }
  if (next.startsWith(previous)) {
    return next;
  }
  if (previous.startsWith(next)) {
    return previous;
  }
  if (next.includes(previous)) {
    return next;
  }
  if (previous.includes(next)) {
    return previous;
  }
  const maxOverlap = Math.min(previous.length, next.length);
  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    if (previous.slice(-overlap) === next.slice(0, overlap)) {
      return `${previous}${next.slice(overlap)}`;
    }
  }
  return `${previous}${next}`;
}
function resolveStreamingCardSendMode(options) {
  if (options?.replyToMessageId) {
    return "reply";
  }
  if (options?.rootId) {
    return "root_create";
  }
  return "create";
}
var import_feishu6, tokenCache, FeishuStreamingSession;
var init_streaming_card = __esm({
  "src/core/extensions/feishu/src/streaming-card.ts"() {
    "use strict";
    import_feishu6 = require("src/core/source/plugin-sdk/feishu");
    tokenCache = /* @__PURE__ */ new Map();
    FeishuStreamingSession = class {
      // Throttle updates to max 10/sec
      constructor(client, creds, log) {
        this.state = null;
        this.queue = Promise.resolve();
        this.closed = false;
        this.lastUpdateTime = 0;
        this.pendingText = null;
        this.updateThrottleMs = 100;
        this.client = client;
        this.creds = creds;
        this.log = log;
      }
      async start(receiveId, receiveIdType = "chat_id", options) {
        if (this.state) {
          return;
        }
        const apiBase = resolveApiBase(this.creds.domain);
        const cardJson = {
          schema: "2.0",
          config: {
            streaming_mode: true,
            summary: { content: "[Generating...]" },
            streaming_config: { print_frequency_ms: { default: 50 }, print_step: { default: 1 } }
          },
          body: {
            elements: [{ tag: "markdown", content: "\u23F3 Thinking...", element_id: "content" }]
          }
        };
        if (options?.header) {
          cardJson.header = {
            title: { tag: "plain_text", content: options.header.title },
            template: options.header.template ?? "blue"
          };
        }
        const { response: createRes, release: releaseCreate } = await (0, import_feishu6.fetchWithSsrFGuard)({
          url: `${apiBase}/cardkit/v1/cards`,
          init: {
            method: "POST",
            headers: {
              Authorization: `Bearer ${await getToken(this.creds)}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ type: "card_json", data: JSON.stringify(cardJson) })
          },
          policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
          auditContext: "feishu.streaming-card.create"
        });
        if (!createRes.ok) {
          await releaseCreate();
          throw new Error(`Create card request failed with HTTP ${createRes.status}`);
        }
        const createData = await createRes.json();
        await releaseCreate();
        if (createData.code !== 0 || !createData.data?.card_id) {
          throw new Error(`Create card failed: ${createData.msg}`);
        }
        const cardId = createData.data.card_id;
        const cardContent = JSON.stringify({ type: "card", data: { card_id: cardId } });
        let sendRes;
        const sendOptions = options ?? {};
        const sendMode = resolveStreamingCardSendMode(sendOptions);
        if (sendMode === "reply") {
          sendRes = await this.client.im.message.reply({
            path: { message_id: sendOptions.replyToMessageId },
            data: {
              msg_type: "interactive",
              content: cardContent,
              ...sendOptions.replyInThread ? { reply_in_thread: true } : {}
            }
          });
        } else if (sendMode === "root_create") {
          sendRes = await this.client.im.message.create({
            params: { receive_id_type: receiveIdType },
            data: Object.assign(
              { receive_id: receiveId, msg_type: "interactive", content: cardContent },
              { root_id: sendOptions.rootId }
            )
          });
        } else {
          sendRes = await this.client.im.message.create({
            params: { receive_id_type: receiveIdType },
            data: {
              receive_id: receiveId,
              msg_type: "interactive",
              content: cardContent
            }
          });
        }
        if (sendRes.code !== 0 || !sendRes.data?.message_id) {
          throw new Error(`Send card failed: ${sendRes.msg}`);
        }
        this.state = { cardId, messageId: sendRes.data.message_id, sequence: 1, currentText: "" };
        this.log?.(`Started streaming: cardId=${cardId}, messageId=${sendRes.data.message_id}`);
      }
      async updateCardContent(text, onError) {
        if (!this.state) {
          return;
        }
        const apiBase = resolveApiBase(this.creds.domain);
        this.state.sequence += 1;
        await (0, import_feishu6.fetchWithSsrFGuard)({
          url: `${apiBase}/cardkit/v1/cards/${this.state.cardId}/elements/content/content`,
          init: {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${await getToken(this.creds)}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              content: text,
              sequence: this.state.sequence,
              uuid: `s_${this.state.cardId}_${this.state.sequence}`
            })
          },
          policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
          auditContext: "feishu.streaming-card.update"
        }).then(async ({ release }) => {
          await release();
        }).catch((error) => onError?.(error));
      }
      async update(text) {
        if (!this.state || this.closed) {
          return;
        }
        const mergedInput = mergeStreamingText(this.pendingText ?? this.state.currentText, text);
        if (!mergedInput || mergedInput === this.state.currentText) {
          return;
        }
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateThrottleMs) {
          this.pendingText = mergedInput;
          return;
        }
        this.pendingText = null;
        this.lastUpdateTime = now;
        this.queue = this.queue.then(async () => {
          if (!this.state || this.closed) {
            return;
          }
          const mergedText = mergeStreamingText(this.state.currentText, mergedInput);
          if (!mergedText || mergedText === this.state.currentText) {
            return;
          }
          this.state.currentText = mergedText;
          await this.updateCardContent(mergedText, (e) => this.log?.(`Update failed: ${String(e)}`));
        });
        await this.queue;
      }
      async close(finalText) {
        if (!this.state || this.closed) {
          return;
        }
        this.closed = true;
        await this.queue;
        const pendingMerged = mergeStreamingText(this.state.currentText, this.pendingText ?? void 0);
        const text = finalText ? mergeStreamingText(pendingMerged, finalText) : pendingMerged;
        const apiBase = resolveApiBase(this.creds.domain);
        if (text && text !== this.state.currentText) {
          await this.updateCardContent(text);
          this.state.currentText = text;
        }
        this.state.sequence += 1;
        await (0, import_feishu6.fetchWithSsrFGuard)({
          url: `${apiBase}/cardkit/v1/cards/${this.state.cardId}/settings`,
          init: {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${await getToken(this.creds)}`,
              "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({
              settings: JSON.stringify({
                config: { streaming_mode: false, summary: { content: truncateSummary(text) } }
              }),
              sequence: this.state.sequence,
              uuid: `c_${this.state.cardId}_${this.state.sequence}`
            })
          },
          policy: { allowedHostnames: resolveAllowedHostnames(this.creds.domain) },
          auditContext: "feishu.streaming-card.close"
        }).then(async ({ release }) => {
          await release();
        }).catch((e) => this.log?.(`Close failed: ${String(e)}`));
        this.log?.(`Closed streaming: cardId=${this.state.cardId}`);
      }
      isActive() {
        return this.state !== null && !this.closed;
      }
    };
  }
});

// src/core/extensions/feishu/src/typing.ts
function isFeishuBackoffError(err) {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const response = err.response;
  if (response) {
    if (response.status === 429) {
      return true;
    }
    if (typeof response.data?.code === "number" && FEISHU_BACKOFF_CODES.has(response.data.code)) {
      return true;
    }
  }
  const code = err.code;
  if (typeof code === "number" && FEISHU_BACKOFF_CODES.has(code)) {
    return true;
  }
  return false;
}
function getBackoffCodeFromResponse(response) {
  if (typeof response !== "object" || response === null) {
    return void 0;
  }
  const code = response.code;
  if (typeof code === "number" && FEISHU_BACKOFF_CODES.has(code)) {
    return code;
  }
  return void 0;
}
async function addTypingIndicator(params) {
  const { cfg, messageId, accountId, runtime } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    return { messageId, reactionId: null };
  }
  const client = createFeishuClient(account);
  try {
    const response = await client.im.messageReaction.create({
      path: { message_id: messageId },
      data: {
        reaction_type: { emoji_type: TYPING_EMOJI }
      }
    });
    const backoffCode = getBackoffCodeFromResponse(response);
    if (backoffCode !== void 0) {
      if (getFeishuRuntime().logging.shouldLogVerbose()) {
        runtime?.log?.(
          `[feishu] typing indicator response contains backoff code ${backoffCode}, stopping keepalive`
        );
      }
      throw new FeishuBackoffError(backoffCode);
    }
    const reactionId = response?.data?.reaction_id ?? null;
    return { messageId, reactionId };
  } catch (err) {
    if (isFeishuBackoffError(err)) {
      if (getFeishuRuntime().logging.shouldLogVerbose()) {
        runtime?.log?.("[feishu] typing indicator hit rate-limit/quota, stopping keepalive");
      }
      throw err;
    }
    if (getFeishuRuntime().logging.shouldLogVerbose()) {
      runtime?.log?.(`[feishu] failed to add typing indicator: ${String(err)}`);
    }
    return { messageId, reactionId: null };
  }
}
async function removeTypingIndicator(params) {
  const { cfg, state, accountId, runtime } = params;
  if (!state.reactionId) {
    return;
  }
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    return;
  }
  const client = createFeishuClient(account);
  try {
    const result = await client.im.messageReaction.delete({
      path: {
        message_id: state.messageId,
        reaction_id: state.reactionId
      }
    });
    const backoffCode = getBackoffCodeFromResponse(result);
    if (backoffCode !== void 0) {
      if (getFeishuRuntime().logging.shouldLogVerbose()) {
        runtime?.log?.(
          `[feishu] typing indicator removal response contains backoff code ${backoffCode}, stopping keepalive`
        );
      }
      throw new FeishuBackoffError(backoffCode);
    }
  } catch (err) {
    if (isFeishuBackoffError(err)) {
      if (getFeishuRuntime().logging.shouldLogVerbose()) {
        runtime?.log?.(
          "[feishu] typing indicator removal hit rate-limit/quota, stopping keepalive"
        );
      }
      throw err;
    }
    if (getFeishuRuntime().logging.shouldLogVerbose()) {
      runtime?.log?.(`[feishu] failed to remove typing indicator: ${String(err)}`);
    }
  }
}
var TYPING_EMOJI, FEISHU_BACKOFF_CODES, FeishuBackoffError;
var init_typing = __esm({
  "src/core/extensions/feishu/src/typing.ts"() {
    "use strict";
    init_accounts();
    init_client();
    init_runtime();
    TYPING_EMOJI = "Typing";
    FEISHU_BACKOFF_CODES = /* @__PURE__ */ new Set([99991400, 99991403, 429]);
    FeishuBackoffError = class extends Error {
      constructor(code) {
        super(`Feishu API backoff: code ${code}`);
        this.name = "FeishuBackoffError";
        this.code = code;
      }
    };
  }
});

// src/core/extensions/feishu/src/reply-dispatcher.ts
function shouldUseCard2(text) {
  return /```[\s\S]*?```/.test(text) || /\|.+\|[\r\n]+\|[-:| ]+\|/.test(text);
}
function normalizeEpochMs(timestamp) {
  if (!Number.isFinite(timestamp) || timestamp === void 0 || timestamp <= 0) {
    return void 0;
  }
  return timestamp < MS_EPOCH_MIN ? timestamp * 1e3 : timestamp;
}
function createFeishuReplyDispatcher(params) {
  const core = getFeishuRuntime();
  const {
    cfg,
    agentId,
    chatId,
    replyToMessageId,
    skipReplyToInMessages,
    replyInThread,
    threadReply,
    rootId,
    mentionTargets,
    accountId
  } = params;
  const sendReplyToMessageId = skipReplyToInMessages ? void 0 : replyToMessageId;
  const threadReplyMode = threadReply === true;
  const effectiveReplyInThread = threadReplyMode ? true : replyInThread;
  const account = resolveFeishuAccount({ cfg, accountId });
  const prefixContext = (0, import_feishu7.createReplyPrefixContext)({ cfg, agentId });
  let typingState = null;
  const typingCallbacks = (0, import_feishu7.createTypingCallbacks)({
    start: async () => {
      if (!(account.config.typingIndicator ?? true)) {
        return;
      }
      if (!replyToMessageId) {
        return;
      }
      const messageCreateTimeMs = normalizeEpochMs(params.messageCreateTimeMs);
      if (messageCreateTimeMs !== void 0 && Date.now() - messageCreateTimeMs > TYPING_INDICATOR_MAX_AGE_MS) {
        return;
      }
      if (typingState?.reactionId) {
        return;
      }
      typingState = await addTypingIndicator({
        cfg,
        messageId: replyToMessageId,
        accountId,
        runtime: params.runtime
      });
    },
    stop: async () => {
      if (!typingState) {
        return;
      }
      await removeTypingIndicator({ cfg, state: typingState, accountId, runtime: params.runtime });
      typingState = null;
    },
    onStartError: (err) => (0, import_feishu7.logTypingFailure)({
      log: (message) => params.runtime.log?.(message),
      channel: "feishu",
      action: "start",
      error: err
    }),
    onStopError: (err) => (0, import_feishu7.logTypingFailure)({
      log: (message) => params.runtime.log?.(message),
      channel: "feishu",
      action: "stop",
      error: err
    })
  });
  const textChunkLimit = core.channel.text.resolveTextChunkLimit(cfg, "feishu", accountId, {
    fallbackLimit: 4e3
  });
  const chunkMode = core.channel.text.resolveChunkMode(cfg, "feishu");
  const tableMode = core.channel.text.resolveMarkdownTableMode({ cfg, channel: "feishu" });
  const renderMode = account.config?.renderMode ?? "auto";
  const streamingEnabled = !threadReplyMode && account.config?.streaming !== false && renderMode !== "raw";
  let streaming = null;
  let streamText = "";
  let lastPartial = "";
  const deliveredFinalTexts = /* @__PURE__ */ new Set();
  let partialUpdateQueue = Promise.resolve();
  let streamingStartPromise = null;
  const queueStreamingUpdate = (nextText, options) => {
    if (!nextText) {
      return;
    }
    if (options?.dedupeWithLastPartial && nextText === lastPartial) {
      return;
    }
    if (options?.dedupeWithLastPartial) {
      lastPartial = nextText;
    }
    const mode = options?.mode ?? "snapshot";
    streamText = mode === "delta" ? `${streamText}${nextText}` : mergeStreamingText(streamText, nextText);
    partialUpdateQueue = partialUpdateQueue.then(async () => {
      if (streamingStartPromise) {
        await streamingStartPromise;
      }
      if (streaming?.isActive()) {
        await streaming.update(streamText);
      }
    });
  };
  const startStreaming = () => {
    if (!streamingEnabled || streamingStartPromise || streaming) {
      return;
    }
    streamingStartPromise = (async () => {
      const creds = account.appId && account.appSecret ? { appId: account.appId, appSecret: account.appSecret, domain: account.domain } : null;
      if (!creds) {
        return;
      }
      streaming = new FeishuStreamingSession(
        createFeishuClient(account),
        creds,
        (message) => params.runtime.log?.(`feishu[${account.accountId}] ${message}`)
      );
      try {
        await streaming.start(chatId, resolveReceiveIdType(chatId), {
          replyToMessageId,
          replyInThread: effectiveReplyInThread,
          rootId
        });
      } catch (error) {
        params.runtime.error?.(`feishu: streaming start failed: ${String(error)}`);
        streaming = null;
      }
    })();
  };
  const closeStreaming = async () => {
    if (streamingStartPromise) {
      await streamingStartPromise;
    }
    await partialUpdateQueue;
    if (streaming?.isActive()) {
      let text = streamText;
      if (mentionTargets?.length) {
        text = buildMentionedCardContent(mentionTargets, text);
      }
      await streaming.close(text);
    }
    streaming = null;
    streamingStartPromise = null;
    streamText = "";
    lastPartial = "";
  };
  const { dispatcher, replyOptions, markDispatchIdle } = core.channel.reply.createReplyDispatcherWithTyping({
    responsePrefix: prefixContext.responsePrefix,
    responsePrefixContextProvider: prefixContext.responsePrefixContextProvider,
    humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, agentId),
    onReplyStart: () => {
      deliveredFinalTexts.clear();
      if (streamingEnabled && renderMode === "card") {
        startStreaming();
      }
      void typingCallbacks.onReplyStart?.();
    },
    deliver: async (payload, info) => {
      const text = payload.text ?? "";
      const mediaList = payload.mediaUrls && payload.mediaUrls.length > 0 ? payload.mediaUrls : payload.mediaUrl ? [payload.mediaUrl] : [];
      const hasText = Boolean(text.trim());
      const hasMedia = mediaList.length > 0;
      const skipTextForDuplicateFinal = info?.kind === "final" && hasText && deliveredFinalTexts.has(text);
      const shouldDeliverText = hasText && !skipTextForDuplicateFinal;
      if (!shouldDeliverText && !hasMedia) {
        return;
      }
      if (shouldDeliverText) {
        const useCard = renderMode === "card" || renderMode === "auto" && shouldUseCard2(text);
        if (info?.kind === "block") {
          if (!(streamingEnabled && useCard)) {
            return;
          }
          startStreaming();
          if (streamingStartPromise) {
            await streamingStartPromise;
          }
        }
        if (info?.kind === "final" && streamingEnabled && useCard) {
          startStreaming();
          if (streamingStartPromise) {
            await streamingStartPromise;
          }
        }
        if (streaming?.isActive()) {
          if (info?.kind === "block") {
            queueStreamingUpdate(text, { mode: "delta" });
          }
          if (info?.kind === "final") {
            streamText = mergeStreamingText(streamText, text);
            await closeStreaming();
            deliveredFinalTexts.add(text);
          }
          if (hasMedia) {
            for (const mediaUrl of mediaList) {
              await sendMediaFeishu({
                cfg,
                to: chatId,
                mediaUrl,
                replyToMessageId: sendReplyToMessageId,
                replyInThread: effectiveReplyInThread,
                accountId
              });
            }
          }
          return;
        }
        let first = true;
        if (useCard) {
          for (const chunk of core.channel.text.chunkTextWithMode(
            text,
            textChunkLimit,
            chunkMode
          )) {
            await sendMarkdownCardFeishu({
              cfg,
              to: chatId,
              text: chunk,
              replyToMessageId: sendReplyToMessageId,
              replyInThread: effectiveReplyInThread,
              mentions: first ? mentionTargets : void 0,
              accountId
            });
            first = false;
          }
          if (info?.kind === "final") {
            deliveredFinalTexts.add(text);
          }
        } else {
          const converted = core.channel.text.convertMarkdownTables(text, tableMode);
          for (const chunk of core.channel.text.chunkTextWithMode(
            converted,
            textChunkLimit,
            chunkMode
          )) {
            await sendMessageFeishu({
              cfg,
              to: chatId,
              text: chunk,
              replyToMessageId: sendReplyToMessageId,
              replyInThread: effectiveReplyInThread,
              mentions: first ? mentionTargets : void 0,
              accountId
            });
            first = false;
          }
          if (info?.kind === "final") {
            deliveredFinalTexts.add(text);
          }
        }
      }
      if (hasMedia) {
        for (const mediaUrl of mediaList) {
          await sendMediaFeishu({
            cfg,
            to: chatId,
            mediaUrl,
            replyToMessageId: sendReplyToMessageId,
            replyInThread: effectiveReplyInThread,
            accountId
          });
        }
      }
    },
    onError: async (error, info) => {
      params.runtime.error?.(
        `feishu[${account.accountId}] ${info.kind} reply failed: ${String(error)}`
      );
      await closeStreaming();
      typingCallbacks.onIdle?.();
    },
    onIdle: async () => {
      await closeStreaming();
      typingCallbacks.onIdle?.();
    },
    onCleanup: () => {
      typingCallbacks.onCleanup?.();
    }
  });
  return {
    dispatcher,
    replyOptions: {
      ...replyOptions,
      onModelSelected: prefixContext.onModelSelected,
      disableBlockStreaming: true,
      onPartialReply: streamingEnabled ? (payload) => {
        if (!payload.text) {
          return;
        }
        queueStreamingUpdate(payload.text, {
          dedupeWithLastPartial: true,
          mode: "snapshot"
        });
      } : void 0
    },
    markDispatchIdle
  };
}
var import_feishu7, TYPING_INDICATOR_MAX_AGE_MS, MS_EPOCH_MIN;
var init_reply_dispatcher = __esm({
  "src/core/extensions/feishu/src/reply-dispatcher.ts"() {
    "use strict";
    import_feishu7 = require("src/core/source/plugin-sdk/feishu");
    init_accounts();
    init_client();
    init_media();
    init_mention();
    init_runtime();
    init_send();
    init_streaming_card();
    init_targets();
    init_typing();
    TYPING_INDICATOR_MAX_AGE_MS = 2 * 6e4;
    MS_EPOCH_MIN = 1e12;
  }
});

// src/core/extensions/feishu/src/bot.ts
function correctFeishuScopeInUrl(url) {
  let corrected = url;
  for (const [wrong, right] of Object.entries(FEISHU_SCOPE_CORRECTIONS)) {
    corrected = corrected.replaceAll(encodeURIComponent(wrong), encodeURIComponent(right));
    corrected = corrected.replaceAll(wrong, right);
  }
  return corrected;
}
function shouldSuppressPermissionErrorNotice(permissionError) {
  const message = permissionError.message.toLowerCase();
  return IGNORED_PERMISSION_SCOPE_TOKENS.some((token) => message.includes(token));
}
function extractPermissionError(err) {
  if (!err || typeof err !== "object") return null;
  const axiosErr = err;
  const data = axiosErr.response?.data;
  if (!data || typeof data !== "object") return null;
  const feishuErr = data;
  if (feishuErr.code !== 99991672) return null;
  const msg = feishuErr.msg ?? "";
  const urlMatch = msg.match(/https:\/\/[^\s,]+\/app\/[^\s,]+/);
  const grantUrl = urlMatch?.[0] ? correctFeishuScopeInUrl(urlMatch[0]) : void 0;
  return {
    code: feishuErr.code,
    message: msg,
    grantUrl
  };
}
function resolveSenderLookupIdType(senderId) {
  const trimmed = senderId.trim();
  if (trimmed.startsWith("ou_")) {
    return "open_id";
  }
  if (trimmed.startsWith("on_")) {
    return "union_id";
  }
  return "user_id";
}
async function resolveFeishuSenderName(params) {
  const { account, senderId, log } = params;
  if (!account.configured) return {};
  const normalizedSenderId = senderId.trim();
  if (!normalizedSenderId) return {};
  const cached = senderNameCache.get(normalizedSenderId);
  const now = Date.now();
  if (cached && cached.expireAt > now) return { name: cached.name };
  try {
    const client = createFeishuClient(account);
    const userIdType = resolveSenderLookupIdType(normalizedSenderId);
    const res = await client.contact.user.get({
      path: { user_id: normalizedSenderId },
      params: { user_id_type: userIdType }
    });
    const name = res?.data?.user?.name || res?.data?.user?.display_name || res?.data?.user?.nickname || res?.data?.user?.en_name;
    if (name && typeof name === "string") {
      senderNameCache.set(normalizedSenderId, { name, expireAt: now + SENDER_NAME_TTL_MS });
      return { name };
    }
    return {};
  } catch (err) {
    const permErr = extractPermissionError(err);
    if (permErr) {
      if (shouldSuppressPermissionErrorNotice(permErr)) {
        log(`feishu: ignoring stale permission scope error: ${permErr.message}`);
        return {};
      }
      log(`feishu: permission error resolving sender name: code=${permErr.code}`);
      return { permissionError: permErr };
    }
    log(`feishu: failed to resolve sender name for ${normalizedSenderId}: ${String(err)}`);
    return {};
  }
}
function resolveFeishuGroupSession(params) {
  const { chatId, senderOpenId, messageId, rootId, threadId, groupConfig, feishuCfg } = params;
  const normalizedThreadId = threadId?.trim();
  const normalizedRootId = rootId?.trim();
  const threadReply = Boolean(normalizedThreadId || normalizedRootId);
  const replyInThread = (groupConfig?.replyInThread ?? feishuCfg?.replyInThread ?? "disabled") === "enabled" || threadReply;
  const legacyTopicSessionMode = groupConfig?.topicSessionMode ?? feishuCfg?.topicSessionMode ?? "disabled";
  const groupSessionScope = groupConfig?.groupSessionScope ?? feishuCfg?.groupSessionScope ?? (legacyTopicSessionMode === "enabled" ? "group_topic" : "group");
  const topicScope = groupSessionScope === "group_topic" || groupSessionScope === "group_topic_sender" ? normalizedRootId ?? normalizedThreadId ?? (replyInThread ? messageId : null) : null;
  let peerId = chatId;
  switch (groupSessionScope) {
    case "group_sender":
      peerId = `${chatId}:sender:${senderOpenId}`;
      break;
    case "group_topic":
      peerId = topicScope ? `${chatId}:topic:${topicScope}` : chatId;
      break;
    case "group_topic_sender":
      peerId = topicScope ? `${chatId}:topic:${topicScope}:sender:${senderOpenId}` : `${chatId}:sender:${senderOpenId}`;
      break;
    case "group":
    default:
      peerId = chatId;
      break;
  }
  const parentPeer = topicScope && (groupSessionScope === "group_topic" || groupSessionScope === "group_topic_sender") ? {
    kind: "group",
    id: chatId
  } : null;
  return {
    peerId,
    parentPeer,
    groupSessionScope,
    replyInThread,
    threadReply
  };
}
function parseMessageContent(content, messageType) {
  if (messageType === "post") {
    const { textContent } = parsePostContent(content);
    return textContent;
  }
  try {
    const parsed = JSON.parse(content);
    if (messageType === "text") {
      return parsed.text || "";
    }
    if (messageType === "share_chat") {
      if (parsed && typeof parsed === "object") {
        const share = parsed;
        if (typeof share.body === "string" && share.body.trim().length > 0) {
          return share.body.trim();
        }
        if (typeof share.summary === "string" && share.summary.trim().length > 0) {
          return share.summary.trim();
        }
        if (typeof share.share_chat_id === "string" && share.share_chat_id.trim().length > 0) {
          return `[Forwarded message: ${share.share_chat_id.trim()}]`;
        }
      }
      return "[Forwarded message]";
    }
    if (messageType === "merge_forward") {
      return "[Merged and Forwarded Message - loading...]";
    }
    return content;
  } catch {
    return content;
  }
}
function parseMergeForwardContent(params) {
  const { content, log } = params;
  const maxMessages = 50;
  log?.(`feishu: parsing merge_forward sub-messages from API response`);
  let items;
  try {
    items = JSON.parse(content);
  } catch {
    log?.(`feishu: merge_forward items parse failed`);
    return "[Merged and Forwarded Message - parse error]";
  }
  if (!Array.isArray(items) || items.length === 0) {
    return "[Merged and Forwarded Message - no sub-messages]";
  }
  const subMessages = items.filter((item) => item.upper_message_id);
  if (subMessages.length === 0) {
    return "[Merged and Forwarded Message - no sub-messages found]";
  }
  log?.(`feishu: merge_forward contains ${subMessages.length} sub-messages`);
  subMessages.sort((a, b) => {
    const timeA = parseInt(a.create_time || "0", 10);
    const timeB = parseInt(b.create_time || "0", 10);
    return timeA - timeB;
  });
  const lines = ["[Merged and Forwarded Messages]"];
  const limitedMessages = subMessages.slice(0, maxMessages);
  for (const item of limitedMessages) {
    const msgContent = item.body?.content || "";
    const msgType = item.msg_type || "text";
    const formatted = formatSubMessageContent(msgContent, msgType);
    lines.push(`- ${formatted}`);
  }
  if (subMessages.length > maxMessages) {
    lines.push(`... and ${subMessages.length - maxMessages} more messages`);
  }
  return lines.join("\n");
}
function formatSubMessageContent(content, contentType) {
  try {
    const parsed = JSON.parse(content);
    switch (contentType) {
      case "text":
        return parsed.text || content;
      case "post": {
        const { textContent } = parsePostContent(content);
        return textContent;
      }
      case "image":
        return "[Image]";
      case "file":
        return `[File: ${parsed.file_name || "unknown"}]`;
      case "audio":
        return "[Audio]";
      case "video":
        return "[Video]";
      case "sticker":
        return "[Sticker]";
      case "merge_forward":
        return "[Nested Merged Forward]";
      default:
        return `[${contentType}]`;
    }
  } catch {
    return content;
  }
}
function checkBotMentioned(event, botOpenId) {
  if (!botOpenId) return false;
  const rawContent = event.message.content ?? "";
  if (rawContent.includes("@_all")) return true;
  const mentions = event.message.mentions ?? [];
  if (mentions.length > 0) {
    return mentions.some((m) => m.id.open_id === botOpenId);
  }
  if (event.message.message_type === "post") {
    const { mentionedOpenIds } = parsePostContent(event.message.content);
    return mentionedOpenIds.some((id) => id === botOpenId);
  }
  return false;
}
function normalizeMentions(text, mentions, botStripId) {
  if (!mentions || mentions.length === 0) return text;
  const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapeName = (value) => value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let result = text;
  for (const mention of mentions) {
    const mentionId = mention.id.open_id;
    const replacement = botStripId && mentionId === botStripId ? "" : mentionId ? `<at user_id="${mentionId}">${escapeName(mention.name)}</at>` : `@${mention.name}`;
    result = result.replace(new RegExp(escaped(mention.key), "g"), () => replacement).trim();
  }
  return result;
}
function normalizeFeishuCommandProbeBody(text) {
  if (!text) {
    return "";
  }
  return text.replace(/<at\b[^>]*>[^<]*<\/at>/giu, " ").replace(/(^|\s)@[^/\s]+(?=\s|$|\/)/gu, "$1").replace(/\s+/g, " ").trim();
}
function parseMediaKeys(content, messageType) {
  try {
    const parsed = JSON.parse(content);
    const imageKey = normalizeFeishuExternalKey(parsed.image_key);
    const fileKey = normalizeFeishuExternalKey(parsed.file_key);
    switch (messageType) {
      case "image":
        return { imageKey };
      case "file":
        return { fileKey, fileName: parsed.file_name };
      case "audio":
        return { fileKey };
      case "video":
      case "media":
        return { fileKey, imageKey };
      case "sticker":
        return { fileKey };
      default:
        return {};
    }
  } catch {
    return {};
  }
}
function toMessageResourceType(messageType) {
  return messageType === "image" ? "image" : "file";
}
function inferPlaceholder(messageType) {
  switch (messageType) {
    case "image":
      return "<media:image>";
    case "file":
      return "<media:document>";
    case "audio":
      return "<media:audio>";
    case "video":
    case "media":
      return "<media:video>";
    case "sticker":
      return "<media:sticker>";
    default:
      return "<media:document>";
  }
}
async function resolveFeishuMediaList(params) {
  const { cfg, messageId, messageType, content, maxBytes, log, accountId } = params;
  const mediaTypes = ["image", "file", "audio", "video", "media", "sticker", "post"];
  if (!mediaTypes.includes(messageType)) {
    return [];
  }
  const out = [];
  const core = getFeishuRuntime();
  if (messageType === "post") {
    const { imageKeys, mediaKeys: postMediaKeys } = parsePostContent(content);
    if (imageKeys.length === 0 && postMediaKeys.length === 0) {
      return [];
    }
    if (imageKeys.length > 0) {
      log?.(`feishu: post message contains ${imageKeys.length} embedded image(s)`);
    }
    if (postMediaKeys.length > 0) {
      log?.(`feishu: post message contains ${postMediaKeys.length} embedded media file(s)`);
    }
    for (const imageKey of imageKeys) {
      try {
        const result = await downloadMessageResourceFeishu({
          cfg,
          messageId,
          fileKey: imageKey,
          type: "image",
          accountId
        });
        let contentType = result.contentType;
        if (!contentType) {
          contentType = await core.media.detectMime({ buffer: result.buffer });
        }
        const saved = await core.channel.media.saveMediaBuffer(
          result.buffer,
          contentType,
          "inbound",
          maxBytes
        );
        out.push({
          path: saved.path,
          contentType: saved.contentType,
          placeholder: "<media:image>"
        });
        log?.(`feishu: downloaded embedded image ${imageKey}, saved to ${saved.path}`);
      } catch (err) {
        log?.(`feishu: failed to download embedded image ${imageKey}: ${String(err)}`);
      }
    }
    for (const media of postMediaKeys) {
      try {
        const result = await downloadMessageResourceFeishu({
          cfg,
          messageId,
          fileKey: media.fileKey,
          type: "file",
          accountId
        });
        let contentType = result.contentType;
        if (!contentType) {
          contentType = await core.media.detectMime({ buffer: result.buffer });
        }
        const saved = await core.channel.media.saveMediaBuffer(
          result.buffer,
          contentType,
          "inbound",
          maxBytes
        );
        out.push({
          path: saved.path,
          contentType: saved.contentType,
          placeholder: "<media:video>"
        });
        log?.(`feishu: downloaded embedded media ${media.fileKey}, saved to ${saved.path}`);
      } catch (err) {
        log?.(`feishu: failed to download embedded media ${media.fileKey}: ${String(err)}`);
      }
    }
    return out;
  }
  const mediaKeys = parseMediaKeys(content, messageType);
  if (!mediaKeys.imageKey && !mediaKeys.fileKey) {
    return [];
  }
  try {
    let buffer;
    let contentType;
    let fileName;
    const fileKey = mediaKeys.fileKey || mediaKeys.imageKey;
    if (!fileKey) {
      return [];
    }
    const resourceType = toMessageResourceType(messageType);
    const result = await downloadMessageResourceFeishu({
      cfg,
      messageId,
      fileKey,
      type: resourceType,
      accountId
    });
    buffer = result.buffer;
    contentType = result.contentType;
    fileName = result.fileName || mediaKeys.fileName;
    if (!contentType) {
      contentType = await core.media.detectMime({ buffer });
    }
    const saved = await core.channel.media.saveMediaBuffer(
      buffer,
      contentType,
      "inbound",
      maxBytes,
      fileName
    );
    out.push({
      path: saved.path,
      contentType: saved.contentType,
      placeholder: inferPlaceholder(messageType)
    });
    log?.(`feishu: downloaded ${messageType} media, saved to ${saved.path}`);
  } catch (err) {
    log?.(`feishu: failed to download ${messageType} media: ${String(err)}`);
  }
  return out;
}
function resolveBroadcastAgents(cfg, peerId) {
  const broadcast = cfg.broadcast;
  if (!broadcast || typeof broadcast !== "object") return null;
  const agents = broadcast[peerId];
  if (!Array.isArray(agents) || agents.length === 0) return null;
  return agents;
}
function buildBroadcastSessionKey(baseSessionKey, originalAgentId, targetAgentId) {
  const prefix = `agent:${originalAgentId}:`;
  if (baseSessionKey.startsWith(prefix)) {
    return `agent:${targetAgentId}:${baseSessionKey.slice(prefix.length)}`;
  }
  return baseSessionKey;
}
function parseFeishuMessageEvent(event, botOpenId, _botName) {
  const rawContent = parseMessageContent(event.message.content, event.message.message_type);
  const mentionedBot = checkBotMentioned(event, botOpenId);
  const hasAnyMention = (event.message.mentions?.length ?? 0) > 0;
  const content = normalizeMentions(rawContent, event.message.mentions, botOpenId);
  const senderOpenId = event.sender.sender_id.open_id?.trim();
  const senderUserId = event.sender.sender_id.user_id?.trim();
  const senderFallbackId = senderOpenId || senderUserId || "";
  const ctx = {
    chatId: event.message.chat_id,
    messageId: event.message.message_id,
    senderId: senderUserId || senderOpenId || "",
    // Keep the historical field name, but fall back to user_id when open_id is unavailable
    // (common in some mobile app deliveries).
    senderOpenId: senderFallbackId,
    chatType: event.message.chat_type,
    mentionedBot,
    hasAnyMention,
    rootId: event.message.root_id || void 0,
    parentId: event.message.parent_id || void 0,
    threadId: event.message.thread_id || void 0,
    content,
    contentType: event.message.message_type
  };
  if (isMentionForwardRequest(event, botOpenId)) {
    const mentionTargets = extractMentionTargets(event, botOpenId);
    if (mentionTargets.length > 0) {
      ctx.mentionTargets = mentionTargets;
    }
  }
  return ctx;
}
function buildFeishuAgentBody(params) {
  const { ctx, quotedContent, permissionErrorForAgent, botOpenId } = params;
  let messageBody = ctx.content;
  if (quotedContent) {
    messageBody = `[Replying to: "${quotedContent}"]

${ctx.content}`;
  }
  const speaker = ctx.senderName ?? ctx.senderOpenId;
  messageBody = `${speaker}: ${messageBody}`;
  if (ctx.hasAnyMention) {
    const botIdHint = botOpenId?.trim();
    messageBody += `

[System: The content may include mention tags in the form <at user_id="...">name</at>. Treat these as real mentions of Feishu entities (users or bots).]`;
    if (botIdHint) {
      messageBody += `
[System: If user_id is "${botIdHint}", that mention refers to you.]`;
    }
  }
  if (ctx.mentionTargets && ctx.mentionTargets.length > 0) {
    const targetNames = ctx.mentionTargets.map((t) => t.name).join(", ");
    messageBody += `

[System: Your reply will automatically @mention: ${targetNames}. Do not write @xxx yourself.]`;
  }
  messageBody = `[message_id: ${ctx.messageId}]
${messageBody}`;
  if (permissionErrorForAgent) {
    const grantUrl = permissionErrorForAgent.grantUrl ?? "";
    messageBody += `

[System: The bot encountered a Feishu API permission error. Please inform the user about this issue and provide the permission grant URL for the admin to authorize. Permission grant URL: ${grantUrl}]`;
  }
  return messageBody;
}
async function handleFeishuMessage(params) {
  const { cfg, event, botOpenId, botName, runtime, chatHistories, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  const feishuCfg = account.config;
  const log = runtime?.log ?? console.log;
  const error = runtime?.error ?? console.error;
  const messageId = event.message.message_id;
  const memoryDedupeKey = `${account.accountId}:${messageId}`;
  if (!tryRecordMessage(memoryDedupeKey)) {
    log(`feishu: skipping duplicate message ${messageId} (memory dedup)`);
    return;
  }
  if (!await tryRecordMessagePersistent(messageId, account.accountId, log)) {
    log(`feishu: skipping duplicate message ${messageId}`);
    return;
  }
  let ctx = parseFeishuMessageEvent(event, botOpenId, botName);
  const isGroup = ctx.chatType === "group";
  const isDirect = !isGroup;
  const senderUserId = event.sender.sender_id.user_id?.trim() || void 0;
  if (event.message.message_type === "merge_forward") {
    log(
      `feishu[${account.accountId}]: processing merge_forward message, fetching full content via API`
    );
    try {
      const client = createFeishuClient(account);
      const response = await client.im.message.get({
        path: { message_id: event.message.message_id }
      });
      if (response.code === 0 && response.data?.items && response.data.items.length > 0) {
        log(
          `feishu[${account.accountId}]: merge_forward API returned ${response.data.items.length} items`
        );
        const expandedContent = parseMergeForwardContent({
          content: JSON.stringify(response.data.items),
          log
        });
        ctx = { ...ctx, content: expandedContent };
      } else {
        log(`feishu[${account.accountId}]: merge_forward API returned no items`);
        ctx = { ...ctx, content: "[Merged and Forwarded Message - could not fetch]" };
      }
    } catch (err) {
      log(`feishu[${account.accountId}]: merge_forward fetch failed: ${String(err)}`);
      ctx = { ...ctx, content: "[Merged and Forwarded Message - fetch error]" };
    }
  }
  let permissionErrorForAgent;
  if (feishuCfg?.resolveSenderNames ?? true) {
    const senderResult = await resolveFeishuSenderName({
      account,
      senderId: ctx.senderOpenId,
      log
    });
    if (senderResult.name) ctx = { ...ctx, senderName: senderResult.name };
    if (senderResult.permissionError) {
      const appKey = account.appId ?? "default";
      const now = Date.now();
      const lastNotified = permissionErrorNotifiedAt.get(appKey) ?? 0;
      if (now - lastNotified > PERMISSION_ERROR_COOLDOWN_MS) {
        permissionErrorNotifiedAt.set(appKey, now);
        permissionErrorForAgent = senderResult.permissionError;
      }
    }
  }
  log(
    `feishu[${account.accountId}]: received message from ${ctx.senderOpenId} in ${ctx.chatId} (${ctx.chatType})`
  );
  if (ctx.mentionTargets && ctx.mentionTargets.length > 0) {
    const names = ctx.mentionTargets.map((t) => t.name).join(", ");
    log(`feishu[${account.accountId}]: detected @ forward request, targets: [${names}]`);
  }
  const historyLimit = Math.max(
    0,
    feishuCfg?.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? import_feishu8.DEFAULT_GROUP_HISTORY_LIMIT
  );
  const groupConfig = isGroup ? resolveFeishuGroupConfig({ cfg: feishuCfg, groupId: ctx.chatId }) : void 0;
  const groupSession = isGroup ? resolveFeishuGroupSession({
    chatId: ctx.chatId,
    senderOpenId: ctx.senderOpenId,
    messageId: ctx.messageId,
    rootId: ctx.rootId,
    threadId: ctx.threadId,
    groupConfig,
    feishuCfg
  }) : null;
  const groupHistoryKey = isGroup ? groupSession?.peerId ?? ctx.chatId : void 0;
  const dmPolicy2 = feishuCfg?.dmPolicy ?? "pairing";
  const configAllowFrom = feishuCfg?.allowFrom ?? [];
  const useAccessGroups = cfg.commands?.useAccessGroups !== false;
  const rawBroadcastAgents = isGroup ? resolveBroadcastAgents(cfg, ctx.chatId) : null;
  const broadcastAgents = rawBroadcastAgents ? [...new Set(rawBroadcastAgents.map((id) => (0, import_feishu8.normalizeAgentId)(id)))] : null;
  let requireMention = false;
  if (isGroup) {
    if (groupConfig?.enabled === false) {
      log(`feishu[${account.accountId}]: group ${ctx.chatId} is disabled`);
      return;
    }
    const defaultGroupPolicy = (0, import_feishu8.resolveDefaultGroupPolicy)(cfg);
    const { groupPolicy, providerMissingFallbackApplied } = (0, import_feishu8.resolveOpenProviderRuntimeGroupPolicy)({
      providerConfigPresent: cfg.channels?.feishu !== void 0,
      groupPolicy: feishuCfg?.groupPolicy,
      defaultGroupPolicy
    });
    (0, import_feishu8.warnMissingProviderGroupPolicyFallbackOnce)({
      providerMissingFallbackApplied,
      providerKey: "feishu",
      accountId: account.accountId,
      log
    });
    const groupAllowFrom = feishuCfg?.groupAllowFrom ?? [];
    const groupAllowed = isFeishuGroupAllowed({
      groupPolicy,
      allowFrom: groupAllowFrom,
      senderId: ctx.chatId,
      // Check group ID, not sender ID
      senderName: void 0
    });
    if (!groupAllowed) {
      log(
        `feishu[${account.accountId}]: group ${ctx.chatId} not in groupAllowFrom (groupPolicy=${groupPolicy})`
      );
      return;
    }
    const perGroupSenderAllowFrom = groupConfig?.allowFrom ?? [];
    const globalSenderAllowFrom = feishuCfg?.groupSenderAllowFrom ?? [];
    const effectiveSenderAllowFrom = perGroupSenderAllowFrom.length > 0 ? perGroupSenderAllowFrom : globalSenderAllowFrom;
    if (effectiveSenderAllowFrom.length > 0) {
      const senderAllowed = isFeishuGroupAllowed({
        groupPolicy: "allowlist",
        allowFrom: effectiveSenderAllowFrom,
        senderId: ctx.senderOpenId,
        senderIds: [senderUserId],
        senderName: ctx.senderName
      });
      if (!senderAllowed) {
        log(`feishu: sender ${ctx.senderOpenId} not in group ${ctx.chatId} sender allowlist`);
        return;
      }
    }
    ({ requireMention } = resolveFeishuReplyPolicy({
      isDirectMessage: false,
      globalConfig: feishuCfg,
      groupConfig
    }));
    if (requireMention && !ctx.mentionedBot) {
      log(`feishu[${account.accountId}]: message in group ${ctx.chatId} did not mention bot`);
      if (!broadcastAgents && chatHistories && groupHistoryKey) {
        (0, import_feishu8.recordPendingHistoryEntryIfEnabled)({
          historyMap: chatHistories,
          historyKey: groupHistoryKey,
          limit: historyLimit,
          entry: {
            sender: ctx.senderOpenId,
            body: `${ctx.senderName ?? ctx.senderOpenId}: ${ctx.content}`,
            timestamp: Date.now(),
            messageId: ctx.messageId
          }
        });
      }
      return;
    }
  } else {
  }
  try {
    const core = getFeishuRuntime();
    const pairing = (0, import_feishu8.createScopedPairingAccess)({
      core,
      channel: "feishu",
      accountId: account.accountId
    });
    const commandProbeBody = isGroup ? normalizeFeishuCommandProbeBody(ctx.content) : ctx.content;
    const shouldComputeCommandAuthorized = core.channel.commands.shouldComputeCommandAuthorized(
      commandProbeBody,
      cfg
    );
    const storeAllowFrom = !isGroup && dmPolicy2 !== "allowlist" && (dmPolicy2 !== "open" || shouldComputeCommandAuthorized) ? await pairing.readAllowFromStore().catch(() => []) : [];
    const effectiveDmAllowFrom = [...configAllowFrom, ...storeAllowFrom];
    const dmAllowed = resolveFeishuAllowlistMatch({
      allowFrom: effectiveDmAllowFrom,
      senderId: ctx.senderOpenId,
      senderIds: [senderUserId],
      senderName: ctx.senderName
    }).allowed;
    if (isDirect && dmPolicy2 !== "open" && !dmAllowed) {
      if (dmPolicy2 === "pairing") {
        await (0, import_feishu8.issuePairingChallenge)({
          channel: "feishu",
          senderId: ctx.senderOpenId,
          senderIdLine: `Your Feishu user id: ${ctx.senderOpenId}`,
          meta: { name: ctx.senderName },
          upsertPairingRequest: pairing.upsertPairingRequest,
          onCreated: () => {
            log(`feishu[${account.accountId}]: pairing request sender=${ctx.senderOpenId}`);
          },
          sendPairingReply: async (text) => {
            await sendMessageFeishu({
              cfg,
              to: `chat:${ctx.chatId}`,
              text,
              accountId: account.accountId
            });
          },
          onReplyError: (err) => {
            log(
              `feishu[${account.accountId}]: pairing reply failed for ${ctx.senderOpenId}: ${String(err)}`
            );
          }
        });
      } else {
        log(
          `feishu[${account.accountId}]: blocked unauthorized sender ${ctx.senderOpenId} (dmPolicy=${dmPolicy2})`
        );
      }
      return;
    }
    const commandAllowFrom = isGroup ? groupConfig?.allowFrom ?? configAllowFrom : effectiveDmAllowFrom;
    const senderAllowedForCommands = resolveFeishuAllowlistMatch({
      allowFrom: commandAllowFrom,
      senderId: ctx.senderOpenId,
      senderIds: [senderUserId],
      senderName: ctx.senderName
    }).allowed;
    const commandAuthorized = shouldComputeCommandAuthorized ? core.channel.commands.resolveCommandAuthorizedFromAuthorizers({
      useAccessGroups,
      authorizers: [
        { configured: commandAllowFrom.length > 0, allowed: senderAllowedForCommands }
      ]
    }) : void 0;
    const feishuFrom = `feishu:${ctx.senderOpenId}`;
    const feishuTo = isGroup ? `chat:${ctx.chatId}` : `user:${ctx.senderOpenId}`;
    const peerId = isGroup ? groupSession?.peerId ?? ctx.chatId : ctx.senderOpenId;
    const parentPeer = isGroup ? groupSession?.parentPeer ?? null : null;
    const replyInThread = isGroup ? groupSession?.replyInThread ?? false : false;
    if (isGroup && groupSession) {
      log(
        `feishu[${account.accountId}]: group session scope=${groupSession.groupSessionScope}, peer=${peerId}`
      );
    }
    let route = core.channel.routing.resolveAgentRoute({
      cfg,
      channel: "feishu",
      accountId: account.accountId,
      peer: {
        kind: isGroup ? "group" : "direct",
        id: peerId
      },
      parentPeer
    });
    let effectiveCfg = cfg;
    if (!isGroup && route.matchedBy === "default") {
      const dynamicCfg = feishuCfg?.dynamicAgentCreation;
      if (dynamicCfg?.enabled) {
        const runtime2 = getFeishuRuntime();
        const result = await maybeCreateDynamicAgent({
          cfg,
          runtime: runtime2,
          senderOpenId: ctx.senderOpenId,
          dynamicCfg,
          log: (msg) => log(msg)
        });
        if (result.created) {
          effectiveCfg = result.updatedCfg;
          route = core.channel.routing.resolveAgentRoute({
            cfg: result.updatedCfg,
            channel: "feishu",
            accountId: account.accountId,
            peer: { kind: "direct", id: ctx.senderOpenId }
          });
          log(
            `feishu[${account.accountId}]: dynamic agent created, new route: ${route.sessionKey}`
          );
        }
      }
    }
    const preview = ctx.content.replace(/\s+/g, " ").slice(0, 160);
    const inboundLabel = isGroup ? `Feishu[${account.accountId}] message in group ${ctx.chatId}` : `Feishu[${account.accountId}] DM from ${ctx.senderOpenId}`;
    log(`feishu[${account.accountId}]: ${inboundLabel}: ${preview}`);
    const mediaMaxBytes = (feishuCfg?.mediaMaxMb ?? 30) * 1024 * 1024;
    const mediaList = await resolveFeishuMediaList({
      cfg,
      messageId: ctx.messageId,
      messageType: event.message.message_type,
      content: event.message.content,
      maxBytes: mediaMaxBytes,
      log,
      accountId: account.accountId
    });
    const mediaPayload = (0, import_feishu8.buildAgentMediaPayload)(mediaList);
    let quotedContent;
    if (ctx.parentId) {
      try {
        const quotedMsg = await getMessageFeishu({
          cfg,
          messageId: ctx.parentId,
          accountId: account.accountId
        });
        if (quotedMsg) {
          quotedContent = quotedMsg.content;
          log(
            `feishu[${account.accountId}]: fetched quoted message: ${quotedContent?.slice(0, 100)}`
          );
        }
      } catch (err) {
        log(`feishu[${account.accountId}]: failed to fetch quoted message: ${String(err)}`);
      }
    }
    const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(cfg);
    const messageBody = buildFeishuAgentBody({
      ctx,
      quotedContent,
      permissionErrorForAgent,
      botOpenId
    });
    const envelopeFrom = isGroup ? `${ctx.chatId}:${ctx.senderOpenId}` : ctx.senderOpenId;
    if (permissionErrorForAgent) {
      log(`feishu[${account.accountId}]: appending permission error notice to message body`);
    }
    const body = core.channel.reply.formatAgentEnvelope({
      channel: "Feishu",
      from: envelopeFrom,
      timestamp: /* @__PURE__ */ new Date(),
      envelope: envelopeOptions,
      body: messageBody
    });
    let combinedBody = body;
    const historyKey = groupHistoryKey;
    if (isGroup && historyKey && chatHistories) {
      combinedBody = (0, import_feishu8.buildPendingHistoryContextFromMap)({
        historyMap: chatHistories,
        historyKey,
        limit: historyLimit,
        currentMessage: combinedBody,
        formatEntry: (entry) => core.channel.reply.formatAgentEnvelope({
          channel: "Feishu",
          // Preserve speaker identity in group history as well.
          from: `${ctx.chatId}:${entry.sender}`,
          timestamp: entry.timestamp,
          body: entry.body,
          envelope: envelopeOptions
        })
      });
    }
    const inboundHistory = isGroup && historyKey && historyLimit > 0 && chatHistories ? (chatHistories.get(historyKey) ?? []).map((entry) => ({
      sender: entry.sender,
      body: entry.body,
      timestamp: entry.timestamp
    })) : void 0;
    const buildCtxPayloadForAgent = (agentSessionKey, agentAccountId, wasMentioned) => core.channel.reply.finalizeInboundContext({
      Body: combinedBody,
      BodyForAgent: messageBody,
      InboundHistory: inboundHistory,
      ReplyToId: ctx.parentId,
      RootMessageId: ctx.rootId,
      RawBody: ctx.content,
      CommandBody: ctx.content,
      From: feishuFrom,
      To: feishuTo,
      SessionKey: agentSessionKey,
      AccountId: agentAccountId,
      ChatType: isGroup ? "group" : "direct",
      GroupSubject: isGroup ? ctx.chatId : void 0,
      SenderName: ctx.senderName ?? ctx.senderOpenId,
      SenderId: ctx.senderOpenId,
      Provider: "feishu",
      Surface: "feishu",
      MessageSid: ctx.messageId,
      ReplyToBody: quotedContent ?? void 0,
      Timestamp: Date.now(),
      WasMentioned: wasMentioned,
      CommandAuthorized: commandAuthorized,
      OriginatingChannel: "feishu",
      OriginatingTo: feishuTo,
      GroupSystemPrompt: isGroup ? groupConfig?.systemPrompt?.trim() || void 0 : void 0,
      ...mediaPayload
    });
    const messageCreateTimeMs = event.message.create_time ? parseInt(event.message.create_time, 10) : void 0;
    const isTopicSession = isGroup && (groupSession?.groupSessionScope === "group_topic" || groupSession?.groupSessionScope === "group_topic_sender");
    const configReplyInThread = isGroup && (groupConfig?.replyInThread ?? feishuCfg?.replyInThread ?? "disabled") === "enabled";
    const replyTargetMessageId = isTopicSession || configReplyInThread ? ctx.rootId ?? ctx.messageId : ctx.messageId;
    const threadReply = isGroup ? groupSession?.threadReply ?? false : false;
    if (broadcastAgents) {
      if (!await tryRecordMessagePersistent(ctx.messageId, "broadcast", log)) {
        log(
          `feishu[${account.accountId}]: broadcast already claimed by another account for message ${ctx.messageId}; skipping`
        );
        return;
      }
      const strategy = cfg.broadcast?.strategy || "parallel";
      const activeAgentId = ctx.mentionedBot || !requireMention ? (0, import_feishu8.normalizeAgentId)(route.agentId) : null;
      const agentIds = (cfg.agents?.list ?? []).map((a) => (0, import_feishu8.normalizeAgentId)(a.id));
      const hasKnownAgents = agentIds.length > 0;
      log(
        `feishu[${account.accountId}]: broadcasting to ${broadcastAgents.length} agents (strategy=${strategy}, active=${activeAgentId ?? "none"})`
      );
      const dispatchForAgent = async (agentId) => {
        if (hasKnownAgents && !agentIds.includes((0, import_feishu8.normalizeAgentId)(agentId))) {
          log(
            `feishu[${account.accountId}]: broadcast agent ${agentId} not found in agents.list; skipping`
          );
          return;
        }
        const agentSessionKey = buildBroadcastSessionKey(route.sessionKey, route.agentId, agentId);
        const agentCtx = buildCtxPayloadForAgent(
          agentSessionKey,
          route.accountId,
          ctx.mentionedBot && agentId === activeAgentId
        );
        if (agentId === activeAgentId) {
          const { dispatcher, replyOptions, markDispatchIdle } = createFeishuReplyDispatcher({
            cfg,
            agentId,
            runtime,
            chatId: ctx.chatId,
            replyToMessageId: replyTargetMessageId,
            skipReplyToInMessages: !isGroup,
            replyInThread,
            rootId: ctx.rootId,
            threadReply,
            mentionTargets: ctx.mentionTargets,
            accountId: account.accountId,
            messageCreateTimeMs
          });
          log(
            `feishu[${account.accountId}]: broadcast active dispatch agent=${agentId} (session=${agentSessionKey})`
          );
          await core.channel.reply.withReplyDispatcher({
            dispatcher,
            onSettled: () => markDispatchIdle(),
            run: () => core.channel.reply.dispatchReplyFromConfig({
              ctx: agentCtx,
              cfg,
              dispatcher,
              replyOptions
            })
          });
        } else {
          delete agentCtx.CommandAuthorized;
          const noopDispatcher = {
            sendToolResult: () => false,
            sendBlockReply: () => false,
            sendFinalReply: () => false,
            waitForIdle: async () => {
            },
            getQueuedCounts: () => ({ tool: 0, block: 0, final: 0 }),
            markComplete: () => {
            }
          };
          log(
            `feishu[${account.accountId}]: broadcast observer dispatch agent=${agentId} (session=${agentSessionKey})`
          );
          await core.channel.reply.withReplyDispatcher({
            dispatcher: noopDispatcher,
            run: () => core.channel.reply.dispatchReplyFromConfig({
              ctx: agentCtx,
              cfg,
              dispatcher: noopDispatcher
            })
          });
        }
      };
      if (strategy === "sequential") {
        for (const agentId of broadcastAgents) {
          try {
            await dispatchForAgent(agentId);
          } catch (err) {
            log(
              `feishu[${account.accountId}]: broadcast dispatch failed for agent=${agentId}: ${String(err)}`
            );
          }
        }
      } else {
        const results = await Promise.allSettled(broadcastAgents.map(dispatchForAgent));
        for (let i = 0; i < results.length; i++) {
          if (results[i].status === "rejected") {
            log(
              `feishu[${account.accountId}]: broadcast dispatch failed for agent=${broadcastAgents[i]}: ${String(results[i].reason)}`
            );
          }
        }
      }
      if (isGroup && historyKey && chatHistories) {
        (0, import_feishu8.clearHistoryEntriesIfEnabled)({
          historyMap: chatHistories,
          historyKey,
          limit: historyLimit
        });
      }
      log(
        `feishu[${account.accountId}]: broadcast dispatch complete for ${broadcastAgents.length} agents`
      );
    } else {
      const ctxPayload = buildCtxPayloadForAgent(
        route.sessionKey,
        route.accountId,
        ctx.mentionedBot
      );
      const { dispatcher, replyOptions, markDispatchIdle } = createFeishuReplyDispatcher({
        cfg,
        agentId: route.agentId,
        runtime,
        chatId: ctx.chatId,
        replyToMessageId: replyTargetMessageId,
        skipReplyToInMessages: !isGroup,
        replyInThread,
        rootId: ctx.rootId,
        threadReply,
        mentionTargets: ctx.mentionTargets,
        accountId: account.accountId,
        messageCreateTimeMs
      });
      log(`feishu[${account.accountId}]: dispatching to agent (session=${route.sessionKey})`);
      const { queuedFinal, counts } = await core.channel.reply.withReplyDispatcher({
        dispatcher,
        onSettled: () => {
          markDispatchIdle();
        },
        run: () => core.channel.reply.dispatchReplyFromConfig({
          ctx: ctxPayload,
          cfg,
          dispatcher,
          replyOptions
        })
      });
      if (isGroup && historyKey && chatHistories) {
        (0, import_feishu8.clearHistoryEntriesIfEnabled)({
          historyMap: chatHistories,
          historyKey,
          limit: historyLimit
        });
      }
      log(
        `feishu[${account.accountId}]: dispatch complete (queuedFinal=${queuedFinal}, replies=${counts.final})`
      );
    }
  } catch (err) {
    error(`feishu[${account.accountId}]: failed to dispatch message: ${String(err)}`);
  }
}
var import_feishu8, IGNORED_PERMISSION_SCOPE_TOKENS, FEISHU_SCOPE_CORRECTIONS, SENDER_NAME_TTL_MS, senderNameCache, permissionErrorNotifiedAt, PERMISSION_ERROR_COOLDOWN_MS;
var init_bot = __esm({
  "src/core/extensions/feishu/src/bot.ts"() {
    "use strict";
    import_feishu8 = require("src/core/source/plugin-sdk/feishu");
    init_accounts();
    init_client();
    init_dedup();
    init_dynamic_agent();
    init_external_keys();
    init_media();
    init_mention();
    init_policy();
    init_post();
    init_reply_dispatcher();
    init_runtime();
    init_send();
    IGNORED_PERMISSION_SCOPE_TOKENS = ["contact:contact.base:readonly"];
    FEISHU_SCOPE_CORRECTIONS = {
      "contact:contact.base:readonly": "contact:user.base:readonly"
    };
    SENDER_NAME_TTL_MS = 10 * 60 * 1e3;
    senderNameCache = /* @__PURE__ */ new Map();
    permissionErrorNotifiedAt = /* @__PURE__ */ new Map();
    PERMISSION_ERROR_COOLDOWN_MS = 5 * 60 * 1e3;
  }
});

// src/core/extensions/feishu/src/card-action.ts
async function handleFeishuCardAction(params) {
  const { cfg, event, runtime, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  const log = runtime?.log ?? console.log;
  const actionValue = event.action.value;
  let content = "";
  if (typeof actionValue === "object" && actionValue !== null) {
    if ("text" in actionValue && typeof actionValue.text === "string") {
      content = actionValue.text;
    } else if ("command" in actionValue && typeof actionValue.command === "string") {
      content = actionValue.command;
    } else {
      content = JSON.stringify(actionValue);
    }
  } else {
    content = String(actionValue);
  }
  const messageEvent = {
    sender: {
      sender_id: {
        open_id: event.operator.open_id,
        user_id: event.operator.user_id,
        union_id: event.operator.union_id
      }
    },
    message: {
      message_id: `card-action-${event.token}`,
      chat_id: event.context.chat_id || event.operator.open_id,
      chat_type: event.context.chat_id ? "group" : "p2p",
      message_type: "text",
      content: JSON.stringify({ text: content })
    }
  };
  log(
    `feishu[${account.accountId}]: handling card action from ${event.operator.open_id}: ${content}`
  );
  await handleFeishuMessage({
    cfg,
    event: messageEvent,
    botOpenId: params.botOpenId,
    runtime,
    accountId
  });
}
var init_card_action = __esm({
  "src/core/extensions/feishu/src/card-action.ts"() {
    "use strict";
    init_accounts();
    init_bot();
  }
});

// src/core/extensions/feishu/src/monitor.startup.ts
function isTimeoutErrorMessage(message) {
  return message?.toLowerCase().includes("timeout") || message?.toLowerCase().includes("timed out") ? true : false;
}
function isAbortErrorMessage(message) {
  return message?.toLowerCase().includes("aborted") ?? false;
}
async function fetchBotIdentityForMonitor(account, options = {}) {
  if (options.abortSignal?.aborted) {
    return {};
  }
  const timeoutMs = options.timeoutMs ?? FEISHU_STARTUP_BOT_INFO_TIMEOUT_MS;
  const result = await probeFeishu(account, {
    timeoutMs,
    abortSignal: options.abortSignal
  });
  if (result.ok) {
    return { botOpenId: result.botOpenId, botName: result.botName };
  }
  if (options.abortSignal?.aborted || isAbortErrorMessage(result.error)) {
    return {};
  }
  if (isTimeoutErrorMessage(result.error)) {
    const error = options.runtime?.error ?? console.error;
    error(
      `feishu[${account.accountId}]: bot info probe timed out after ${timeoutMs}ms; continuing startup`
    );
  }
  return {};
}
var FEISHU_STARTUP_BOT_INFO_TIMEOUT_MS;
var init_monitor_startup = __esm({
  "src/core/extensions/feishu/src/monitor.startup.ts"() {
    "use strict";
    init_probe();
    FEISHU_STARTUP_BOT_INFO_TIMEOUT_MS = 1e4;
  }
});

// src/core/extensions/feishu/src/monitor.state.ts
function coercePositiveInt(value, fallback) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : fallback;
}
function resolveFeishuWebhookRateLimitDefaultsForTest(defaults) {
  const resolved = defaults;
  return {
    windowMs: coercePositiveInt(
      resolved?.windowMs,
      FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.windowMs
    ),
    maxRequests: coercePositiveInt(
      resolved?.maxRequests,
      FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.maxRequests
    ),
    maxTrackedKeys: coercePositiveInt(
      resolved?.maxTrackedKeys,
      FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS.maxTrackedKeys
    )
  };
}
function resolveFeishuWebhookAnomalyDefaultsForTest(defaults) {
  const resolved = defaults;
  return {
    maxTrackedKeys: coercePositiveInt(
      resolved?.maxTrackedKeys,
      FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.maxTrackedKeys
    ),
    ttlMs: coercePositiveInt(resolved?.ttlMs, FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.ttlMs),
    logEvery: coercePositiveInt(
      resolved?.logEvery,
      FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS.logEvery
    )
  };
}
function clearFeishuWebhookRateLimitStateForTest() {
  feishuWebhookRateLimiter.clear();
  feishuWebhookAnomalyTracker.clear();
}
function getFeishuWebhookRateLimitStateSizeForTest() {
  return feishuWebhookRateLimiter.size();
}
function isWebhookRateLimitedForTest(key, nowMs) {
  return feishuWebhookRateLimiter.isRateLimited(key, nowMs);
}
function recordWebhookStatus(runtime, accountId, path5, statusCode) {
  feishuWebhookAnomalyTracker.record({
    key: `${accountId}:${path5}:${statusCode}`,
    statusCode,
    log: runtime?.log ?? console.log,
    message: (count) => `feishu[${accountId}]: webhook anomaly path=${path5} status=${statusCode} count=${count}`
  });
}
function stopFeishuMonitorState(accountId) {
  if (accountId) {
    wsClients.delete(accountId);
    const server = httpServers.get(accountId);
    if (server) {
      server.close();
      httpServers.delete(accountId);
    }
    botOpenIds.delete(accountId);
    botNames.delete(accountId);
    return;
  }
  wsClients.clear();
  for (const server of httpServers.values()) {
    server.close();
  }
  httpServers.clear();
  botOpenIds.clear();
  botNames.clear();
}
var import_feishu9, wsClients, httpServers, botOpenIds, botNames, FEISHU_WEBHOOK_MAX_BODY_BYTES, FEISHU_WEBHOOK_BODY_TIMEOUT_MS, FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS, FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS, feishuWebhookRateLimitDefaults, feishuWebhookAnomalyDefaults, feishuWebhookRateLimiter, feishuWebhookAnomalyTracker;
var init_monitor_state = __esm({
  "src/core/extensions/feishu/src/monitor.state.ts"() {
    "use strict";
    import_feishu9 = require("src/core/source/plugin-sdk/feishu");
    wsClients = /* @__PURE__ */ new Map();
    httpServers = /* @__PURE__ */ new Map();
    botOpenIds = /* @__PURE__ */ new Map();
    botNames = /* @__PURE__ */ new Map();
    FEISHU_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;
    FEISHU_WEBHOOK_BODY_TIMEOUT_MS = 3e4;
    FEISHU_WEBHOOK_RATE_LIMIT_FALLBACK_DEFAULTS = {
      windowMs: 6e4,
      maxRequests: 120,
      maxTrackedKeys: 4096
    };
    FEISHU_WEBHOOK_ANOMALY_FALLBACK_DEFAULTS = {
      maxTrackedKeys: 4096,
      ttlMs: 6 * 60 * 6e4,
      logEvery: 25
    };
    feishuWebhookRateLimitDefaults = resolveFeishuWebhookRateLimitDefaultsForTest(
      import_feishu9.WEBHOOK_RATE_LIMIT_DEFAULTS
    );
    feishuWebhookAnomalyDefaults = resolveFeishuWebhookAnomalyDefaultsForTest(
      import_feishu9.WEBHOOK_ANOMALY_COUNTER_DEFAULTS
    );
    feishuWebhookRateLimiter = (0, import_feishu9.createFixedWindowRateLimiter)({
      windowMs: feishuWebhookRateLimitDefaults.windowMs,
      maxRequests: feishuWebhookRateLimitDefaults.maxRequests,
      maxTrackedKeys: feishuWebhookRateLimitDefaults.maxTrackedKeys
    });
    feishuWebhookAnomalyTracker = (0, import_feishu9.createWebhookAnomalyTracker)({
      maxTrackedKeys: feishuWebhookAnomalyDefaults.maxTrackedKeys,
      ttlMs: feishuWebhookAnomalyDefaults.ttlMs,
      logEvery: feishuWebhookAnomalyDefaults.logEvery
    });
  }
});

// src/core/extensions/feishu/src/monitor.transport.ts
function isFeishuWebhookPayload(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function buildFeishuWebhookEnvelope(req, payload) {
  return Object.assign(/* @__PURE__ */ Object.create({ headers: req.headers }), payload);
}
function isFeishuWebhookSignatureValid(params) {
  const encryptKey = params.encryptKey?.trim();
  if (!encryptKey) {
    return true;
  }
  const timestampHeader = params.headers["x-lark-request-timestamp"];
  const nonceHeader = params.headers["x-lark-request-nonce"];
  const signatureHeader = params.headers["x-lark-signature"];
  const timestamp = Array.isArray(timestampHeader) ? timestampHeader[0] : timestampHeader;
  const nonce = Array.isArray(nonceHeader) ? nonceHeader[0] : nonceHeader;
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!timestamp || !nonce || !signature) {
    return false;
  }
  const computedSignature = import_node_crypto.default.createHash("sha256").update(timestamp + nonce + encryptKey + JSON.stringify(params.payload)).digest("hex");
  return computedSignature === signature;
}
function respondText(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);
}
async function monitorWebSocket({
  account,
  accountId,
  runtime,
  abortSignal,
  eventDispatcher
}) {
  const log = runtime?.log ?? console.log;
  log(`feishu[${accountId}]: starting WebSocket connection...`);
  const wsClient = createFeishuWSClient(account);
  wsClients.set(accountId, wsClient);
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      wsClients.delete(accountId);
      botOpenIds.delete(accountId);
      botNames.delete(accountId);
    };
    const handleAbort = () => {
      log(`feishu[${accountId}]: abort signal received, stopping`);
      cleanup();
      resolve();
    };
    if (abortSignal?.aborted) {
      cleanup();
      resolve();
      return;
    }
    abortSignal?.addEventListener("abort", handleAbort, { once: true });
    try {
      wsClient.start({ eventDispatcher });
      log(`feishu[${accountId}]: WebSocket client started`);
    } catch (err) {
      cleanup();
      abortSignal?.removeEventListener("abort", handleAbort);
      reject(err);
    }
  });
}
async function monitorWebhook({
  account,
  accountId,
  runtime,
  abortSignal,
  eventDispatcher
}) {
  const log = runtime?.log ?? console.log;
  const error = runtime?.error ?? console.error;
  const port = account.config.webhookPort ?? 3e3;
  const path5 = account.config.webhookPath ?? "/feishu/events";
  const host = account.config.webhookHost ?? "127.0.0.1";
  log(`feishu[${accountId}]: starting Webhook server on ${host}:${port}, path ${path5}...`);
  const server = http.createServer();
  server.on("request", (req, res) => {
    res.on("finish", () => {
      recordWebhookStatus(runtime, accountId, path5, res.statusCode);
    });
    const rateLimitKey = `${accountId}:${path5}:${req.socket.remoteAddress ?? "unknown"}`;
    if (!(0, import_feishu10.applyBasicWebhookRequestGuards)({
      req,
      res,
      rateLimiter: feishuWebhookRateLimiter,
      rateLimitKey,
      nowMs: Date.now(),
      requireJsonContentType: true
    })) {
      return;
    }
    const guard = (0, import_feishu10.installRequestBodyLimitGuard)(req, res, {
      maxBytes: FEISHU_WEBHOOK_MAX_BODY_BYTES,
      timeoutMs: FEISHU_WEBHOOK_BODY_TIMEOUT_MS,
      responseFormat: "text"
    });
    if (guard.isTripped()) {
      return;
    }
    void (async () => {
      try {
        const bodyResult = await (0, import_feishu10.readJsonBodyWithLimit)(req, {
          maxBytes: FEISHU_WEBHOOK_MAX_BODY_BYTES,
          timeoutMs: FEISHU_WEBHOOK_BODY_TIMEOUT_MS
        });
        if (guard.isTripped() || res.writableEnded) {
          return;
        }
        if (!bodyResult.ok) {
          if (bodyResult.code === "INVALID_JSON") {
            respondText(res, 400, "Invalid JSON");
          }
          return;
        }
        if (!isFeishuWebhookPayload(bodyResult.value)) {
          respondText(res, 400, "Invalid JSON");
          return;
        }
        if (!isFeishuWebhookSignatureValid({
          headers: req.headers,
          payload: bodyResult.value,
          encryptKey: account.encryptKey
        })) {
          respondText(res, 401, "Invalid signature");
          return;
        }
        const { isChallenge, challenge } = Lark2.generateChallenge(bodyResult.value, {
          encryptKey: account.encryptKey ?? ""
        });
        if (isChallenge) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(challenge));
          return;
        }
        const value = await eventDispatcher.invoke(
          buildFeishuWebhookEnvelope(req, bodyResult.value),
          { needCheck: false }
        );
        if (!res.headersSent) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(value));
        }
      } catch (err) {
        if (!guard.isTripped()) {
          error(`feishu[${accountId}]: webhook handler error: ${String(err)}`);
          if (!res.headersSent) {
            respondText(res, 500, "Internal Server Error");
          }
        }
      } finally {
        guard.dispose();
      }
    })();
  });
  httpServers.set(accountId, server);
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      server.close();
      httpServers.delete(accountId);
      botOpenIds.delete(accountId);
      botNames.delete(accountId);
    };
    const handleAbort = () => {
      log(`feishu[${accountId}]: abort signal received, stopping Webhook server`);
      cleanup();
      resolve();
    };
    if (abortSignal?.aborted) {
      cleanup();
      resolve();
      return;
    }
    abortSignal?.addEventListener("abort", handleAbort, { once: true });
    server.listen(port, host, () => {
      log(`feishu[${accountId}]: Webhook server listening on ${host}:${port}`);
    });
    server.on("error", (err) => {
      error(`feishu[${accountId}]: Webhook server error: ${err}`);
      abortSignal?.removeEventListener("abort", handleAbort);
      reject(err);
    });
  });
}
var http, import_node_crypto, Lark2, import_feishu10;
var init_monitor_transport = __esm({
  "src/core/extensions/feishu/src/monitor.transport.ts"() {
    "use strict";
    http = __toESM(require("http"), 1);
    import_node_crypto = __toESM(require("node:crypto"), 1);
    Lark2 = __toESM(require("@larksuiteoapi/node-sdk"), 1);
    import_feishu10 = require("src/core/source/plugin-sdk/feishu");
    init_client();
    init_monitor_state();
  }
});

// src/core/extensions/feishu/src/monitor.account.ts
async function resolveReactionSyntheticEvent(params) {
  const {
    cfg,
    accountId,
    event,
    botOpenId,
    fetchMessage = getMessageFeishu,
    verificationTimeoutMs = FEISHU_REACTION_VERIFY_TIMEOUT_MS,
    logger,
    uuid = () => crypto2.randomUUID()
  } = params;
  const emoji = event.reaction_type?.emoji_type;
  const messageId = event.message_id;
  const senderId = event.user_id?.open_id;
  if (!emoji || !messageId || !senderId) {
    return null;
  }
  const account = resolveFeishuAccount({ cfg, accountId });
  const reactionNotifications = account.config.reactionNotifications ?? "own";
  if (reactionNotifications === "off") {
    return null;
  }
  if (event.operator_type === "app" || senderId === botOpenId) {
    return null;
  }
  if (emoji === "Typing") {
    return null;
  }
  if (reactionNotifications === "own" && !botOpenId) {
    logger?.(
      `feishu[${accountId}]: bot open_id unavailable, skipping reaction ${emoji} on ${messageId}`
    );
    return null;
  }
  const reactedMsg = await raceWithTimeoutAndAbort(fetchMessage({ cfg, messageId, accountId }), {
    timeoutMs: verificationTimeoutMs
  }).then((result) => result.status === "resolved" ? result.value : null).catch(() => null);
  const isBotMessage = reactedMsg?.senderType === "app" || reactedMsg?.senderOpenId === botOpenId;
  if (!reactedMsg || reactionNotifications === "own" && !isBotMessage) {
    logger?.(
      `feishu[${accountId}]: ignoring reaction on non-bot/unverified message ${messageId} (sender: ${reactedMsg?.senderOpenId ?? "unknown"})`
    );
    return null;
  }
  const fallbackChatType = reactedMsg.chatType;
  const normalizedEventChatType = normalizeFeishuChatType(event.chat_type);
  const resolvedChatType = normalizedEventChatType ?? fallbackChatType;
  if (!resolvedChatType) {
    logger?.(
      `feishu[${accountId}]: skipping reaction ${emoji} on ${messageId} without chat type context`
    );
    return null;
  }
  const syntheticChatIdRaw = event.chat_id ?? reactedMsg.chatId;
  const syntheticChatId = syntheticChatIdRaw?.trim() ? syntheticChatIdRaw : `p2p:${senderId}`;
  const syntheticChatType = resolvedChatType;
  return {
    sender: {
      sender_id: { open_id: senderId },
      sender_type: "user"
    },
    message: {
      message_id: `${messageId}:reaction:${emoji}:${uuid()}`,
      chat_id: syntheticChatId,
      chat_type: syntheticChatType,
      message_type: "text",
      content: JSON.stringify({
        text: `[reacted with ${emoji} to message ${messageId}]`
      })
    }
  };
}
function normalizeFeishuChatType(value) {
  return value === "group" || value === "private" || value === "p2p" ? value : void 0;
}
function createChatQueue() {
  const queues = /* @__PURE__ */ new Map();
  return (chatId, task) => {
    const prev = queues.get(chatId) ?? Promise.resolve();
    const next = prev.then(task, task);
    queues.set(chatId, next);
    void next.finally(() => {
      if (queues.get(chatId) === next) {
        queues.delete(chatId);
      }
    });
    return next;
  };
}
function mergeFeishuDebounceMentions(entries) {
  const merged = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    for (const mention of entry.message.mentions ?? []) {
      const stableId = mention.id.open_id?.trim() || mention.id.user_id?.trim() || mention.id.union_id?.trim();
      const mentionName = mention.name?.trim();
      const mentionKey = mention.key?.trim();
      const fallback = mentionName && mentionKey ? `${mentionName}|${mentionKey}` : mentionName || mentionKey;
      const key = stableId || fallback;
      if (!key || merged.has(key)) {
        continue;
      }
      merged.set(key, mention);
    }
  }
  if (merged.size === 0) {
    return void 0;
  }
  return Array.from(merged.values());
}
function dedupeFeishuDebounceEntriesByMessageId(entries) {
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const entry of entries) {
    const messageId = entry.message.message_id?.trim();
    if (!messageId) {
      deduped.push(entry);
      continue;
    }
    if (seen.has(messageId)) {
      continue;
    }
    seen.add(messageId);
    deduped.push(entry);
  }
  return deduped;
}
function resolveFeishuDebounceMentions(params) {
  const { entries, botOpenId } = params;
  if (entries.length === 0) {
    return void 0;
  }
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (isMentionForwardRequest(entry, botOpenId)) {
      return mergeFeishuDebounceMentions([entry]);
    }
  }
  const merged = mergeFeishuDebounceMentions(entries);
  if (!merged) {
    return void 0;
  }
  const normalizedBotOpenId = botOpenId?.trim();
  if (!normalizedBotOpenId) {
    return void 0;
  }
  const botMentions = merged.filter(
    (mention) => mention.id.open_id?.trim() === normalizedBotOpenId
  );
  return botMentions.length > 0 ? botMentions : void 0;
}
function registerEventHandlers(eventDispatcher, context) {
  const { cfg, accountId, runtime, chatHistories, fireAndForget } = context;
  const core = getFeishuRuntime();
  const inboundDebounceMs = core.channel.debounce.resolveInboundDebounceMs({
    cfg,
    channel: "feishu"
  });
  const log = runtime?.log ?? console.log;
  const error = runtime?.error ?? console.error;
  const enqueue = createChatQueue();
  const dispatchFeishuMessage = async (event) => {
    const chatId = event.message.chat_id?.trim() || "unknown";
    const task = () => handleFeishuMessage({
      cfg,
      event,
      botOpenId: botOpenIds.get(accountId),
      botName: botNames.get(accountId),
      runtime,
      chatHistories,
      accountId
    });
    await enqueue(chatId, task);
  };
  const resolveSenderDebounceId = (event) => {
    const senderId = event.sender.sender_id.open_id?.trim() || event.sender.sender_id.user_id?.trim();
    return senderId || void 0;
  };
  const resolveDebounceText = (event) => {
    const botOpenId = botOpenIds.get(accountId);
    const parsed = parseFeishuMessageEvent(event, botOpenId, botNames.get(accountId));
    return parsed.content.trim();
  };
  const recordSuppressedMessageIds = async (entries, dispatchMessageId) => {
    const keepMessageId = dispatchMessageId?.trim();
    const suppressedIds = new Set(
      entries.map((entry) => entry.message.message_id?.trim()).filter((id) => Boolean(id) && (!keepMessageId || id !== keepMessageId))
    );
    if (suppressedIds.size === 0) {
      return;
    }
    for (const messageId of suppressedIds) {
      tryRecordMessage(`${accountId}:${messageId}`);
      try {
        await tryRecordMessagePersistent(messageId, accountId, log);
      } catch (err) {
        error(
          `feishu[${accountId}]: failed to record merged dedupe id ${messageId}: ${String(err)}`
        );
      }
    }
  };
  const isMessageAlreadyProcessed = async (entry) => {
    const messageId = entry.message.message_id?.trim();
    if (!messageId) {
      return false;
    }
    const memoryKey = `${accountId}:${messageId}`;
    if (hasRecordedMessage(memoryKey)) {
      return true;
    }
    return hasRecordedMessagePersistent(messageId, accountId, log);
  };
  const inboundDebouncer = core.channel.debounce.createInboundDebouncer({
    debounceMs: inboundDebounceMs,
    buildKey: (event) => {
      const chatId = event.message.chat_id?.trim();
      const senderId = resolveSenderDebounceId(event);
      if (!chatId || !senderId) {
        return null;
      }
      const rootId = event.message.root_id?.trim();
      const threadKey = rootId ? `thread:${rootId}` : "chat";
      return `feishu:${accountId}:${chatId}:${threadKey}:${senderId}`;
    },
    shouldDebounce: (event) => {
      if (event.message.message_type !== "text") {
        return false;
      }
      const text = resolveDebounceText(event);
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
        await dispatchFeishuMessage(last);
        return;
      }
      const dedupedEntries = dedupeFeishuDebounceEntriesByMessageId(entries);
      const freshEntries = [];
      for (const entry of dedupedEntries) {
        if (!await isMessageAlreadyProcessed(entry)) {
          freshEntries.push(entry);
        }
      }
      const dispatchEntry = freshEntries.at(-1);
      if (!dispatchEntry) {
        return;
      }
      await recordSuppressedMessageIds(dedupedEntries, dispatchEntry.message.message_id);
      const combinedText = freshEntries.map((entry) => resolveDebounceText(entry)).filter(Boolean).join("\n");
      const mergedMentions = resolveFeishuDebounceMentions({
        entries: freshEntries,
        botOpenId: botOpenIds.get(accountId)
      });
      if (!combinedText.trim()) {
        await dispatchFeishuMessage({
          ...dispatchEntry,
          message: {
            ...dispatchEntry.message,
            mentions: mergedMentions ?? dispatchEntry.message.mentions
          }
        });
        return;
      }
      await dispatchFeishuMessage({
        ...dispatchEntry,
        message: {
          ...dispatchEntry.message,
          message_type: "text",
          content: JSON.stringify({ text: combinedText }),
          mentions: mergedMentions ?? dispatchEntry.message.mentions
        }
      });
    },
    onError: (err) => {
      error(`feishu[${accountId}]: inbound debounce flush failed: ${String(err)}`);
    }
  });
  eventDispatcher.register({
    "im.message.receive_v1": async (data) => {
      const processMessage = async () => {
        const event = data;
        await inboundDebouncer.enqueue(event);
      };
      if (fireAndForget) {
        void processMessage().catch((err) => {
          error(`feishu[${accountId}]: error handling message: ${String(err)}`);
        });
        return;
      }
      try {
        await processMessage();
      } catch (err) {
        error(`feishu[${accountId}]: error handling message: ${String(err)}`);
      }
    },
    "im.message.message_read_v1": async () => {
    },
    "im.chat.member.bot.added_v1": async (data) => {
      try {
        const event = data;
        log(`feishu[${accountId}]: bot added to chat ${event.chat_id}`);
      } catch (err) {
        error(`feishu[${accountId}]: error handling bot added event: ${String(err)}`);
      }
    },
    "im.chat.member.bot.deleted_v1": async (data) => {
      try {
        const event = data;
        log(`feishu[${accountId}]: bot removed from chat ${event.chat_id}`);
      } catch (err) {
        error(`feishu[${accountId}]: error handling bot removed event: ${String(err)}`);
      }
    },
    "im.message.reaction.created_v1": async (data) => {
      const processReaction = async () => {
        const event = data;
        const myBotId = botOpenIds.get(accountId);
        const syntheticEvent = await resolveReactionSyntheticEvent({
          cfg,
          accountId,
          event,
          botOpenId: myBotId,
          logger: log
        });
        if (!syntheticEvent) {
          return;
        }
        const promise = handleFeishuMessage({
          cfg,
          event: syntheticEvent,
          botOpenId: myBotId,
          botName: botNames.get(accountId),
          runtime,
          chatHistories,
          accountId
        });
        if (fireAndForget) {
          promise.catch((err) => {
            error(`feishu[${accountId}]: error handling reaction: ${String(err)}`);
          });
          return;
        }
        await promise;
      };
      if (fireAndForget) {
        void processReaction().catch((err) => {
          error(`feishu[${accountId}]: error handling reaction event: ${String(err)}`);
        });
        return;
      }
      try {
        await processReaction();
      } catch (err) {
        error(`feishu[${accountId}]: error handling reaction event: ${String(err)}`);
      }
    },
    "im.message.reaction.deleted_v1": async () => {
    },
    "card.action.trigger": async (data) => {
      try {
        const event = data;
        const promise = handleFeishuCardAction({
          cfg,
          event,
          botOpenId: botOpenIds.get(accountId),
          runtime,
          accountId
        });
        if (fireAndForget) {
          promise.catch((err) => {
            error(`feishu[${accountId}]: error handling card action: ${String(err)}`);
          });
        } else {
          await promise;
        }
      } catch (err) {
        error(`feishu[${accountId}]: error handling card action: ${String(err)}`);
      }
    }
  });
}
async function monitorSingleAccount(params) {
  const { cfg, account, runtime, abortSignal } = params;
  const { accountId } = account;
  const log = runtime?.log ?? console.log;
  const botOpenIdSource = params.botOpenIdSource ?? { kind: "fetch" };
  const botIdentity = botOpenIdSource.kind === "prefetched" ? { botOpenId: botOpenIdSource.botOpenId, botName: botOpenIdSource.botName } : await fetchBotIdentityForMonitor(account, { runtime, abortSignal });
  const botOpenId = botIdentity.botOpenId;
  const botName = botIdentity.botName?.trim();
  botOpenIds.set(accountId, botOpenId ?? "");
  if (botName) {
    botNames.set(accountId, botName);
  } else {
    botNames.delete(accountId);
  }
  log(`feishu[${accountId}]: bot open_id resolved: ${botOpenId ?? "unknown"}`);
  const connectionMode = account.config.connectionMode ?? "websocket";
  if (connectionMode === "webhook" && !account.verificationToken?.trim()) {
    throw new Error(`Feishu account "${accountId}" webhook mode requires verificationToken`);
  }
  if (connectionMode === "webhook" && !account.encryptKey?.trim()) {
    throw new Error(`Feishu account "${accountId}" webhook mode requires encryptKey`);
  }
  const warmupCount = await warmupDedupFromDisk(accountId, log);
  if (warmupCount > 0) {
    log(`feishu[${accountId}]: dedup warmup loaded ${warmupCount} entries from disk`);
  }
  const eventDispatcher = createEventDispatcher(account);
  const chatHistories = /* @__PURE__ */ new Map();
  registerEventHandlers(eventDispatcher, {
    cfg,
    accountId,
    runtime,
    chatHistories,
    fireAndForget: true
  });
  if (connectionMode === "webhook") {
    return monitorWebhook({ account, accountId, runtime, abortSignal, eventDispatcher });
  }
  return monitorWebSocket({ account, accountId, runtime, abortSignal, eventDispatcher });
}
var crypto2, FEISHU_REACTION_VERIFY_TIMEOUT_MS;
var init_monitor_account = __esm({
  "src/core/extensions/feishu/src/monitor.account.ts"() {
    "use strict";
    crypto2 = __toESM(require("crypto"), 1);
    init_accounts();
    init_async();
    init_bot();
    init_card_action();
    init_client();
    init_dedup();
    init_mention();
    init_monitor_startup();
    init_monitor_state();
    init_monitor_transport();
    init_runtime();
    init_send();
    FEISHU_REACTION_VERIFY_TIMEOUT_MS = 1500;
  }
});

// src/core/extensions/feishu/src/monitor.ts
var monitor_exports = {};
__export(monitor_exports, {
  clearFeishuWebhookRateLimitStateForTest: () => clearFeishuWebhookRateLimitStateForTest,
  getFeishuWebhookRateLimitStateSizeForTest: () => getFeishuWebhookRateLimitStateSizeForTest,
  isWebhookRateLimitedForTest: () => isWebhookRateLimitedForTest,
  monitorFeishuProvider: () => monitorFeishuProvider,
  resolveReactionSyntheticEvent: () => resolveReactionSyntheticEvent,
  stopFeishuMonitor: () => stopFeishuMonitor
});
async function monitorFeishuProvider(opts = {}) {
  const cfg = opts.config;
  if (!cfg) {
    throw new Error("Config is required for Feishu monitor");
  }
  const log = opts.runtime?.log ?? console.log;
  if (opts.accountId) {
    const account = resolveFeishuAccount({ cfg, accountId: opts.accountId });
    if (!account.enabled || !account.configured) {
      throw new Error(`Feishu account "${opts.accountId}" not configured or disabled`);
    }
    return monitorSingleAccount({
      cfg,
      account,
      runtime: opts.runtime,
      abortSignal: opts.abortSignal
    });
  }
  const accounts = listEnabledFeishuAccounts(cfg);
  if (accounts.length === 0) {
    throw new Error("No enabled Feishu accounts configured");
  }
  log(
    `feishu: starting ${accounts.length} account(s): ${accounts.map((a) => a.accountId).join(", ")}`
  );
  const monitorPromises = [];
  for (const account of accounts) {
    if (opts.abortSignal?.aborted) {
      log("feishu: abort signal received during startup preflight; stopping startup");
      break;
    }
    const { botOpenId, botName } = await fetchBotIdentityForMonitor(account, {
      runtime: opts.runtime,
      abortSignal: opts.abortSignal
    });
    if (opts.abortSignal?.aborted) {
      log("feishu: abort signal received during startup preflight; stopping startup");
      break;
    }
    monitorPromises.push(
      monitorSingleAccount({
        cfg,
        account,
        runtime: opts.runtime,
        abortSignal: opts.abortSignal,
        botOpenIdSource: { kind: "prefetched", botOpenId, botName }
      })
    );
  }
  await Promise.all(monitorPromises);
}
function stopFeishuMonitor(accountId) {
  stopFeishuMonitorState(accountId);
}
var init_monitor = __esm({
  "src/core/extensions/feishu/src/monitor.ts"() {
    "use strict";
    init_accounts();
    init_monitor_account();
    init_monitor_startup();
    init_monitor_state();
  }
});

// src/core/extensions/feishu/index.ts
var index_exports = {};
__export(index_exports, {
  FeishuEmoji: () => FeishuEmoji,
  addReactionFeishu: () => addReactionFeishu,
  buildMentionedCardContent: () => buildMentionedCardContent,
  buildMentionedMessage: () => buildMentionedMessage,
  default: () => index_default,
  editMessageFeishu: () => editMessageFeishu,
  extractMentionTargets: () => extractMentionTargets,
  extractMessageBody: () => extractMessageBody,
  feishuPlugin: () => feishuPlugin,
  formatMentionAllForCard: () => formatMentionAllForCard,
  formatMentionAllForText: () => formatMentionAllForText,
  formatMentionForCard: () => formatMentionForCard,
  formatMentionForText: () => formatMentionForText,
  getMessageFeishu: () => getMessageFeishu,
  isMentionForwardRequest: () => isMentionForwardRequest,
  listReactionsFeishu: () => listReactionsFeishu,
  monitorFeishuProvider: () => monitorFeishuProvider,
  probeFeishu: () => probeFeishu,
  removeReactionFeishu: () => removeReactionFeishu,
  sendCardFeishu: () => sendCardFeishu,
  sendFileFeishu: () => sendFileFeishu,
  sendImageFeishu: () => sendImageFeishu,
  sendMediaFeishu: () => sendMediaFeishu,
  sendMessageFeishu: () => sendMessageFeishu,
  updateCardFeishu: () => updateCardFeishu,
  uploadFileFeishu: () => uploadFileFeishu,
  uploadImageFeishu: () => uploadImageFeishu
});
module.exports = __toCommonJS(index_exports);
var import_feishu12 = require("src/core/source/plugin-sdk/feishu");

// src/core/extensions/feishu/src/bitable.ts
var import_typebox = require("@sinclair/typebox");
init_accounts();

// src/core/extensions/feishu/src/tool-account.ts
init_accounts();
init_client();

// src/core/extensions/feishu/src/tools-config.ts
var DEFAULT_TOOLS_CONFIG = {
  doc: true,
  chat: true,
  wiki: true,
  drive: true,
  perm: false,
  scopes: true
};
function resolveToolsConfig(cfg) {
  return { ...DEFAULT_TOOLS_CONFIG, ...cfg };
}

// src/core/extensions/feishu/src/tool-account.ts
function normalizeOptionalAccountId(value) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : void 0;
}
function readConfiguredDefaultAccountId(config) {
  const value = config?.channels?.feishu?.defaultAccount;
  if (typeof value !== "string") {
    return void 0;
  }
  return normalizeOptionalAccountId(value);
}
function resolveFeishuToolAccount(params) {
  if (!params.api.config) {
    throw new Error("Feishu config unavailable");
  }
  return resolveFeishuAccount({
    cfg: params.api.config,
    accountId: normalizeOptionalAccountId(params.executeParams?.accountId) ?? readConfiguredDefaultAccountId(params.api.config) ?? normalizeOptionalAccountId(params.defaultAccountId)
  });
}
function createFeishuToolClient(params) {
  return createFeishuClient(resolveFeishuToolAccount(params));
}
function resolveAnyEnabledFeishuToolsConfig(accounts) {
  const merged = {
    doc: false,
    chat: false,
    wiki: false,
    drive: false,
    perm: false,
    scopes: false
  };
  for (const account of accounts) {
    const cfg = resolveToolsConfig(account.config.tools);
    merged.doc = merged.doc || cfg.doc;
    merged.chat = merged.chat || cfg.chat;
    merged.wiki = merged.wiki || cfg.wiki;
    merged.drive = merged.drive || cfg.drive;
    merged.perm = merged.perm || cfg.perm;
    merged.scopes = merged.scopes || cfg.scopes;
  }
  return merged;
}

// src/core/extensions/feishu/src/bitable.ts
function json(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data
  };
}
var LarkApiError = class extends Error {
  constructor(code, message, api, context) {
    super(`[${api}] code=${code} message=${message}`);
    this.name = "LarkApiError";
    this.code = code;
    this.api = api;
    this.context = context;
  }
};
function ensureLarkSuccess(res, api, context) {
  if (res.code !== 0) {
    throw new LarkApiError(res.code ?? -1, res.msg ?? "unknown error", api, context);
  }
}
var FIELD_TYPE_NAMES = {
  1: "Text",
  2: "Number",
  3: "SingleSelect",
  4: "MultiSelect",
  5: "DateTime",
  7: "Checkbox",
  11: "User",
  13: "Phone",
  15: "URL",
  17: "Attachment",
  18: "SingleLink",
  19: "Lookup",
  20: "Formula",
  21: "DuplexLink",
  22: "Location",
  23: "GroupChat",
  1001: "CreatedTime",
  1002: "ModifiedTime",
  1003: "CreatedUser",
  1004: "ModifiedUser",
  1005: "AutoNumber"
};
function parseBitableUrl(url) {
  try {
    const u = new URL(url);
    const tableId = u.searchParams.get("table") ?? void 0;
    const wikiMatch = u.pathname.match(/\/wiki\/([A-Za-z0-9]+)/);
    if (wikiMatch) {
      return { token: wikiMatch[1], tableId, isWiki: true };
    }
    const baseMatch = u.pathname.match(/\/base\/([A-Za-z0-9]+)/);
    if (baseMatch) {
      return { token: baseMatch[1], tableId, isWiki: false };
    }
    return null;
  } catch {
    return null;
  }
}
async function getAppTokenFromWiki(client, nodeToken) {
  const res = await client.wiki.space.getNode({
    params: { token: nodeToken }
  });
  ensureLarkSuccess(res, "wiki.space.getNode", { nodeToken });
  const node = res.data?.node;
  if (!node) {
    throw new Error("Node not found");
  }
  if (node.obj_type !== "bitable") {
    throw new Error(`Node is not a bitable (type: ${node.obj_type})`);
  }
  return node.obj_token;
}
async function getBitableMeta(client, url) {
  const parsed = parseBitableUrl(url);
  if (!parsed) {
    throw new Error("Invalid URL format. Expected /base/XXX or /wiki/XXX URL");
  }
  let appToken;
  if (parsed.isWiki) {
    appToken = await getAppTokenFromWiki(client, parsed.token);
  } else {
    appToken = parsed.token;
  }
  const res = await client.bitable.app.get({
    path: { app_token: appToken }
  });
  ensureLarkSuccess(res, "bitable.app.get", { appToken });
  let tables = [];
  if (!parsed.tableId) {
    const tablesRes = await client.bitable.appTable.list({
      path: { app_token: appToken }
    });
    if (tablesRes.code === 0) {
      tables = (tablesRes.data?.items ?? []).map((t) => ({
        table_id: t.table_id,
        name: t.name
      }));
    }
  }
  return {
    app_token: appToken,
    table_id: parsed.tableId,
    name: res.data?.app?.name,
    url_type: parsed.isWiki ? "wiki" : "base",
    ...tables.length > 0 && { tables },
    hint: parsed.tableId ? `Use app_token="${appToken}" and table_id="${parsed.tableId}" for other bitable tools` : `Use app_token="${appToken}" for other bitable tools. Select a table_id from the tables list.`
  };
}
async function listFields(client, appToken, tableId) {
  const res = await client.bitable.appTableField.list({
    path: { app_token: appToken, table_id: tableId }
  });
  ensureLarkSuccess(res, "bitable.appTableField.list", { appToken, tableId });
  const fields = res.data?.items ?? [];
  return {
    fields: fields.map((f) => ({
      field_id: f.field_id,
      field_name: f.field_name,
      type: f.type,
      type_name: FIELD_TYPE_NAMES[f.type ?? 0] || `type_${f.type}`,
      is_primary: f.is_primary,
      ...f.property && { property: f.property }
    })),
    total: fields.length
  };
}
async function listRecords(client, appToken, tableId, pageSize, pageToken) {
  const res = await client.bitable.appTableRecord.list({
    path: { app_token: appToken, table_id: tableId },
    params: {
      page_size: pageSize ?? 100,
      ...pageToken && { page_token: pageToken }
    }
  });
  ensureLarkSuccess(res, "bitable.appTableRecord.list", { appToken, tableId, pageSize });
  return {
    records: res.data?.items ?? [],
    has_more: res.data?.has_more ?? false,
    page_token: res.data?.page_token,
    total: res.data?.total
  };
}
async function getRecord(client, appToken, tableId, recordId) {
  const res = await client.bitable.appTableRecord.get({
    path: { app_token: appToken, table_id: tableId, record_id: recordId }
  });
  ensureLarkSuccess(res, "bitable.appTableRecord.get", { appToken, tableId, recordId });
  return {
    record: res.data?.record
  };
}
async function createRecord(client, appToken, tableId, fields) {
  const res = await client.bitable.appTableRecord.create({
    path: { app_token: appToken, table_id: tableId },
    // oxlint-disable-next-line typescript/no-explicit-any
    data: { fields }
  });
  ensureLarkSuccess(res, "bitable.appTableRecord.create", { appToken, tableId });
  return {
    record: res.data?.record
  };
}
var DEFAULT_CLEANUP_FIELD_TYPES = /* @__PURE__ */ new Set([3, 5, 17]);
async function cleanupNewBitable(client, appToken, tableId, tableName, logger) {
  let cleanedRows = 0;
  let cleanedFields = 0;
  const fieldsRes = await client.bitable.appTableField.list({
    path: { app_token: appToken, table_id: tableId }
  });
  if (fieldsRes.code === 0 && fieldsRes.data?.items) {
    const primaryField = fieldsRes.data.items.find((f) => f.is_primary);
    if (primaryField?.field_id) {
      try {
        const newFieldName = tableName.length <= 20 ? tableName : "Name";
        await client.bitable.appTableField.update({
          path: {
            app_token: appToken,
            table_id: tableId,
            field_id: primaryField.field_id
          },
          data: {
            field_name: newFieldName,
            type: 1
          }
        });
        cleanedFields++;
      } catch (err) {
        logger.debug(`Failed to rename primary field: ${err}`);
      }
    }
    const defaultFieldsToDelete = fieldsRes.data.items.filter(
      (f) => !f.is_primary && DEFAULT_CLEANUP_FIELD_TYPES.has(f.type ?? 0)
    );
    for (const field of defaultFieldsToDelete) {
      if (field.field_id) {
        try {
          await client.bitable.appTableField.delete({
            path: {
              app_token: appToken,
              table_id: tableId,
              field_id: field.field_id
            }
          });
          cleanedFields++;
        } catch (err) {
          logger.debug(`Failed to delete default field ${field.field_name}: ${err}`);
        }
      }
    }
  }
  const recordsRes = await client.bitable.appTableRecord.list({
    path: { app_token: appToken, table_id: tableId },
    params: { page_size: 100 }
  });
  if (recordsRes.code === 0 && recordsRes.data?.items) {
    const emptyRecordIds = recordsRes.data.items.filter((r) => !r.fields || Object.keys(r.fields).length === 0).map((r) => r.record_id).filter((id) => Boolean(id));
    if (emptyRecordIds.length > 0) {
      try {
        await client.bitable.appTableRecord.batchDelete({
          path: { app_token: appToken, table_id: tableId },
          data: { records: emptyRecordIds }
        });
        cleanedRows = emptyRecordIds.length;
      } catch {
        for (const recordId of emptyRecordIds) {
          try {
            await client.bitable.appTableRecord.delete({
              path: { app_token: appToken, table_id: tableId, record_id: recordId }
            });
            cleanedRows++;
          } catch (err) {
            logger.debug(`Failed to delete empty row ${recordId}: ${err}`);
          }
        }
      }
    }
  }
  return { cleanedRows, cleanedFields };
}
async function createApp(client, name, folderToken, logger) {
  const res = await client.bitable.app.create({
    data: {
      name,
      ...folderToken && { folder_token: folderToken }
    }
  });
  ensureLarkSuccess(res, "bitable.app.create", { name, folderToken });
  const appToken = res.data?.app?.app_token;
  if (!appToken) {
    throw new Error("Failed to create Bitable: no app_token returned");
  }
  const log = logger ?? { debug: () => {
  }, warn: () => {
  } };
  let tableId;
  let cleanedRows = 0;
  let cleanedFields = 0;
  try {
    const tablesRes = await client.bitable.appTable.list({
      path: { app_token: appToken }
    });
    if (tablesRes.code === 0 && tablesRes.data?.items && tablesRes.data.items.length > 0) {
      tableId = tablesRes.data.items[0].table_id ?? void 0;
      if (tableId) {
        const cleanup = await cleanupNewBitable(client, appToken, tableId, name, log);
        cleanedRows = cleanup.cleanedRows;
        cleanedFields = cleanup.cleanedFields;
      }
    }
  } catch (err) {
    log.debug(`Cleanup failed (non-critical): ${err}`);
  }
  return {
    app_token: appToken,
    table_id: tableId,
    name: res.data?.app?.name,
    url: res.data?.app?.url,
    cleaned_placeholder_rows: cleanedRows,
    cleaned_default_fields: cleanedFields,
    hint: tableId ? `Table created. Use app_token="${appToken}" and table_id="${tableId}" for other bitable tools.` : "Table created. Use feishu_bitable_get_meta to get table_id and field details."
  };
}
async function createField(client, appToken, tableId, fieldName, fieldType, property) {
  const res = await client.bitable.appTableField.create({
    path: { app_token: appToken, table_id: tableId },
    data: {
      field_name: fieldName,
      type: fieldType,
      ...property && { property }
    }
  });
  ensureLarkSuccess(res, "bitable.appTableField.create", {
    appToken,
    tableId,
    fieldName,
    fieldType
  });
  return {
    field_id: res.data?.field?.field_id,
    field_name: res.data?.field?.field_name,
    type: res.data?.field?.type,
    type_name: FIELD_TYPE_NAMES[res.data?.field?.type ?? 0] || `type_${res.data?.field?.type}`
  };
}
async function updateRecord(client, appToken, tableId, recordId, fields) {
  const res = await client.bitable.appTableRecord.update({
    path: { app_token: appToken, table_id: tableId, record_id: recordId },
    // oxlint-disable-next-line typescript/no-explicit-any
    data: { fields }
  });
  ensureLarkSuccess(res, "bitable.appTableRecord.update", { appToken, tableId, recordId });
  return {
    record: res.data?.record
  };
}
var GetMetaSchema = import_typebox.Type.Object({
  url: import_typebox.Type.String({
    description: "Bitable URL. Supports both formats: /base/XXX?table=YYY or /wiki/XXX?table=YYY"
  })
});
var ListFieldsSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" })
});
var ListRecordsSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" }),
  page_size: import_typebox.Type.Optional(
    import_typebox.Type.Number({
      description: "Number of records per page (1-500, default 100)",
      minimum: 1,
      maximum: 500
    })
  ),
  page_token: import_typebox.Type.Optional(
    import_typebox.Type.String({ description: "Pagination token from previous response" })
  )
});
var GetRecordSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" }),
  record_id: import_typebox.Type.String({ description: "Record ID to retrieve" })
});
var CreateRecordSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" }),
  fields: import_typebox.Type.Record(import_typebox.Type.String(), import_typebox.Type.Any(), {
    description: "Field values keyed by field name. Format by type: Text='string', Number=123, SingleSelect='Option', MultiSelect=['A','B'], DateTime=timestamp_ms, User=[{id:'ou_xxx'}], URL={text:'Display',link:'https://...'}"
  })
});
var CreateAppSchema = import_typebox.Type.Object({
  name: import_typebox.Type.String({
    description: "Name for the new Bitable application"
  }),
  folder_token: import_typebox.Type.Optional(
    import_typebox.Type.String({
      description: "Optional folder token to place the Bitable in a specific folder"
    })
  )
});
var CreateFieldSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL, or feishu_bitable_create_app to create new)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" }),
  field_name: import_typebox.Type.String({ description: "Name for the new field" }),
  field_type: import_typebox.Type.Number({
    description: "Field type ID: 1=Text, 2=Number, 3=SingleSelect, 4=MultiSelect, 5=DateTime, 7=Checkbox, 11=User, 13=Phone, 15=URL, 17=Attachment, 18=SingleLink, 19=Lookup, 20=Formula, 21=DuplexLink, 22=Location, 23=GroupChat, 1001=CreatedTime, 1002=ModifiedTime, 1003=CreatedUser, 1004=ModifiedUser, 1005=AutoNumber",
    minimum: 1
  }),
  property: import_typebox.Type.Optional(
    import_typebox.Type.Record(import_typebox.Type.String(), import_typebox.Type.Any(), {
      description: "Field-specific properties (e.g., options for SingleSelect, format for Number)"
    })
  )
});
var UpdateRecordSchema = import_typebox.Type.Object({
  app_token: import_typebox.Type.String({
    description: "Bitable app token (use feishu_bitable_get_meta to get from URL)"
  }),
  table_id: import_typebox.Type.String({ description: "Table ID (from URL: ?table=YYY)" }),
  record_id: import_typebox.Type.String({ description: "Record ID to update" }),
  fields: import_typebox.Type.Record(import_typebox.Type.String(), import_typebox.Type.Any(), {
    description: "Field values to update (same format as create_record)"
  })
});
function registerFeishuBitableTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_bitable: No config available, skipping bitable tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_bitable: No Feishu accounts configured, skipping bitable tools");
    return;
  }
  const getClient = (params, defaultAccountId) => createFeishuToolClient({ api, executeParams: params, defaultAccountId });
  const registerBitableTool = (params) => {
    api.registerTool(
      (ctx) => ({
        name: params.name,
        label: params.label,
        description: params.description,
        parameters: params.parameters,
        async execute(_toolCallId, rawParams) {
          try {
            return json(
              await params.execute({
                params: rawParams,
                defaultAccountId: ctx.agentAccountId
              })
            );
          } catch (err) {
            return json({ error: err instanceof Error ? err.message : String(err) });
          }
        }
      }),
      { name: params.name }
    );
  };
  registerBitableTool({
    name: "feishu_bitable_get_meta",
    label: "Feishu Bitable Get Meta",
    description: "Parse a Bitable URL and get app_token, table_id, and table list. Use this first when given a /wiki/ or /base/ URL.",
    parameters: GetMetaSchema,
    async execute({ params, defaultAccountId }) {
      return getBitableMeta(getClient(params, defaultAccountId), params.url);
    }
  });
  registerBitableTool({
    name: "feishu_bitable_list_fields",
    label: "Feishu Bitable List Fields",
    description: "List all fields (columns) in a Bitable table with their types and properties",
    parameters: ListFieldsSchema,
    async execute({ params, defaultAccountId }) {
      return listFields(getClient(params, defaultAccountId), params.app_token, params.table_id);
    }
  });
  registerBitableTool({
    name: "feishu_bitable_list_records",
    label: "Feishu Bitable List Records",
    description: "List records (rows) from a Bitable table with pagination support",
    parameters: ListRecordsSchema,
    async execute({ params, defaultAccountId }) {
      return listRecords(
        getClient(params, defaultAccountId),
        params.app_token,
        params.table_id,
        params.page_size,
        params.page_token
      );
    }
  });
  registerBitableTool({
    name: "feishu_bitable_get_record",
    label: "Feishu Bitable Get Record",
    description: "Get a single record by ID from a Bitable table",
    parameters: GetRecordSchema,
    async execute({ params, defaultAccountId }) {
      return getRecord(
        getClient(params, defaultAccountId),
        params.app_token,
        params.table_id,
        params.record_id
      );
    }
  });
  registerBitableTool({
    name: "feishu_bitable_create_record",
    label: "Feishu Bitable Create Record",
    description: "Create a new record (row) in a Bitable table",
    parameters: CreateRecordSchema,
    async execute({ params, defaultAccountId }) {
      return createRecord(
        getClient(params, defaultAccountId),
        params.app_token,
        params.table_id,
        params.fields
      );
    }
  });
  registerBitableTool({
    name: "feishu_bitable_update_record",
    label: "Feishu Bitable Update Record",
    description: "Update an existing record (row) in a Bitable table",
    parameters: UpdateRecordSchema,
    async execute({ params, defaultAccountId }) {
      return updateRecord(
        getClient(params, defaultAccountId),
        params.app_token,
        params.table_id,
        params.record_id,
        params.fields
      );
    }
  });
  registerBitableTool({
    name: "feishu_bitable_create_app",
    label: "Feishu Bitable Create App",
    description: "Create a new Bitable (multidimensional table) application",
    parameters: CreateAppSchema,
    async execute({ params, defaultAccountId }) {
      return createApp(getClient(params, defaultAccountId), params.name, params.folder_token, {
        debug: (msg) => api.logger.debug?.(msg),
        warn: (msg) => api.logger.warn?.(msg)
      });
    }
  });
  registerBitableTool({
    name: "feishu_bitable_create_field",
    label: "Feishu Bitable Create Field",
    description: "Create a new field (column) in a Bitable table",
    parameters: CreateFieldSchema,
    async execute({ params, defaultAccountId }) {
      return createField(
        getClient(params, defaultAccountId),
        params.app_token,
        params.table_id,
        params.field_name,
        params.field_type,
        params.property
      );
    }
  });
  api.logger.info?.("feishu_bitable: Registered bitable tools");
}

// src/core/extensions/feishu/src/channel.ts
var import_compat3 = require("src/core/source/plugin-sdk/compat");
var import_feishu11 = require("src/core/source/plugin-sdk/feishu");
init_accounts();

// src/core/extensions/feishu/src/directory.ts
var import_compat = require("src/core/source/plugin-sdk/compat");
init_accounts();
init_client();
init_targets();
function toFeishuDirectoryPeers(ids) {
  return ids.map((id) => ({ kind: "user", id }));
}
function toFeishuDirectoryGroups(ids) {
  return ids.map((id) => ({ kind: "group", id }));
}
async function listFeishuDirectoryPeers(params) {
  const account = resolveFeishuAccount({ cfg: params.cfg, accountId: params.accountId });
  const entries = (0, import_compat.listDirectoryUserEntriesFromAllowFromAndMapKeys)({
    allowFrom: account.config.allowFrom,
    map: account.config.dms,
    query: params.query,
    limit: params.limit,
    normalizeAllowFromId: (entry) => normalizeFeishuTarget(entry) ?? entry,
    normalizeMapKeyId: (entry) => normalizeFeishuTarget(entry) ?? entry
  });
  return toFeishuDirectoryPeers(entries.map((entry) => entry.id));
}
async function listFeishuDirectoryGroups(params) {
  const account = resolveFeishuAccount({ cfg: params.cfg, accountId: params.accountId });
  const entries = (0, import_compat.listDirectoryGroupEntriesFromMapKeysAndAllowFrom)({
    groups: account.config.groups,
    allowFrom: account.config.groupAllowFrom,
    query: params.query,
    limit: params.limit
  });
  return toFeishuDirectoryGroups(entries.map((entry) => entry.id));
}
async function listFeishuDirectoryPeersLive(params) {
  const account = resolveFeishuAccount({ cfg: params.cfg, accountId: params.accountId });
  if (!account.configured) {
    return listFeishuDirectoryPeers(params);
  }
  try {
    const client = createFeishuClient(account);
    const peers = [];
    const limit = params.limit ?? 50;
    const response = await client.contact.user.list({
      params: {
        page_size: Math.min(limit, 50)
      }
    });
    if (response.code === 0 && response.data?.items) {
      for (const user of response.data.items) {
        if (user.open_id) {
          const q = params.query?.trim().toLowerCase() || "";
          const name = user.name || "";
          if (!q || user.open_id.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
            peers.push({
              kind: "user",
              id: user.open_id,
              name: name || void 0
            });
          }
        }
        if (peers.length >= limit) {
          break;
        }
      }
    }
    return peers;
  } catch {
    return listFeishuDirectoryPeers(params);
  }
}
async function listFeishuDirectoryGroupsLive(params) {
  const account = resolveFeishuAccount({ cfg: params.cfg, accountId: params.accountId });
  if (!account.configured) {
    return listFeishuDirectoryGroups(params);
  }
  try {
    const client = createFeishuClient(account);
    const groups = [];
    const limit = params.limit ?? 50;
    const response = await client.im.chat.list({
      params: {
        page_size: Math.min(limit, 100)
      }
    });
    if (response.code === 0 && response.data?.items) {
      for (const chat of response.data.items) {
        if (chat.chat_id) {
          const q = params.query?.trim().toLowerCase() || "";
          const name = chat.name || "";
          if (!q || chat.chat_id.toLowerCase().includes(q) || name.toLowerCase().includes(q)) {
            groups.push({
              kind: "group",
              id: chat.chat_id,
              name: name || void 0
            });
          }
        }
        if (groups.length >= limit) {
          break;
        }
      }
    }
    return groups;
  } catch {
    return listFeishuDirectoryGroups(params);
  }
}

// src/core/extensions/feishu/src/onboarding.ts
var import_feishu2 = require("src/core/source/plugin-sdk/feishu");
init_accounts();
init_probe();
var channel = "feishu";
function normalizeString(value) {
  if (typeof value !== "string") {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed || void 0;
}
function setFeishuDmPolicy(cfg, dmPolicy2) {
  return (0, import_feishu2.setTopLevelChannelDmPolicyWithAllowFrom)({
    cfg,
    channel: "feishu",
    dmPolicy: dmPolicy2
  });
}
function setFeishuAllowFrom(cfg, allowFrom) {
  return (0, import_feishu2.setTopLevelChannelAllowFrom)({
    cfg,
    channel: "feishu",
    allowFrom
  });
}
async function promptFeishuAllowFrom(params) {
  const existing = params.cfg.channels?.feishu?.allowFrom ?? [];
  await params.prompter.note(
    [
      "Allowlist Feishu DMs by open_id or user_id.",
      "You can find user open_id in Feishu admin console or via API.",
      "Examples:",
      "- ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "- on_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ].join("\n"),
    "Feishu allowlist"
  );
  while (true) {
    const entry = await params.prompter.text({
      message: "Feishu allowFrom (user open_ids)",
      placeholder: "ou_xxxxx, ou_yyyyy",
      initialValue: existing[0] ? String(existing[0]) : void 0,
      validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
    });
    const parts = (0, import_feishu2.splitOnboardingEntries)(String(entry));
    if (parts.length === 0) {
      await params.prompter.note("Enter at least one user.", "Feishu allowlist");
      continue;
    }
    const unique = (0, import_feishu2.mergeAllowFromEntries)(existing, parts);
    return setFeishuAllowFrom(params.cfg, unique);
  }
}
async function noteFeishuCredentialHelp(prompter) {
  await prompter.note(
    [
      "1) Go to Feishu Open Platform (open.feishu.cn)",
      "2) Create a self-built app",
      "3) Get App ID and App Secret from Credentials page",
      "4) Enable required permissions: im:message, im:chat, contact:user.base:readonly",
      "5) Publish the app or add it to a test group",
      "Tip: you can also set FEISHU_APP_ID / FEISHU_APP_SECRET env vars.",
      `Docs: ${(0, import_feishu2.formatDocsLink)("/channels/feishu", "feishu")}`
    ].join("\n"),
    "Feishu credentials"
  );
}
async function promptFeishuAppId(params) {
  const appId = String(
    await params.prompter.text({
      message: "Enter Feishu App ID",
      initialValue: params.initialValue,
      validate: (value) => value?.trim() ? void 0 : "Required"
    })
  ).trim();
  return appId;
}
function setFeishuGroupPolicy(cfg, groupPolicy) {
  return (0, import_feishu2.setTopLevelChannelGroupPolicy)({
    cfg,
    channel: "feishu",
    groupPolicy,
    enabled: true
  });
}
function setFeishuGroupAllowFrom(cfg, groupAllowFrom) {
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...cfg.channels?.feishu,
        groupAllowFrom
      }
    }
  };
}
var dmPolicy = {
  label: "Feishu",
  channel,
  policyKey: "channels.feishu.dmPolicy",
  allowFromKey: "channels.feishu.allowFrom",
  getCurrent: (cfg) => cfg.channels?.feishu?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setFeishuDmPolicy(cfg, policy),
  promptAllowFrom: promptFeishuAllowFrom
};
var feishuOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const feishuCfg = cfg.channels?.feishu;
    const isAppIdConfigured = (value) => {
      const asString = normalizeString(value);
      if (asString) {
        return true;
      }
      if (!value || typeof value !== "object") {
        return false;
      }
      const rec = value;
      const source = normalizeString(rec.source)?.toLowerCase();
      const id = normalizeString(rec.id);
      if (source === "env" && id) {
        return Boolean(normalizeString(process.env[id]));
      }
      return (0, import_feishu2.hasConfiguredSecretInput)(value);
    };
    const topLevelConfigured = Boolean(
      isAppIdConfigured(feishuCfg?.appId) && (0, import_feishu2.hasConfiguredSecretInput)(feishuCfg?.appSecret)
    );
    const accountConfigured = Object.values(feishuCfg?.accounts ?? {}).some((account) => {
      if (!account || typeof account !== "object") {
        return false;
      }
      const hasOwnAppId = Object.prototype.hasOwnProperty.call(account, "appId");
      const hasOwnAppSecret = Object.prototype.hasOwnProperty.call(account, "appSecret");
      const accountAppIdConfigured = hasOwnAppId ? isAppIdConfigured(account.appId) : isAppIdConfigured(feishuCfg?.appId);
      const accountSecretConfigured = hasOwnAppSecret ? (0, import_feishu2.hasConfiguredSecretInput)(account.appSecret) : (0, import_feishu2.hasConfiguredSecretInput)(feishuCfg?.appSecret);
      return Boolean(accountAppIdConfigured && accountSecretConfigured);
    });
    const configured = topLevelConfigured || accountConfigured;
    const resolvedCredentials = resolveFeishuCredentials(feishuCfg, {
      allowUnresolvedSecretRef: true
    });
    let probeResult = null;
    if (configured && resolvedCredentials) {
      try {
        probeResult = await probeFeishu(resolvedCredentials);
      } catch {
      }
    }
    const statusLines = [];
    if (!configured) {
      statusLines.push("Feishu: needs app credentials");
    } else if (probeResult?.ok) {
      statusLines.push(
        `Feishu: connected as ${probeResult.botName ?? probeResult.botOpenId ?? "bot"}`
      );
    } else {
      statusLines.push("Feishu: configured (connection not verified)");
    }
    return {
      channel,
      configured,
      statusLines,
      selectionHint: configured ? "configured" : "needs app creds",
      quickstartScore: configured ? 2 : 0
    };
  },
  configure: async ({ cfg, prompter }) => {
    const feishuCfg = cfg.channels?.feishu;
    const resolved = resolveFeishuCredentials(feishuCfg, {
      allowUnresolvedSecretRef: true
    });
    const hasConfigSecret = (0, import_feishu2.hasConfiguredSecretInput)(feishuCfg?.appSecret);
    const hasConfigCreds = Boolean(
      typeof feishuCfg?.appId === "string" && feishuCfg.appId.trim() && hasConfigSecret
    );
    const appSecretPromptState = (0, import_feishu2.buildSingleChannelSecretPromptState)({
      accountConfigured: Boolean(resolved),
      hasConfigToken: hasConfigSecret,
      allowEnv: !hasConfigCreds && Boolean(process.env.FEISHU_APP_ID?.trim()),
      envValue: process.env.FEISHU_APP_SECRET
    });
    let next = cfg;
    let appId = null;
    let appSecret = null;
    let appSecretProbeValue = null;
    if (!resolved) {
      await noteFeishuCredentialHelp(prompter);
    }
    const appSecretResult = await (0, import_feishu2.promptSingleChannelSecretInput)({
      cfg: next,
      prompter,
      providerHint: "feishu",
      credentialLabel: "App Secret",
      accountConfigured: appSecretPromptState.accountConfigured,
      canUseEnv: appSecretPromptState.canUseEnv,
      hasConfigToken: appSecretPromptState.hasConfigToken,
      envPrompt: "FEISHU_APP_ID + FEISHU_APP_SECRET detected. Use env vars?",
      keepPrompt: "Feishu App Secret already configured. Keep it?",
      inputPrompt: "Enter Feishu App Secret",
      preferredEnvVar: "FEISHU_APP_SECRET"
    });
    if (appSecretResult.action === "use-env") {
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: { ...next.channels?.feishu, enabled: true }
        }
      };
    } else if (appSecretResult.action === "set") {
      appSecret = appSecretResult.value;
      appSecretProbeValue = appSecretResult.resolvedValue;
      appId = await promptFeishuAppId({
        prompter,
        initialValue: normalizeString(feishuCfg?.appId) ?? normalizeString(process.env.FEISHU_APP_ID)
      });
    }
    if (appId && appSecret) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: {
            ...next.channels?.feishu,
            enabled: true,
            appId,
            appSecret
          }
        }
      };
      try {
        const probe = await probeFeishu({
          appId,
          appSecret: appSecretProbeValue ?? void 0,
          domain: next.channels?.feishu?.domain
        });
        if (probe.ok) {
          await prompter.note(
            `Connected as ${probe.botName ?? probe.botOpenId ?? "bot"}`,
            "Feishu connection test"
          );
        } else {
          await prompter.note(
            `Connection failed: ${probe.error ?? "unknown error"}`,
            "Feishu connection test"
          );
        }
      } catch (err) {
        await prompter.note(`Connection test failed: ${String(err)}`, "Feishu connection test");
      }
    }
    const currentMode = next.channels?.feishu?.connectionMode ?? "websocket";
    const connectionMode = await prompter.select({
      message: "Feishu connection mode",
      options: [
        { value: "websocket", label: "WebSocket (default)" },
        { value: "webhook", label: "Webhook" }
      ],
      initialValue: currentMode
    });
    next = {
      ...next,
      channels: {
        ...next.channels,
        feishu: {
          ...next.channels?.feishu,
          connectionMode
        }
      }
    };
    if (connectionMode === "webhook") {
      const currentVerificationToken = next.channels?.feishu?.verificationToken;
      const verificationTokenPromptState = (0, import_feishu2.buildSingleChannelSecretPromptState)({
        accountConfigured: (0, import_feishu2.hasConfiguredSecretInput)(currentVerificationToken),
        hasConfigToken: (0, import_feishu2.hasConfiguredSecretInput)(currentVerificationToken),
        allowEnv: false
      });
      const verificationTokenResult = await (0, import_feishu2.promptSingleChannelSecretInput)({
        cfg: next,
        prompter,
        providerHint: "feishu-webhook",
        credentialLabel: "verification token",
        accountConfigured: verificationTokenPromptState.accountConfigured,
        canUseEnv: verificationTokenPromptState.canUseEnv,
        hasConfigToken: verificationTokenPromptState.hasConfigToken,
        envPrompt: "",
        keepPrompt: "Feishu verification token already configured. Keep it?",
        inputPrompt: "Enter Feishu verification token",
        preferredEnvVar: "FEISHU_VERIFICATION_TOKEN"
      });
      if (verificationTokenResult.action === "set") {
        next = {
          ...next,
          channels: {
            ...next.channels,
            feishu: {
              ...next.channels?.feishu,
              verificationToken: verificationTokenResult.value
            }
          }
        };
      }
      const currentEncryptKey = next.channels?.feishu?.encryptKey;
      const encryptKeyPromptState = (0, import_feishu2.buildSingleChannelSecretPromptState)({
        accountConfigured: (0, import_feishu2.hasConfiguredSecretInput)(currentEncryptKey),
        hasConfigToken: (0, import_feishu2.hasConfiguredSecretInput)(currentEncryptKey),
        allowEnv: false
      });
      const encryptKeyResult = await (0, import_feishu2.promptSingleChannelSecretInput)({
        cfg: next,
        prompter,
        providerHint: "feishu-webhook",
        credentialLabel: "encrypt key",
        accountConfigured: encryptKeyPromptState.accountConfigured,
        canUseEnv: encryptKeyPromptState.canUseEnv,
        hasConfigToken: encryptKeyPromptState.hasConfigToken,
        envPrompt: "",
        keepPrompt: "Feishu encrypt key already configured. Keep it?",
        inputPrompt: "Enter Feishu encrypt key",
        preferredEnvVar: "FEISHU_ENCRYPT_KEY"
      });
      if (encryptKeyResult.action === "set") {
        next = {
          ...next,
          channels: {
            ...next.channels,
            feishu: {
              ...next.channels?.feishu,
              encryptKey: encryptKeyResult.value
            }
          }
        };
      }
      const currentWebhookPath = next.channels?.feishu?.webhookPath;
      const webhookPath = String(
        await prompter.text({
          message: "Feishu webhook path",
          initialValue: currentWebhookPath ?? "/feishu/events",
          validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
        })
      ).trim();
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: {
            ...next.channels?.feishu,
            webhookPath
          }
        }
      };
    }
    const currentDomain = next.channels?.feishu?.domain ?? "feishu";
    const domain = await prompter.select({
      message: "Which Feishu domain?",
      options: [
        { value: "feishu", label: "Feishu (feishu.cn) - China" },
        { value: "lark", label: "Lark (larksuite.com) - International" }
      ],
      initialValue: currentDomain
    });
    if (domain) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          feishu: {
            ...next.channels?.feishu,
            domain
          }
        }
      };
    }
    const groupPolicy = await prompter.select({
      message: "Group chat policy",
      options: [
        { value: "allowlist", label: "Allowlist - only respond in specific groups" },
        { value: "open", label: "Open - respond in all groups (requires mention)" },
        { value: "disabled", label: "Disabled - don't respond in groups" }
      ],
      initialValue: next.channels?.feishu?.groupPolicy ?? "allowlist"
    });
    if (groupPolicy) {
      next = setFeishuGroupPolicy(next, groupPolicy);
    }
    if (groupPolicy === "allowlist") {
      const existing = next.channels?.feishu?.groupAllowFrom ?? [];
      const entry = await prompter.text({
        message: "Group chat allowlist (chat_ids)",
        placeholder: "oc_xxxxx, oc_yyyyy",
        initialValue: existing.length > 0 ? existing.map(String).join(", ") : void 0
      });
      if (entry) {
        const parts = (0, import_feishu2.splitOnboardingEntries)(String(entry));
        if (parts.length > 0) {
          next = setFeishuGroupAllowFrom(next, parts);
        }
      }
    }
    return { cfg: next, accountId: import_feishu2.DEFAULT_ACCOUNT_ID };
  },
  dmPolicy,
  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: { ...cfg.channels?.feishu, enabled: false }
    }
  })
};

// src/core/extensions/feishu/src/outbound.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
init_accounts();
init_media();
init_runtime();
init_send();
function normalizePossibleLocalImagePath(text) {
  const raw = text?.trim();
  if (!raw) return null;
  const hasWhitespace = /\s/.test(raw);
  if (hasWhitespace) return null;
  if (/^(https?:\/\/|data:|file:\/\/)/i.test(raw)) return null;
  const ext = import_path2.default.extname(raw).toLowerCase();
  const isImageExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".ico", ".tiff"].includes(
    ext
  );
  if (!isImageExt) return null;
  if (!import_path2.default.isAbsolute(raw)) return null;
  if (!import_fs2.default.existsSync(raw)) return null;
  try {
    if (!import_fs2.default.statSync(raw).isFile()) return null;
  } catch {
    return null;
  }
  return raw;
}
function shouldUseCard(text) {
  return /```[\s\S]*?```/.test(text) || /\|.+\|[\r\n]+\|[-:| ]+\|/.test(text);
}
function resolveReplyToMessageId(params) {
  const replyToId = params.replyToId?.trim();
  if (replyToId) {
    return replyToId;
  }
  if (params.threadId == null) {
    return void 0;
  }
  const trimmed = String(params.threadId).trim();
  return trimmed || void 0;
}
async function sendOutboundText(params) {
  const { cfg, to, text, accountId, replyToMessageId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  const renderMode = account.config?.renderMode ?? "auto";
  if (renderMode === "card" || renderMode === "auto" && shouldUseCard(text)) {
    return sendMarkdownCardFeishu({ cfg, to, text, accountId, replyToMessageId });
  }
  return sendMessageFeishu({ cfg, to, text, accountId, replyToMessageId });
}
var feishuOutbound = {
  deliveryMode: "direct",
  chunker: (text, limit) => getFeishuRuntime().channel.text.chunkMarkdownText(text, limit),
  chunkerMode: "markdown",
  textChunkLimit: 4e3,
  sendText: async ({ cfg, to, text, accountId, replyToId, threadId, mediaLocalRoots }) => {
    const replyToMessageId = resolveReplyToMessageId({ replyToId, threadId });
    const localImagePath = normalizePossibleLocalImagePath(text);
    if (localImagePath) {
      try {
        const result2 = await sendMediaFeishu({
          cfg,
          to,
          mediaUrl: localImagePath,
          accountId: accountId ?? void 0,
          replyToMessageId,
          mediaLocalRoots
        });
        return { channel: "feishu", ...result2 };
      } catch (err) {
        console.error(`[feishu] local image path auto-send failed:`, err);
      }
    }
    const result = await sendOutboundText({
      cfg,
      to,
      text,
      accountId: accountId ?? void 0,
      replyToMessageId
    });
    return { channel: "feishu", ...result };
  },
  sendMedia: async ({
    cfg,
    to,
    text,
    mediaUrl,
    accountId,
    mediaLocalRoots,
    replyToId,
    threadId
  }) => {
    const replyToMessageId = resolveReplyToMessageId({ replyToId, threadId });
    if (text?.trim()) {
      await sendOutboundText({
        cfg,
        to,
        text,
        accountId: accountId ?? void 0,
        replyToMessageId
      });
    }
    if (mediaUrl) {
      try {
        const result2 = await sendMediaFeishu({
          cfg,
          to,
          mediaUrl,
          accountId: accountId ?? void 0,
          mediaLocalRoots,
          replyToMessageId
        });
        return { channel: "feishu", ...result2 };
      } catch (err) {
        console.error(`[feishu] sendMediaFeishu failed:`, err);
        const fallbackText = `\u{1F4CE} ${mediaUrl}`;
        const result2 = await sendOutboundText({
          cfg,
          to,
          text: fallbackText,
          accountId: accountId ?? void 0,
          replyToMessageId
        });
        return { channel: "feishu", ...result2 };
      }
    }
    const result = await sendOutboundText({
      cfg,
      to,
      text: text ?? "",
      accountId: accountId ?? void 0,
      replyToMessageId
    });
    return { channel: "feishu", ...result };
  }
};

// src/core/extensions/feishu/src/channel.ts
init_policy();
init_probe();
init_send();
init_targets();
var meta = {
  id: "feishu",
  label: "Feishu",
  selectionLabel: "Feishu/Lark (\u98DE\u4E66)",
  docsPath: "/channels/feishu",
  docsLabel: "feishu",
  blurb: "\u98DE\u4E66/Lark enterprise messaging.",
  aliases: ["lark"],
  order: 70
};
var secretInputJsonSchema = {
  oneOf: [
    { type: "string" },
    {
      type: "object",
      additionalProperties: false,
      required: ["source", "provider", "id"],
      properties: {
        source: { type: "string", enum: ["env", "file", "exec"] },
        provider: { type: "string", minLength: 1 },
        id: { type: "string", minLength: 1 }
      }
    }
  ]
};
function setFeishuNamedAccountEnabled(cfg, accountId, enabled) {
  const feishuCfg = cfg.channels?.feishu;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      feishu: {
        ...feishuCfg,
        accounts: {
          ...feishuCfg?.accounts,
          [accountId]: {
            ...feishuCfg?.accounts?.[accountId],
            enabled
          }
        }
      }
    }
  };
}
var feishuPlugin = {
  id: "feishu",
  meta: {
    ...meta
  },
  pairing: {
    idLabel: "feishuUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(feishu|user|open_id):/i, ""),
    notifyApproval: async ({ cfg, id }) => {
      await sendMessageFeishu({
        cfg,
        to: id,
        text: import_feishu11.PAIRING_APPROVED_MESSAGE
      });
    }
  },
  capabilities: {
    chatTypes: ["direct", "channel"],
    polls: false,
    threads: true,
    media: true,
    reactions: true,
    edit: true,
    reply: true
  },
  agentPrompt: {
    messageToolHints: () => [
      "- Feishu targeting: omit `target` to reply to the current conversation (auto-inferred). Explicit targets: `user:open_id` or `chat:chat_id`.",
      "- Feishu supports interactive cards for rich messages."
    ]
  },
  groups: {
    resolveToolPolicy: resolveFeishuGroupToolPolicy
  },
  mentions: {
    stripPatterns: () => ['<at user_id="[^"]*">[^<]*</at>']
  },
  reload: { configPrefixes: ["channels.feishu"] },
  configSchema: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        defaultAccount: { type: "string" },
        appId: { type: "string" },
        appSecret: secretInputJsonSchema,
        encryptKey: secretInputJsonSchema,
        verificationToken: secretInputJsonSchema,
        domain: {
          oneOf: [
            { type: "string", enum: ["feishu", "lark"] },
            { type: "string", format: "uri", pattern: "^https://" }
          ]
        },
        connectionMode: { type: "string", enum: ["websocket", "webhook"] },
        webhookPath: { type: "string" },
        webhookHost: { type: "string" },
        webhookPort: { type: "integer", minimum: 1 },
        dmPolicy: { type: "string", enum: ["open", "pairing", "allowlist"] },
        allowFrom: { type: "array", items: { oneOf: [{ type: "string" }, { type: "number" }] } },
        groupPolicy: { type: "string", enum: ["open", "allowlist", "disabled"] },
        groupAllowFrom: {
          type: "array",
          items: { oneOf: [{ type: "string" }, { type: "number" }] }
        },
        requireMention: { type: "boolean" },
        groupSessionScope: {
          type: "string",
          enum: ["group", "group_sender", "group_topic", "group_topic_sender"]
        },
        topicSessionMode: { type: "string", enum: ["disabled", "enabled"] },
        replyInThread: { type: "string", enum: ["disabled", "enabled"] },
        historyLimit: { type: "integer", minimum: 0 },
        dmHistoryLimit: { type: "integer", minimum: 0 },
        textChunkLimit: { type: "integer", minimum: 1 },
        chunkMode: { type: "string", enum: ["length", "newline"] },
        mediaMaxMb: { type: "number", minimum: 0 },
        renderMode: { type: "string", enum: ["auto", "raw", "card"] },
        accounts: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              name: { type: "string" },
              appId: { type: "string" },
              appSecret: secretInputJsonSchema,
              encryptKey: secretInputJsonSchema,
              verificationToken: secretInputJsonSchema,
              domain: { type: "string", enum: ["feishu", "lark"] },
              connectionMode: { type: "string", enum: ["websocket", "webhook"] },
              webhookHost: { type: "string" },
              webhookPath: { type: "string" },
              webhookPort: { type: "integer", minimum: 1 }
            }
          }
        }
      }
    }
  },
  config: {
    listAccountIds: (cfg) => listFeishuAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveFeishuAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultFeishuAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const account = resolveFeishuAccount({ cfg, accountId });
      const isDefault = accountId === import_feishu11.DEFAULT_ACCOUNT_ID;
      if (isDefault) {
        return {
          ...cfg,
          channels: {
            ...cfg.channels,
            feishu: {
              ...cfg.channels?.feishu,
              enabled
            }
          }
        };
      }
      return setFeishuNamedAccountEnabled(cfg, accountId, enabled);
    },
    deleteAccount: ({ cfg, accountId }) => {
      const isDefault = accountId === import_feishu11.DEFAULT_ACCOUNT_ID;
      if (isDefault) {
        const next = { ...cfg };
        const nextChannels = { ...cfg.channels };
        delete nextChannels.feishu;
        if (Object.keys(nextChannels).length > 0) {
          next.channels = nextChannels;
        } else {
          delete next.channels;
        }
        return next;
      }
      const feishuCfg = cfg.channels?.feishu;
      const accounts = { ...feishuCfg?.accounts };
      delete accounts[accountId];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          feishu: {
            ...feishuCfg,
            accounts: Object.keys(accounts).length > 0 ? accounts : void 0
          }
        }
      };
    },
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
      name: account.name,
      appId: account.appId,
      domain: account.domain
    }),
    resolveAllowFrom: ({ cfg, accountId }) => {
      const account = resolveFeishuAccount({ cfg, accountId });
      return (0, import_compat3.mapAllowFromEntries)(account.config?.allowFrom);
    },
    formatAllowFrom: ({ allowFrom }) => (0, import_compat3.formatAllowFromLowercase)({ allowFrom })
  },
  security: {
    collectWarnings: ({ cfg, accountId }) => {
      const account = resolveFeishuAccount({ cfg, accountId });
      const feishuCfg = account.config;
      return (0, import_compat3.collectAllowlistProviderRestrictSendersWarnings)({
        cfg,
        providerConfigPresent: cfg.channels?.feishu !== void 0,
        configuredGroupPolicy: feishuCfg?.groupPolicy,
        surface: `Feishu[${account.accountId}] groups`,
        openScope: "any member",
        groupPolicyPath: "channels.feishu.groupPolicy",
        groupAllowFromPath: "channels.feishu.groupAllowFrom"
      });
    }
  },
  setup: {
    resolveAccountId: () => import_feishu11.DEFAULT_ACCOUNT_ID,
    applyAccountConfig: ({ cfg, accountId }) => {
      const isDefault = !accountId || accountId === import_feishu11.DEFAULT_ACCOUNT_ID;
      if (isDefault) {
        return {
          ...cfg,
          channels: {
            ...cfg.channels,
            feishu: {
              ...cfg.channels?.feishu,
              enabled: true
            }
          }
        };
      }
      return setFeishuNamedAccountEnabled(cfg, accountId, true);
    }
  },
  onboarding: feishuOnboardingAdapter,
  messaging: {
    normalizeTarget: (raw) => normalizeFeishuTarget(raw) ?? void 0,
    targetResolver: {
      looksLikeId: looksLikeFeishuId,
      hint: "<chatId|user:openId|chat:chatId>"
    }
  },
  directory: {
    self: async () => null,
    listPeers: async ({ cfg, query, limit, accountId }) => listFeishuDirectoryPeers({
      cfg,
      query: query ?? void 0,
      limit: limit ?? void 0,
      accountId: accountId ?? void 0
    }),
    listGroups: async ({ cfg, query, limit, accountId }) => listFeishuDirectoryGroups({
      cfg,
      query: query ?? void 0,
      limit: limit ?? void 0,
      accountId: accountId ?? void 0
    }),
    listPeersLive: async ({ cfg, query, limit, accountId }) => listFeishuDirectoryPeersLive({
      cfg,
      query: query ?? void 0,
      limit: limit ?? void 0,
      accountId: accountId ?? void 0
    }),
    listGroupsLive: async ({ cfg, query, limit, accountId }) => listFeishuDirectoryGroupsLive({
      cfg,
      query: query ?? void 0,
      limit: limit ?? void 0,
      accountId: accountId ?? void 0
    })
  },
  outbound: feishuOutbound,
  status: {
    defaultRuntime: (0, import_feishu11.createDefaultChannelRuntimeState)(import_feishu11.DEFAULT_ACCOUNT_ID, { port: null }),
    buildChannelSummary: ({ snapshot }) => (0, import_feishu11.buildProbeChannelStatusSummary)(snapshot, {
      port: snapshot.port ?? null
    }),
    probeAccount: async ({ account }) => await probeFeishu(account),
    buildAccountSnapshot: ({ account, runtime, probe }) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
      name: account.name,
      appId: account.appId,
      domain: account.domain,
      ...(0, import_feishu11.buildRuntimeAccountStatusSnapshot)({ runtime, probe }),
      port: runtime?.port ?? null
    })
  },
  gateway: {
    startAccount: async (ctx) => {
      const { monitorFeishuProvider: monitorFeishuProvider2 } = await Promise.resolve().then(() => (init_monitor(), monitor_exports));
      const account = resolveFeishuAccount({ cfg: ctx.cfg, accountId: ctx.accountId });
      const port = account.config?.webhookPort ?? null;
      ctx.setStatus({ accountId: ctx.accountId, port });
      ctx.log?.info(
        `starting feishu[${ctx.accountId}] (mode: ${account.config?.connectionMode ?? "websocket"})`
      );
      return monitorFeishuProvider2({
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        accountId: ctx.accountId
      });
    }
  }
};

// src/core/extensions/feishu/src/chat.ts
init_accounts();

// src/core/extensions/feishu/src/chat-schema.ts
var import_typebox2 = require("@sinclair/typebox");
var CHAT_ACTION_VALUES = ["members", "info"];
var MEMBER_ID_TYPE_VALUES = ["open_id", "user_id", "union_id"];
var FeishuChatSchema = import_typebox2.Type.Object({
  action: import_typebox2.Type.Unsafe({
    type: "string",
    enum: [...CHAT_ACTION_VALUES],
    description: "Action to run: members | info"
  }),
  chat_id: import_typebox2.Type.String({ description: "Chat ID (from URL or event payload)" }),
  page_size: import_typebox2.Type.Optional(import_typebox2.Type.Number({ description: "Page size (1-100, default 50)" })),
  page_token: import_typebox2.Type.Optional(import_typebox2.Type.String({ description: "Pagination token" })),
  member_id_type: import_typebox2.Type.Optional(
    import_typebox2.Type.Unsafe({
      type: "string",
      enum: [...MEMBER_ID_TYPE_VALUES],
      description: "Member ID type (default: open_id)"
    })
  )
});

// src/core/extensions/feishu/src/chat.ts
init_client();
function json2(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data
  };
}
async function getChatInfo(client, chatId) {
  const res = await client.im.chat.get({ path: { chat_id: chatId } });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const chat = res.data;
  return {
    chat_id: chatId,
    name: chat?.name,
    description: chat?.description,
    owner_id: chat?.owner_id,
    tenant_key: chat?.tenant_key,
    user_count: chat?.user_count,
    chat_mode: chat?.chat_mode,
    chat_type: chat?.chat_type,
    join_message_visibility: chat?.join_message_visibility,
    leave_message_visibility: chat?.leave_message_visibility,
    membership_approval: chat?.membership_approval,
    moderation_permission: chat?.moderation_permission,
    avatar: chat?.avatar
  };
}
async function getChatMembers(client, chatId, pageSize, pageToken, memberIdType) {
  const page_size = pageSize ? Math.max(1, Math.min(100, pageSize)) : 50;
  const res = await client.im.chatMembers.get({
    path: { chat_id: chatId },
    params: {
      page_size,
      page_token: pageToken,
      member_id_type: memberIdType ?? "open_id"
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    chat_id: chatId,
    has_more: res.data?.has_more,
    page_token: res.data?.page_token,
    members: res.data?.items?.map((item) => ({
      member_id: item.member_id,
      name: item.name,
      tenant_key: item.tenant_key,
      member_id_type: item.member_id_type
    })) ?? []
  };
}
function registerFeishuChatTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_chat: No config available, skipping chat tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_chat: No Feishu accounts configured, skipping chat tools");
    return;
  }
  const firstAccount = accounts[0];
  const toolsCfg = resolveToolsConfig(firstAccount.config.tools);
  if (!toolsCfg.chat) {
    api.logger.debug?.("feishu_chat: chat tool disabled in config");
    return;
  }
  const getClient = () => createFeishuClient(firstAccount);
  api.registerTool(
    {
      name: "feishu_chat",
      label: "Feishu Chat",
      description: "Feishu chat operations. Actions: members, info",
      parameters: FeishuChatSchema,
      async execute(_toolCallId, params) {
        const p = params;
        try {
          const client = getClient();
          switch (p.action) {
            case "members":
              return json2(
                await getChatMembers(
                  client,
                  p.chat_id,
                  p.page_size,
                  p.page_token,
                  p.member_id_type
                )
              );
            case "info":
              return json2(await getChatInfo(client, p.chat_id));
            default:
              return json2({ error: `Unknown action: ${String(p.action)}` });
          }
        } catch (err) {
          return json2({ error: err instanceof Error ? err.message : String(err) });
        }
      }
    },
    { name: "feishu_chat" }
  );
  api.logger.info?.("feishu_chat: Registered feishu_chat tool");
}

// src/core/extensions/feishu/src/docx.ts
var import_node_fs2 = require("node:fs");
var import_node_os3 = require("node:os");
var import_node_path3 = require("node:path");
var import_node_path4 = require("node:path");
var import_typebox4 = require("@sinclair/typebox");
init_accounts();

// src/core/extensions/feishu/src/doc-schema.ts
var import_typebox3 = require("@sinclair/typebox");
var tableCreationProperties = {
  doc_token: import_typebox3.Type.String({ description: "Document token" }),
  parent_block_id: import_typebox3.Type.Optional(
    import_typebox3.Type.String({ description: "Parent block ID (default: document root)" })
  ),
  row_size: import_typebox3.Type.Integer({ description: "Table row count", minimum: 1 }),
  column_size: import_typebox3.Type.Integer({ description: "Table column count", minimum: 1 }),
  column_width: import_typebox3.Type.Optional(
    import_typebox3.Type.Array(import_typebox3.Type.Number({ minimum: 1 }), {
      description: "Column widths in px (length should match column_size)"
    })
  )
};
var FeishuDocSchema = import_typebox3.Type.Union([
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("read"),
    doc_token: import_typebox3.Type.String({ description: "Document token (extract from URL /docx/XXX)" })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("write"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    content: import_typebox3.Type.String({
      description: "Markdown content to write (replaces entire document content)"
    })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("append"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    content: import_typebox3.Type.String({ description: "Markdown content to append to end of document" })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("insert"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    content: import_typebox3.Type.String({ description: "Markdown content to insert" }),
    after_block_id: import_typebox3.Type.String({
      description: "Insert content after this block ID. Use list_blocks to find block IDs."
    })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("create"),
    title: import_typebox3.Type.String({ description: "Document title" }),
    folder_token: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Target folder token (optional)" })),
    grant_to_requester: import_typebox3.Type.Optional(
      import_typebox3.Type.Boolean({
        description: "Grant edit permission to the trusted requesting Feishu user from runtime context (default: true)."
      })
    )
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("list_blocks"),
    doc_token: import_typebox3.Type.String({ description: "Document token" })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("get_block"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Block ID (from list_blocks)" })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("update_block"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Block ID (from list_blocks)" }),
    content: import_typebox3.Type.String({ description: "New text content" })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("delete_block"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Block ID" })
  }),
  // Table creation (explicit structure)
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("create_table"),
    ...tableCreationProperties
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("write_table_cells"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    table_block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    values: import_typebox3.Type.Array(import_typebox3.Type.Array(import_typebox3.Type.String()), {
      description: "2D matrix values[row][col] to write into table cells",
      minItems: 1
    })
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("create_table_with_values"),
    ...tableCreationProperties,
    values: import_typebox3.Type.Array(import_typebox3.Type.Array(import_typebox3.Type.String()), {
      description: "2D matrix values[row][col] to write into table cells",
      minItems: 1
    })
  }),
  // Table row/column manipulation
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("insert_table_row"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    row_index: import_typebox3.Type.Optional(
      import_typebox3.Type.Number({ description: "Row index to insert at (-1 for end, default: -1)" })
    )
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("insert_table_column"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    column_index: import_typebox3.Type.Optional(
      import_typebox3.Type.Number({ description: "Column index to insert at (-1 for end, default: -1)" })
    )
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("delete_table_rows"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    row_start: import_typebox3.Type.Number({ description: "Start row index (0-based)" }),
    row_count: import_typebox3.Type.Optional(import_typebox3.Type.Number({ description: "Number of rows to delete (default: 1)" }))
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("delete_table_columns"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    column_start: import_typebox3.Type.Number({ description: "Start column index (0-based)" }),
    column_count: import_typebox3.Type.Optional(
      import_typebox3.Type.Number({ description: "Number of columns to delete (default: 1)" })
    )
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("merge_table_cells"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Table block ID" }),
    row_start: import_typebox3.Type.Number({ description: "Start row index" }),
    row_end: import_typebox3.Type.Number({ description: "End row index (exclusive)" }),
    column_start: import_typebox3.Type.Number({ description: "Start column index" }),
    column_end: import_typebox3.Type.Number({ description: "End column index (exclusive)" })
  }),
  // Image / file upload
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("upload_image"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    url: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Remote image URL (http/https)" })),
    file_path: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Local image file path" })),
    image: import_typebox3.Type.Optional(
      import_typebox3.Type.String({
        description: "Image as data URI (data:image/png;base64,...) or plain base64 string. Use instead of url/file_path for DALL-E outputs, canvas screenshots, etc."
      })
    ),
    parent_block_id: import_typebox3.Type.Optional(
      import_typebox3.Type.String({ description: "Parent block ID (default: document root)" })
    ),
    filename: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Optional filename override" })),
    index: import_typebox3.Type.Optional(
      import_typebox3.Type.Integer({
        minimum: 0,
        description: "Insert position (0-based index among siblings). Omit to append."
      })
    )
  }),
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("upload_file"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    url: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Remote file URL (http/https)" })),
    file_path: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Local file path" })),
    parent_block_id: import_typebox3.Type.Optional(
      import_typebox3.Type.String({ description: "Parent block ID (default: document root)" })
    ),
    filename: import_typebox3.Type.Optional(import_typebox3.Type.String({ description: "Optional filename override" }))
  }),
  // Text color / style
  import_typebox3.Type.Object({
    action: import_typebox3.Type.Literal("color_text"),
    doc_token: import_typebox3.Type.String({ description: "Document token" }),
    block_id: import_typebox3.Type.String({ description: "Text block ID to update" }),
    content: import_typebox3.Type.String({
      description: 'Text with color markup. Tags: [red], [green], [blue], [orange], [yellow], [purple], [grey], [bold], [bg:yellow]. Example: "Revenue [green]+15%[/green] YoY"'
    })
  })
]);

// src/core/extensions/feishu/src/docx-table-ops.ts
var MIN_COLUMN_WIDTH = 50;
var MAX_COLUMN_WIDTH = 400;
var DEFAULT_TABLE_WIDTH = 730;
function calculateAdaptiveColumnWidths(blocks, tableBlockId) {
  const tableBlock = blocks.find((b) => b.block_id === tableBlockId && b.block_type === 31);
  if (!tableBlock?.table?.property) {
    return [];
  }
  const { row_size, column_size, column_width: originalWidths } = tableBlock.table.property;
  const totalWidth = originalWidths && originalWidths.length > 0 ? originalWidths.reduce((a, b) => a + b, 0) : DEFAULT_TABLE_WIDTH;
  const cellIds = tableBlock.children || [];
  const blockMap = /* @__PURE__ */ new Map();
  for (const block of blocks) {
    blockMap.set(block.block_id, block);
  }
  function getCellText(cellId) {
    const cell = blockMap.get(cellId);
    if (!cell?.children) return "";
    let text = "";
    const childIds = Array.isArray(cell.children) ? cell.children : [cell.children];
    for (const childId of childIds) {
      const child = blockMap.get(childId);
      if (child?.text?.elements) {
        for (const elem of child.text.elements) {
          if (elem.text_run?.content) {
            text += elem.text_run.content;
          }
        }
      }
    }
    return text;
  }
  function getWeightedLength(text) {
    return [...text].reduce((sum, char) => {
      return sum + (char.charCodeAt(0) > 255 ? 2 : 1);
    }, 0);
  }
  const maxLengths = new Array(column_size).fill(0);
  for (let row = 0; row < row_size; row++) {
    for (let col = 0; col < column_size; col++) {
      const cellIndex = row * column_size + col;
      const cellId = cellIds[cellIndex];
      if (cellId) {
        const content = getCellText(cellId);
        const length = getWeightedLength(content);
        maxLengths[col] = Math.max(maxLengths[col], length);
      }
    }
  }
  const totalLength = maxLengths.reduce((a, b) => a + b, 0);
  if (totalLength === 0) {
    const equalWidth = Math.max(
      MIN_COLUMN_WIDTH,
      Math.min(MAX_COLUMN_WIDTH, Math.floor(totalWidth / column_size))
    );
    return new Array(column_size).fill(equalWidth);
  }
  let widths = maxLengths.map((len) => {
    const proportion = len / totalLength;
    return Math.round(proportion * totalWidth);
  });
  widths = widths.map((w) => Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, w)));
  let remaining = totalWidth - widths.reduce((a, b) => a + b, 0);
  while (remaining > 0) {
    const growable = widths.map((w, i) => w < MAX_COLUMN_WIDTH ? i : -1).filter((i) => i >= 0);
    if (growable.length === 0) break;
    const perColumn = Math.floor(remaining / growable.length);
    if (perColumn === 0) break;
    for (const i of growable) {
      const add = Math.min(perColumn, MAX_COLUMN_WIDTH - widths[i]);
      widths[i] += add;
      remaining -= add;
    }
  }
  return widths;
}
function cleanBlocksForDescendant(blocks) {
  const tableWidths = /* @__PURE__ */ new Map();
  for (const block of blocks) {
    if (block.block_type === 31) {
      const widths = calculateAdaptiveColumnWidths(blocks, block.block_id);
      tableWidths.set(block.block_id, widths);
    }
  }
  return blocks.map((block) => {
    const { parent_id: _parentId, ...cleanBlock } = block;
    if (cleanBlock.block_type === 32 && typeof cleanBlock.children === "string") {
      cleanBlock.children = [cleanBlock.children];
    }
    if (cleanBlock.block_type === 31 && cleanBlock.table) {
      const { cells: _cells, ...tableWithoutCells } = cleanBlock.table;
      const { row_size, column_size } = tableWithoutCells.property || {};
      const adaptiveWidths = tableWidths.get(block.block_id);
      cleanBlock.table = {
        property: {
          row_size,
          column_size,
          ...adaptiveWidths?.length && { column_width: adaptiveWidths }
        }
      };
    }
    return cleanBlock;
  });
}
async function insertTableRow(client, docToken, blockId, rowIndex = -1) {
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: { insert_table_row: { row_index: rowIndex } }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, block: res.data?.block };
}
async function insertTableColumn(client, docToken, blockId, columnIndex = -1) {
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: { insert_table_column: { column_index: columnIndex } }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, block: res.data?.block };
}
async function deleteTableRows(client, docToken, blockId, rowStart, rowCount = 1) {
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: { delete_table_rows: { row_start_index: rowStart, row_end_index: rowStart + rowCount } }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, rows_deleted: rowCount, block: res.data?.block };
}
async function deleteTableColumns(client, docToken, blockId, columnStart, columnCount = 1) {
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: {
      delete_table_columns: {
        column_start_index: columnStart,
        column_end_index: columnStart + columnCount
      }
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, columns_deleted: columnCount, block: res.data?.block };
}
async function mergeTableCells(client, docToken, blockId, rowStart, rowEnd, columnStart, columnEnd) {
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: {
      merge_table_cells: {
        row_start_index: rowStart,
        row_end_index: rowEnd,
        column_start_index: columnStart,
        column_end_index: columnEnd
      }
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, block: res.data?.block };
}

// src/core/extensions/feishu/src/docx-batch-insert.ts
var BATCH_SIZE = 1e3;
function collectDescendants(blockMap, rootId) {
  const result = [];
  const visited = /* @__PURE__ */ new Set();
  function collect(blockId) {
    if (visited.has(blockId)) return;
    visited.add(blockId);
    const block = blockMap.get(blockId);
    if (!block) return;
    result.push(block);
    const children = block.children;
    if (Array.isArray(children)) {
      for (const childId of children) {
        collect(childId);
      }
    } else if (typeof children === "string") {
      collect(children);
    }
  }
  collect(rootId);
  return result;
}
async function insertBatch(client, docToken, blocks, firstLevelBlockIds, parentBlockId = docToken, index = -1) {
  const descendants = cleanBlocksForDescendant(blocks);
  if (descendants.length === 0) {
    return [];
  }
  const res = await client.docx.documentBlockDescendant.create({
    path: { document_id: docToken, block_id: parentBlockId },
    data: {
      children_id: firstLevelBlockIds,
      descendants,
      index
    }
  });
  if (res.code !== 0) {
    throw new Error(`${res.msg} (code: ${res.code})`);
  }
  return res.data?.children ?? [];
}
async function insertBlocksInBatches(client, docToken, blocks, firstLevelBlockIds, logger, parentBlockId = docToken, startIndex = -1) {
  const allChildren = [];
  const batches = [];
  let currentBatch = { firstLevelIds: [], blocks: [] };
  const usedBlockIds = /* @__PURE__ */ new Set();
  const blockMap = /* @__PURE__ */ new Map();
  for (const block of blocks) {
    blockMap.set(block.block_id, block);
  }
  for (const firstLevelId of firstLevelBlockIds) {
    const descendants = collectDescendants(blockMap, firstLevelId);
    const newBlocks = descendants.filter((b) => !usedBlockIds.has(b.block_id));
    if (newBlocks.length > BATCH_SIZE) {
      throw new Error(
        `Block "${firstLevelId}" has ${newBlocks.length} descendants, which exceeds the Feishu API limit of ${BATCH_SIZE} blocks per request. Please split the content into smaller sections.`
      );
    }
    if (currentBatch.blocks.length + newBlocks.length > BATCH_SIZE && currentBatch.blocks.length > 0) {
      batches.push(currentBatch);
      currentBatch = { firstLevelIds: [], blocks: [] };
    }
    currentBatch.firstLevelIds.push(firstLevelId);
    for (const block of newBlocks) {
      currentBatch.blocks.push(block);
      usedBlockIds.add(block.block_id);
    }
  }
  if (currentBatch.blocks.length > 0) {
    batches.push(currentBatch);
  }
  let currentIndex = startIndex;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    logger?.info?.(
      `feishu_doc: Inserting batch ${i + 1}/${batches.length} (${batch.blocks.length} blocks)...`
    );
    const children = await insertBatch(
      client,
      docToken,
      batch.blocks,
      batch.firstLevelIds,
      parentBlockId,
      currentIndex
    );
    allChildren.push(...children);
    if (currentIndex !== -1) {
      currentIndex += batch.firstLevelIds.length;
    }
  }
  return { children: allChildren, skipped: [] };
}

// src/core/extensions/feishu/src/docx-color-text.ts
var TEXT_COLOR = {
  red: 1,
  // Pink (closest to red in Feishu)
  orange: 2,
  yellow: 3,
  green: 4,
  blue: 5,
  purple: 6,
  grey: 7,
  gray: 7
};
var BACKGROUND_COLOR = {
  red: 1,
  orange: 2,
  yellow: 3,
  green: 4,
  blue: 5,
  purple: 6,
  grey: 7,
  gray: 7
};
function parseColorMarkup(content) {
  const segments = [];
  const KNOWN = "(?:bg:[a-z]+|bold|red|orange|yellow|green|blue|purple|gr[ae]y)";
  const tagPattern = new RegExp(
    `\\[(${KNOWN}(?:\\s+${KNOWN})*)\\](.*?)\\[\\/(?:[^\\]]+)\\]|([^[]+|\\[)`,
    "gis"
  );
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    if (match[3] !== void 0) {
      if (match[3]) {
        segments.push({ text: match[3] });
      }
    } else {
      const tagStr = match[1].toLowerCase().trim();
      const text = match[2];
      const tags = tagStr.split(/\s+/);
      const segment = { text };
      for (const tag of tags) {
        if (tag.startsWith("bg:")) {
          const color = tag.slice(3);
          if (BACKGROUND_COLOR[color]) {
            segment.bgColor = BACKGROUND_COLOR[color];
          }
        } else if (tag === "bold") {
          segment.bold = true;
        } else if (TEXT_COLOR[tag]) {
          segment.textColor = TEXT_COLOR[tag];
        }
      }
      if (text) {
        segments.push(segment);
      }
    }
  }
  return segments;
}
async function updateColorText(client, docToken, blockId, content) {
  const segments = parseColorMarkup(content);
  const elements = segments.map((seg) => ({
    text_run: {
      content: seg.text,
      text_element_style: {
        ...seg.textColor && { text_color: seg.textColor },
        ...seg.bgColor && { background_color: seg.bgColor },
        ...seg.bold && { bold: true }
      }
    }
  }));
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: { update_text_elements: { elements } }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    segments: segments.length,
    block: res.data?.block
  };
}

// src/core/extensions/feishu/src/docx.ts
init_runtime();
function json3(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data
  };
}
function extractImageUrls(markdown) {
  const regex = /!\[[^\]]*\]\(([^)]+)\)/g;
  const urls = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const url = match[1].trim();
    if (url.startsWith("http://") || url.startsWith("https://")) {
      urls.push(url);
    }
  }
  return urls;
}
var BLOCK_TYPE_NAMES = {
  1: "Page",
  2: "Text",
  3: "Heading1",
  4: "Heading2",
  5: "Heading3",
  12: "Bullet",
  13: "Ordered",
  14: "Code",
  15: "Quote",
  17: "Todo",
  18: "Bitable",
  21: "Diagram",
  22: "Divider",
  23: "File",
  27: "Image",
  30: "Sheet",
  31: "Table",
  32: "TableCell"
};
var UNSUPPORTED_CREATE_TYPES = /* @__PURE__ */ new Set([31, 32]);
function cleanBlocksForInsert(blocks) {
  const skipped = [];
  const cleaned = blocks.filter((block) => {
    if (UNSUPPORTED_CREATE_TYPES.has(block.block_type)) {
      const typeName = BLOCK_TYPE_NAMES[block.block_type] || `type_${block.block_type}`;
      skipped.push(typeName);
      return false;
    }
    return true;
  }).map((block) => {
    if (block.block_type === 31 && block.table?.merge_info) {
      const { merge_info: _merge_info, ...tableRest } = block.table;
      return { ...block, table: tableRest };
    }
    return block;
  });
  return { cleaned, skipped };
}
var MAX_CONVERT_RETRY_DEPTH = 8;
async function convertMarkdown(client, markdown) {
  const res = await client.docx.document.convert({
    data: { content_type: "markdown", content: markdown }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    blocks: res.data?.blocks ?? [],
    firstLevelBlockIds: res.data?.first_level_block_ids ?? []
  };
}
function sortBlocksByFirstLevel(blocks, firstLevelIds) {
  if (!firstLevelIds || firstLevelIds.length === 0) return blocks;
  const sorted = firstLevelIds.map((id) => blocks.find((b) => b.block_id === id)).filter(Boolean);
  const sortedIds = new Set(firstLevelIds);
  const remaining = blocks.filter((b) => !sortedIds.has(b.block_id));
  return [...sorted, ...remaining];
}
async function insertBlocks(client, docToken, blocks, parentBlockId, index) {
  const { cleaned, skipped } = cleanBlocksForInsert(blocks);
  const blockId = parentBlockId ?? docToken;
  if (cleaned.length === 0) {
    return { children: [], skipped };
  }
  const allInserted = [];
  for (const [offset, block] of cleaned.entries()) {
    const res = await client.docx.documentBlockChildren.create({
      path: { document_id: docToken, block_id: blockId },
      data: {
        children: [block],
        ...index !== void 0 ? { index: index + offset } : {}
      }
    });
    if (res.code !== 0) {
      throw new Error(res.msg);
    }
    allInserted.push(...res.data?.children ?? []);
  }
  return { children: allInserted, skipped };
}
function splitMarkdownByHeadings(markdown) {
  const lines = markdown.split("\n");
  const chunks = [];
  let current = [];
  let inFencedBlock = false;
  for (const line of lines) {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFencedBlock = !inFencedBlock;
    }
    if (!inFencedBlock && /^#{1,2}\s/.test(line) && current.length > 0) {
      chunks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) {
    chunks.push(current.join("\n"));
  }
  return chunks;
}
function splitMarkdownBySize(markdown, maxChars) {
  if (markdown.length <= maxChars) {
    return [markdown];
  }
  const lines = markdown.split("\n");
  const chunks = [];
  let current = [];
  let currentLength = 0;
  let inFencedBlock = false;
  for (const line of lines) {
    if (/^(`{3,}|~{3,})/.test(line)) {
      inFencedBlock = !inFencedBlock;
    }
    const lineLength = line.length + 1;
    const wouldExceed = currentLength + lineLength > maxChars;
    if (current.length > 0 && wouldExceed && !inFencedBlock) {
      chunks.push(current.join("\n"));
      current = [];
      currentLength = 0;
    }
    current.push(line);
    currentLength += lineLength;
  }
  if (current.length > 0) {
    chunks.push(current.join("\n"));
  }
  if (chunks.length > 1) {
    return chunks;
  }
  const midpoint = Math.floor(lines.length / 2);
  if (midpoint <= 0 || midpoint >= lines.length) {
    return [markdown];
  }
  return [lines.slice(0, midpoint).join("\n"), lines.slice(midpoint).join("\n")];
}
async function convertMarkdownWithFallback(client, markdown, depth = 0) {
  try {
    return await convertMarkdown(client, markdown);
  } catch (error) {
    if (depth >= MAX_CONVERT_RETRY_DEPTH || markdown.length < 2) {
      throw error;
    }
    const splitTarget = Math.max(256, Math.floor(markdown.length / 2));
    const chunks = splitMarkdownBySize(markdown, splitTarget);
    if (chunks.length <= 1) {
      throw error;
    }
    const blocks = [];
    const firstLevelBlockIds = [];
    for (const chunk of chunks) {
      const converted = await convertMarkdownWithFallback(client, chunk, depth + 1);
      blocks.push(...converted.blocks);
      firstLevelBlockIds.push(...converted.firstLevelBlockIds);
    }
    return { blocks, firstLevelBlockIds };
  }
}
async function chunkedConvertMarkdown(client, markdown) {
  const chunks = splitMarkdownByHeadings(markdown);
  const allBlocks = [];
  const allFirstLevelBlockIds = [];
  for (const chunk of chunks) {
    const { blocks, firstLevelBlockIds } = await convertMarkdownWithFallback(client, chunk);
    const sorted = sortBlocksByFirstLevel(blocks, firstLevelBlockIds);
    allBlocks.push(...sorted);
    allFirstLevelBlockIds.push(...firstLevelBlockIds);
  }
  return { blocks: allBlocks, firstLevelBlockIds: allFirstLevelBlockIds };
}
async function insertBlocksWithDescendant(client, docToken, blocks, firstLevelBlockIds, { parentBlockId = docToken, index = -1 } = {}) {
  const descendants = cleanBlocksForDescendant(blocks);
  if (descendants.length === 0) {
    return { children: [] };
  }
  const res = await client.docx.documentBlockDescendant.create({
    path: { document_id: docToken, block_id: parentBlockId },
    data: { children_id: firstLevelBlockIds, descendants, index }
  });
  if (res.code !== 0) {
    throw new Error(`${res.msg} (code: ${res.code})`);
  }
  return { children: res.data?.children ?? [] };
}
async function clearDocumentContent(client, docToken) {
  const existing = await client.docx.documentBlock.list({
    path: { document_id: docToken }
  });
  if (existing.code !== 0) {
    throw new Error(existing.msg);
  }
  const childIds = existing.data?.items?.filter((b) => b.parent_id === docToken && b.block_type !== 1).map((b) => b.block_id) ?? [];
  if (childIds.length > 0) {
    const res = await client.docx.documentBlockChildren.batchDelete({
      path: { document_id: docToken, block_id: docToken },
      data: { start_index: 0, end_index: childIds.length }
    });
    if (res.code !== 0) {
      throw new Error(res.msg);
    }
  }
  return childIds.length;
}
async function uploadImageToDocx(client, blockId, imageBuffer, fileName, docToken) {
  const res = await client.drive.media.uploadAll({
    data: {
      file_name: fileName,
      parent_type: "docx_image",
      parent_node: blockId,
      size: imageBuffer.length,
      // Pass Buffer directly so form-data can calculate Content-Length correctly.
      // Readable.from() produces a stream with unknown length, causing Content-Length
      // mismatch that silently truncates uploads for images larger than ~1KB.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK file type
      file: imageBuffer,
      // Required when the document block belongs to a non-default datacenter:
      // tells the drive service which document the block belongs to for routing.
      // Per API docs: certain upload scenarios require the cloud document token.
      ...docToken ? { extra: JSON.stringify({ drive_route_token: docToken }) } : {}
    }
  });
  const fileToken = res?.file_token;
  if (!fileToken) {
    throw new Error("Image upload failed: no file_token returned");
  }
  return fileToken;
}
async function downloadImage(url, maxBytes) {
  const fetched = await getFeishuRuntime().channel.media.fetchRemoteMedia({ url, maxBytes });
  return fetched.buffer;
}
async function resolveUploadInput(url, filePath, maxBytes, explicitFileName, imageInput) {
  const inputSources = [url ? "url" : null, filePath ? "file_path" : null, imageInput ? "image" : null].filter(Boolean);
  if (inputSources.length > 1) {
    throw new Error(`Provide only one image source; got: ${inputSources.join(", ")}`);
  }
  if (imageInput?.startsWith("data:")) {
    const commaIdx = imageInput.indexOf(",");
    if (commaIdx === -1) {
      throw new Error("Invalid data URI: missing comma separator.");
    }
    const header = imageInput.slice(0, commaIdx);
    const data = imageInput.slice(commaIdx + 1);
    if (!header.includes(";base64")) {
      throw new Error(
        `Invalid data URI: missing ';base64' marker. Expected format: data:image/png;base64,<base64data>`
      );
    }
    const trimmedData = data.trim();
    if (trimmedData.length === 0 || !/^[A-Za-z0-9+/]+=*$/.test(trimmedData)) {
      throw new Error(
        `Invalid data URI: base64 payload contains characters outside the standard alphabet.`
      );
    }
    const mimeMatch = header.match(/data:([^;]+)/);
    const ext = mimeMatch?.[1]?.split("/")[1] ?? "png";
    const estimatedBytes = Math.ceil(trimmedData.length * 3 / 4);
    if (estimatedBytes > maxBytes) {
      throw new Error(
        `Image data URI exceeds limit: estimated ${estimatedBytes} bytes > ${maxBytes} bytes`
      );
    }
    const buffer2 = Buffer.from(trimmedData, "base64");
    return { buffer: buffer2, fileName: explicitFileName ?? `image.${ext}` };
  }
  if (imageInput) {
    const candidate = imageInput.startsWith("~") ? imageInput.replace(/^~/, (0, import_node_os3.homedir)()) : imageInput;
    const unambiguousPath = imageInput.startsWith("~") || imageInput.startsWith("./") || imageInput.startsWith("../");
    const absolutePath = (0, import_node_path3.isAbsolute)(imageInput);
    if (unambiguousPath || absolutePath && (0, import_node_fs2.existsSync)(candidate)) {
      const buffer2 = await import_node_fs2.promises.readFile(candidate);
      if (buffer2.length > maxBytes) {
        throw new Error(`Local file exceeds limit: ${buffer2.length} bytes > ${maxBytes} bytes`);
      }
      return { buffer: buffer2, fileName: explicitFileName ?? (0, import_node_path4.basename)(candidate) };
    }
    if (absolutePath && !(0, import_node_fs2.existsSync)(candidate)) {
      throw new Error(
        `File not found: "${candidate}". If you intended to pass image binary data, use a data URI instead: data:image/jpeg;base64,...`
      );
    }
  }
  if (imageInput) {
    const trimmed = imageInput.trim();
    if (trimmed.length === 0 || !/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
      throw new Error(
        `Invalid base64: image input contains characters outside the standard base64 alphabet. Use a data URI (data:image/png;base64,...) or a local file path instead.`
      );
    }
    const estimatedBytes = Math.ceil(trimmed.length * 3 / 4);
    if (estimatedBytes > maxBytes) {
      throw new Error(
        `Base64 image exceeds limit: estimated ${estimatedBytes} bytes > ${maxBytes} bytes`
      );
    }
    const buffer2 = Buffer.from(trimmed, "base64");
    if (buffer2.length === 0) {
      throw new Error("Base64 image decoded to empty buffer; check the input.");
    }
    return { buffer: buffer2, fileName: explicitFileName ?? "image.png" };
  }
  if (!url && !filePath) {
    throw new Error("Either url, file_path, or image (base64/data URI) must be provided");
  }
  if (url && filePath) {
    throw new Error("Provide only one of url or file_path");
  }
  if (url) {
    const fetched = await getFeishuRuntime().channel.media.fetchRemoteMedia({ url, maxBytes });
    const urlPath = new URL(url).pathname;
    const guessed = urlPath.split("/").pop() || "upload.bin";
    return {
      buffer: fetched.buffer,
      fileName: explicitFileName || guessed
    };
  }
  const buffer = await import_node_fs2.promises.readFile(filePath);
  if (buffer.length > maxBytes) {
    throw new Error(`Local file exceeds limit: ${buffer.length} bytes > ${maxBytes} bytes`);
  }
  return {
    buffer,
    fileName: explicitFileName || (0, import_node_path4.basename)(filePath)
  };
}
async function processImages(client, docToken, markdown, insertedBlocks, maxBytes) {
  const imageUrls = extractImageUrls(markdown);
  if (imageUrls.length === 0) {
    return 0;
  }
  const imageBlocks = insertedBlocks.filter((b) => b.block_type === 27);
  let processed = 0;
  for (let i = 0; i < Math.min(imageUrls.length, imageBlocks.length); i++) {
    const url = imageUrls[i];
    const blockId = imageBlocks[i].block_id;
    try {
      const buffer = await downloadImage(url, maxBytes);
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop() || `image_${i}.png`;
      const fileToken = await uploadImageToDocx(client, blockId, buffer, fileName, docToken);
      await client.docx.documentBlock.patch({
        path: { document_id: docToken, block_id: blockId },
        data: {
          replace_image: { token: fileToken }
        }
      });
      processed++;
    } catch (err) {
      console.error(`Failed to process image ${url}:`, err);
    }
  }
  return processed;
}
async function uploadImageBlock(client, docToken, maxBytes, url, filePath, parentBlockId, filename, index, imageInput) {
  const insertRes = await client.docx.documentBlockChildren.create({
    path: { document_id: docToken, block_id: parentBlockId ?? docToken },
    params: { document_revision_id: -1 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK type
    data: { children: [{ block_type: 27, image: {} }], index: index ?? -1 }
  });
  if (insertRes.code !== 0) {
    throw new Error(`Failed to create image block: ${insertRes.msg}`);
  }
  const imageBlockId = insertRes.data?.children?.find((b) => b.block_type === 27)?.block_id;
  if (!imageBlockId) {
    throw new Error("Failed to create image block");
  }
  const upload = await resolveUploadInput(url, filePath, maxBytes, filename, imageInput);
  const fileToken = await uploadImageToDocx(
    client,
    imageBlockId,
    upload.buffer,
    upload.fileName,
    docToken
    // drive_route_token for multi-datacenter routing
  );
  const patchRes = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: imageBlockId },
    data: { replace_image: { token: fileToken } }
  });
  if (patchRes.code !== 0) {
    throw new Error(patchRes.msg);
  }
  return {
    success: true,
    block_id: imageBlockId,
    file_token: fileToken,
    file_name: upload.fileName,
    size: upload.buffer.length
  };
}
async function uploadFileBlock(client, docToken, maxBytes, url, filePath, parentBlockId, filename) {
  const blockId = parentBlockId ?? docToken;
  const upload = await resolveUploadInput(url, filePath, maxBytes, filename);
  const placeholderMd = `[${upload.fileName}](https://example.com/placeholder)`;
  const converted = await convertMarkdown(client, placeholderMd);
  const sorted = sortBlocksByFirstLevel(converted.blocks, converted.firstLevelBlockIds);
  const { children: inserted } = await insertBlocks(client, docToken, sorted, blockId);
  const placeholderBlock = inserted[0];
  if (!placeholderBlock?.block_id) {
    throw new Error("Failed to create placeholder block for file upload");
  }
  const parentId = placeholderBlock.parent_id ?? blockId;
  const childrenRes = await client.docx.documentBlockChildren.get({
    path: { document_id: docToken, block_id: parentId }
  });
  if (childrenRes.code !== 0) {
    throw new Error(childrenRes.msg);
  }
  const items = childrenRes.data?.items ?? [];
  const placeholderIdx = items.findIndex(
    (item) => item.block_id === placeholderBlock.block_id
  );
  if (placeholderIdx >= 0) {
    const deleteRes = await client.docx.documentBlockChildren.batchDelete({
      path: { document_id: docToken, block_id: parentId },
      data: { start_index: placeholderIdx, end_index: placeholderIdx + 1 }
    });
    if (deleteRes.code !== 0) {
      throw new Error(deleteRes.msg);
    }
  }
  const fileRes = await client.drive.media.uploadAll({
    data: {
      file_name: upload.fileName,
      parent_type: "docx_file",
      parent_node: docToken,
      size: upload.buffer.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK file type
      file: upload.buffer
    }
  });
  const fileToken = fileRes?.file_token;
  if (!fileToken) {
    throw new Error("File upload failed: no file_token returned");
  }
  return {
    success: true,
    file_token: fileToken,
    file_name: upload.fileName,
    size: upload.buffer.length,
    note: "File uploaded to drive. Use the file_token to reference it. Direct file block creation is not supported by the Feishu API."
  };
}
var STRUCTURED_BLOCK_TYPES = /* @__PURE__ */ new Set([14, 18, 21, 23, 27, 30, 31, 32]);
async function readDoc(client, docToken) {
  const [contentRes, infoRes, blocksRes] = await Promise.all([
    client.docx.document.rawContent({ path: { document_id: docToken } }),
    client.docx.document.get({ path: { document_id: docToken } }),
    client.docx.documentBlock.list({ path: { document_id: docToken } })
  ]);
  if (contentRes.code !== 0) {
    throw new Error(contentRes.msg);
  }
  const blocks = blocksRes.data?.items ?? [];
  const blockCounts = {};
  const structuredTypes = [];
  for (const b of blocks) {
    const type = b.block_type ?? 0;
    const name = BLOCK_TYPE_NAMES[type] || `type_${type}`;
    blockCounts[name] = (blockCounts[name] || 0) + 1;
    if (STRUCTURED_BLOCK_TYPES.has(type) && !structuredTypes.includes(name)) {
      structuredTypes.push(name);
    }
  }
  let hint;
  if (structuredTypes.length > 0) {
    hint = `This document contains ${structuredTypes.join(", ")} which are NOT included in the plain text above. Use feishu_doc with action: "list_blocks" to get full content.`;
  }
  return {
    title: infoRes.data?.document?.title,
    content: contentRes.data?.content,
    revision_id: infoRes.data?.document?.revision_id,
    block_count: blocks.length,
    block_types: blockCounts,
    ...hint && { hint }
  };
}
async function createDoc(client, title, folderToken, options) {
  const res = await client.docx.document.create({
    data: { title, folder_token: folderToken }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const doc = res.data?.document;
  const docToken = doc?.document_id;
  if (!docToken) {
    throw new Error("Document creation succeeded but no document_id was returned");
  }
  const shouldGrantToRequester = options?.grantToRequester !== false;
  const requesterOpenId = options?.requesterOpenId?.trim();
  const requesterPermType = "edit";
  let requesterPermissionAdded = false;
  let requesterPermissionSkippedReason;
  let requesterPermissionError;
  if (shouldGrantToRequester) {
    if (!requesterOpenId) {
      requesterPermissionSkippedReason = "trusted requester identity unavailable";
    } else {
      try {
        await client.drive.permissionMember.create({
          path: { token: docToken },
          params: { type: "docx", need_notification: false },
          data: {
            member_type: "openid",
            member_id: requesterOpenId,
            perm: requesterPermType
          }
        });
        requesterPermissionAdded = true;
      } catch (err) {
        requesterPermissionError = err instanceof Error ? err.message : String(err);
      }
    }
  }
  return {
    document_id: docToken,
    title: doc?.title,
    url: `https://feishu.cn/docx/${docToken}`,
    ...shouldGrantToRequester && {
      requester_permission_added: requesterPermissionAdded,
      ...requesterOpenId && { requester_open_id: requesterOpenId },
      requester_perm_type: requesterPermType,
      ...requesterPermissionSkippedReason && {
        requester_permission_skipped_reason: requesterPermissionSkippedReason
      },
      ...requesterPermissionError && { requester_permission_error: requesterPermissionError }
    }
  };
}
async function writeDoc(client, docToken, markdown, maxBytes, logger) {
  const deleted = await clearDocumentContent(client, docToken);
  logger?.info?.("feishu_doc: Converting markdown...");
  const { blocks, firstLevelBlockIds } = await chunkedConvertMarkdown(client, markdown);
  if (blocks.length === 0) {
    return { success: true, blocks_deleted: deleted, blocks_added: 0, images_processed: 0 };
  }
  logger?.info?.(`feishu_doc: Converted to ${blocks.length} blocks, inserting...`);
  const sortedBlocks = sortBlocksByFirstLevel(blocks, firstLevelBlockIds);
  const { children: inserted } = blocks.length > BATCH_SIZE ? await insertBlocksInBatches(client, docToken, sortedBlocks, firstLevelBlockIds, logger) : await insertBlocksWithDescendant(client, docToken, sortedBlocks, firstLevelBlockIds);
  const imagesProcessed = await processImages(client, docToken, markdown, inserted, maxBytes);
  logger?.info?.(`feishu_doc: Done (${blocks.length} blocks, ${imagesProcessed} images)`);
  return {
    success: true,
    blocks_deleted: deleted,
    blocks_added: blocks.length,
    images_processed: imagesProcessed
  };
}
async function appendDoc(client, docToken, markdown, maxBytes, logger) {
  logger?.info?.("feishu_doc: Converting markdown...");
  const { blocks, firstLevelBlockIds } = await chunkedConvertMarkdown(client, markdown);
  if (blocks.length === 0) {
    throw new Error("Content is empty");
  }
  logger?.info?.(`feishu_doc: Converted to ${blocks.length} blocks, inserting...`);
  const sortedBlocks = sortBlocksByFirstLevel(blocks, firstLevelBlockIds);
  const { children: inserted } = blocks.length > BATCH_SIZE ? await insertBlocksInBatches(client, docToken, sortedBlocks, firstLevelBlockIds, logger) : await insertBlocksWithDescendant(client, docToken, sortedBlocks, firstLevelBlockIds);
  const imagesProcessed = await processImages(client, docToken, markdown, inserted, maxBytes);
  logger?.info?.(`feishu_doc: Done (${blocks.length} blocks, ${imagesProcessed} images)`);
  return {
    success: true,
    blocks_added: blocks.length,
    images_processed: imagesProcessed,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK block type
    block_ids: inserted.map((b) => b.block_id)
  };
}
async function insertDoc(client, docToken, markdown, afterBlockId, maxBytes, logger) {
  const blockInfo = await client.docx.documentBlock.get({
    path: { document_id: docToken, block_id: afterBlockId }
  });
  if (blockInfo.code !== 0) throw new Error(blockInfo.msg);
  const parentId = blockInfo.data?.block?.parent_id ?? docToken;
  const items = [];
  let pageToken;
  do {
    const childrenRes = await client.docx.documentBlockChildren.get({
      path: { document_id: docToken, block_id: parentId },
      params: pageToken ? { page_token: pageToken } : {}
    });
    if (childrenRes.code !== 0) throw new Error(childrenRes.msg);
    items.push(...childrenRes.data?.items ?? []);
    pageToken = childrenRes.data?.page_token ?? void 0;
  } while (pageToken);
  const blockIndex = items.findIndex((item) => item.block_id === afterBlockId);
  if (blockIndex === -1) {
    throw new Error(
      `after_block_id "${afterBlockId}" was not found among the children of parent block "${parentId}". Use list_blocks to verify the block ID.`
    );
  }
  const insertIndex = blockIndex + 1;
  logger?.info?.("feishu_doc: Converting markdown...");
  const { blocks, firstLevelBlockIds } = await chunkedConvertMarkdown(client, markdown);
  if (blocks.length === 0) throw new Error("Content is empty");
  const sortedBlocks = sortBlocksByFirstLevel(blocks, firstLevelBlockIds);
  logger?.info?.(
    `feishu_doc: Converted to ${blocks.length} blocks, inserting at index ${insertIndex}...`
  );
  const { children: inserted } = blocks.length > BATCH_SIZE ? await insertBlocksInBatches(
    client,
    docToken,
    sortedBlocks,
    firstLevelBlockIds,
    logger,
    parentId,
    insertIndex
  ) : await insertBlocksWithDescendant(client, docToken, sortedBlocks, firstLevelBlockIds, {
    parentBlockId: parentId,
    index: insertIndex
  });
  const imagesProcessed = await processImages(client, docToken, markdown, inserted, maxBytes);
  logger?.info?.(`feishu_doc: Done (${blocks.length} blocks, ${imagesProcessed} images)`);
  return {
    success: true,
    blocks_added: blocks.length,
    images_processed: imagesProcessed,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK block type
    block_ids: inserted.map((b) => b.block_id)
  };
}
async function createTable(client, docToken, rowSize, columnSize, parentBlockId, columnWidth) {
  if (columnWidth && columnWidth.length !== columnSize) {
    throw new Error("column_width length must equal column_size");
  }
  const blockId = parentBlockId ?? docToken;
  const res = await client.docx.documentBlockChildren.create({
    path: { document_id: docToken, block_id: blockId },
    data: {
      children: [
        {
          block_type: 31,
          table: {
            property: {
              row_size: rowSize,
              column_size: columnSize,
              ...columnWidth && columnWidth.length > 0 ? { column_width: columnWidth } : {}
            }
          }
        }
      ]
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const tableBlock = res.data?.children?.find((b) => b.block_type === 31);
  const cells = tableBlock?.children ?? [];
  return {
    success: true,
    table_block_id: tableBlock?.block_id,
    row_size: rowSize,
    column_size: columnSize,
    // row-major cell ids, if API returns them directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- SDK return type
    table_cell_block_ids: cells.map((c) => c.block_id).filter(Boolean),
    raw_children_count: res.data?.children?.length ?? 0
  };
}
async function writeTableCells(client, docToken, tableBlockId, values) {
  if (!values.length || !values[0]?.length) {
    throw new Error("values must be a non-empty 2D array");
  }
  const tableRes = await client.docx.documentBlock.get({
    path: { document_id: docToken, block_id: tableBlockId }
  });
  if (tableRes.code !== 0) {
    throw new Error(tableRes.msg);
  }
  const tableBlock = tableRes.data?.block;
  if (tableBlock?.block_type !== 31) {
    throw new Error("table_block_id is not a table block");
  }
  const tableData = tableBlock.table;
  const rows = tableData?.property?.row_size;
  const cols = tableData?.property?.column_size;
  const cellIds = tableData?.cells ?? [];
  if (!rows || !cols || !cellIds.length) {
    throw new Error(
      "Table cell IDs unavailable from table block. Use list_blocks/get_block and pass explicit cell block IDs if needed."
    );
  }
  const writeRows = Math.min(values.length, rows);
  let written = 0;
  for (let r = 0; r < writeRows; r++) {
    const rowValues = values[r] ?? [];
    const writeCols = Math.min(rowValues.length, cols);
    for (let c = 0; c < writeCols; c++) {
      const cellId = cellIds[r * cols + c];
      if (!cellId) continue;
      const childrenRes = await client.docx.documentBlockChildren.get({
        path: { document_id: docToken, block_id: cellId }
      });
      if (childrenRes.code !== 0) {
        throw new Error(childrenRes.msg);
      }
      const existingChildren = childrenRes.data?.items ?? [];
      if (existingChildren.length > 0) {
        const delRes = await client.docx.documentBlockChildren.batchDelete({
          path: { document_id: docToken, block_id: cellId },
          data: { start_index: 0, end_index: existingChildren.length }
        });
        if (delRes.code !== 0) {
          throw new Error(delRes.msg);
        }
      }
      const text = rowValues[c] ?? "";
      const converted = await convertMarkdown(client, text);
      const sorted = sortBlocksByFirstLevel(converted.blocks, converted.firstLevelBlockIds);
      if (sorted.length > 0) {
        await insertBlocks(client, docToken, sorted, cellId);
      }
      written++;
    }
  }
  return {
    success: true,
    table_block_id: tableBlockId,
    cells_written: written,
    table_size: { rows, cols }
  };
}
async function createTableWithValues(client, docToken, rowSize, columnSize, values, parentBlockId, columnWidth) {
  const created = await createTable(
    client,
    docToken,
    rowSize,
    columnSize,
    parentBlockId,
    columnWidth
  );
  const tableBlockId = created.table_block_id;
  if (!tableBlockId) {
    throw new Error("create_table succeeded but table_block_id is missing");
  }
  const written = await writeTableCells(client, docToken, tableBlockId, values);
  return {
    success: true,
    table_block_id: tableBlockId,
    row_size: rowSize,
    column_size: columnSize,
    cells_written: written.cells_written
  };
}
async function updateBlock(client, docToken, blockId, content) {
  const blockInfo = await client.docx.documentBlock.get({
    path: { document_id: docToken, block_id: blockId }
  });
  if (blockInfo.code !== 0) {
    throw new Error(blockInfo.msg);
  }
  const res = await client.docx.documentBlock.patch({
    path: { document_id: docToken, block_id: blockId },
    data: {
      update_text_elements: {
        elements: [{ text_run: { content } }]
      }
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, block_id: blockId };
}
async function deleteBlock(client, docToken, blockId) {
  const blockInfo = await client.docx.documentBlock.get({
    path: { document_id: docToken, block_id: blockId }
  });
  if (blockInfo.code !== 0) {
    throw new Error(blockInfo.msg);
  }
  const parentId = blockInfo.data?.block?.parent_id ?? docToken;
  const children = await client.docx.documentBlockChildren.get({
    path: { document_id: docToken, block_id: parentId }
  });
  if (children.code !== 0) {
    throw new Error(children.msg);
  }
  const items = children.data?.items ?? [];
  const index = items.findIndex((item) => item.block_id === blockId);
  if (index === -1) {
    throw new Error("Block not found");
  }
  const res = await client.docx.documentBlockChildren.batchDelete({
    path: { document_id: docToken, block_id: parentId },
    data: { start_index: index, end_index: index + 1 }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return { success: true, deleted_block_id: blockId };
}
async function listBlocks(client, docToken) {
  const res = await client.docx.documentBlock.list({
    path: { document_id: docToken }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    blocks: res.data?.items ?? []
  };
}
async function getBlock(client, docToken, blockId) {
  const res = await client.docx.documentBlock.get({
    path: { document_id: docToken, block_id: blockId }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    block: res.data?.block
  };
}
async function listAppScopes(client) {
  const res = await client.application.scope.list({});
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const scopes = res.data?.scopes ?? [];
  const granted = scopes.filter((s) => s.grant_status === 1);
  const pending = scopes.filter((s) => s.grant_status !== 1);
  return {
    granted: granted.map((s) => ({ name: s.scope_name, type: s.scope_type })),
    pending: pending.map((s) => ({ name: s.scope_name, type: s.scope_type })),
    summary: `${granted.length} granted, ${pending.length} pending`
  };
}
function registerFeishuDocTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_doc: No config available, skipping doc tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_doc: No Feishu accounts configured, skipping doc tools");
    return;
  }
  const toolsCfg = resolveAnyEnabledFeishuToolsConfig(accounts);
  const registered = [];
  const getClient = (params, defaultAccountId) => createFeishuToolClient({ api, executeParams: params, defaultAccountId });
  const getMediaMaxBytes = (params, defaultAccountId) => (resolveFeishuToolAccount({ api, executeParams: params, defaultAccountId }).config?.mediaMaxMb ?? 30) * 1024 * 1024;
  if (toolsCfg.doc) {
    api.registerTool(
      (ctx) => {
        const defaultAccountId = ctx.agentAccountId;
        const trustedRequesterOpenId = ctx.messageChannel === "feishu" ? ctx.requesterSenderId?.trim() || void 0 : void 0;
        return {
          name: "feishu_doc",
          label: "Feishu Doc",
          description: "Feishu document operations. Actions: read, write, append, insert, create, list_blocks, get_block, update_block, delete_block, create_table, write_table_cells, create_table_with_values, insert_table_row, insert_table_column, delete_table_rows, delete_table_columns, merge_table_cells, upload_image, upload_file, color_text",
          parameters: FeishuDocSchema,
          async execute(_toolCallId, params) {
            const p = params;
            try {
              const client = getClient(p, defaultAccountId);
              switch (p.action) {
                case "read":
                  return json3(await readDoc(client, p.doc_token));
                case "write":
                  return json3(
                    await writeDoc(
                      client,
                      p.doc_token,
                      p.content,
                      getMediaMaxBytes(p, defaultAccountId),
                      api.logger
                    )
                  );
                case "append":
                  return json3(
                    await appendDoc(
                      client,
                      p.doc_token,
                      p.content,
                      getMediaMaxBytes(p, defaultAccountId),
                      api.logger
                    )
                  );
                case "insert":
                  return json3(
                    await insertDoc(
                      client,
                      p.doc_token,
                      p.content,
                      p.after_block_id,
                      getMediaMaxBytes(p, defaultAccountId),
                      api.logger
                    )
                  );
                case "create":
                  return json3(
                    await createDoc(client, p.title, p.folder_token, {
                      grantToRequester: p.grant_to_requester,
                      requesterOpenId: trustedRequesterOpenId
                    })
                  );
                case "list_blocks":
                  return json3(await listBlocks(client, p.doc_token));
                case "get_block":
                  return json3(await getBlock(client, p.doc_token, p.block_id));
                case "update_block":
                  return json3(await updateBlock(client, p.doc_token, p.block_id, p.content));
                case "delete_block":
                  return json3(await deleteBlock(client, p.doc_token, p.block_id));
                case "create_table":
                  return json3(
                    await createTable(
                      client,
                      p.doc_token,
                      p.row_size,
                      p.column_size,
                      p.parent_block_id,
                      p.column_width
                    )
                  );
                case "write_table_cells":
                  return json3(
                    await writeTableCells(client, p.doc_token, p.table_block_id, p.values)
                  );
                case "create_table_with_values":
                  return json3(
                    await createTableWithValues(
                      client,
                      p.doc_token,
                      p.row_size,
                      p.column_size,
                      p.values,
                      p.parent_block_id,
                      p.column_width
                    )
                  );
                case "upload_image":
                  return json3(
                    await uploadImageBlock(
                      client,
                      p.doc_token,
                      getMediaMaxBytes(p, defaultAccountId),
                      p.url,
                      p.file_path,
                      p.parent_block_id,
                      p.filename,
                      p.index,
                      p.image
                      // data URI or plain base64
                    )
                  );
                case "upload_file":
                  return json3(
                    await uploadFileBlock(
                      client,
                      p.doc_token,
                      getMediaMaxBytes(p, defaultAccountId),
                      p.url,
                      p.file_path,
                      p.parent_block_id,
                      p.filename
                    )
                  );
                case "color_text":
                  return json3(await updateColorText(client, p.doc_token, p.block_id, p.content));
                case "insert_table_row":
                  return json3(await insertTableRow(client, p.doc_token, p.block_id, p.row_index));
                case "insert_table_column":
                  return json3(
                    await insertTableColumn(client, p.doc_token, p.block_id, p.column_index)
                  );
                case "delete_table_rows":
                  return json3(
                    await deleteTableRows(
                      client,
                      p.doc_token,
                      p.block_id,
                      p.row_start,
                      p.row_count
                    )
                  );
                case "delete_table_columns":
                  return json3(
                    await deleteTableColumns(
                      client,
                      p.doc_token,
                      p.block_id,
                      p.column_start,
                      p.column_count
                    )
                  );
                case "merge_table_cells":
                  return json3(
                    await mergeTableCells(
                      client,
                      p.doc_token,
                      p.block_id,
                      p.row_start,
                      p.row_end,
                      p.column_start,
                      p.column_end
                    )
                  );
                default:
                  return json3({ error: `Unknown action: ${p.action}` });
              }
            } catch (err) {
              return json3({ error: err instanceof Error ? err.message : String(err) });
            }
          }
        };
      },
      { name: "feishu_doc" }
    );
    registered.push("feishu_doc");
  }
  if (toolsCfg.scopes) {
    api.registerTool(
      (ctx) => ({
        name: "feishu_app_scopes",
        label: "Feishu App Scopes",
        description: "List current app permissions (scopes). Use to debug permission issues or check available capabilities.",
        parameters: import_typebox4.Type.Object({}),
        async execute() {
          try {
            const result = await listAppScopes(getClient(void 0, ctx.agentAccountId));
            return json3(result);
          } catch (err) {
            return json3({ error: err instanceof Error ? err.message : String(err) });
          }
        }
      }),
      { name: "feishu_app_scopes" }
    );
    registered.push("feishu_app_scopes");
  }
  if (registered.length > 0) {
    api.logger.info?.(`feishu_doc: Registered ${registered.join(", ")}`);
  }
}

// src/core/extensions/feishu/src/drive.ts
init_accounts();

// src/core/extensions/feishu/src/drive-schema.ts
var import_typebox5 = require("@sinclair/typebox");
var FileType = import_typebox5.Type.Union([
  import_typebox5.Type.Literal("doc"),
  import_typebox5.Type.Literal("docx"),
  import_typebox5.Type.Literal("sheet"),
  import_typebox5.Type.Literal("bitable"),
  import_typebox5.Type.Literal("folder"),
  import_typebox5.Type.Literal("file"),
  import_typebox5.Type.Literal("mindnote"),
  import_typebox5.Type.Literal("shortcut")
]);
var FeishuDriveSchema = import_typebox5.Type.Union([
  import_typebox5.Type.Object({
    action: import_typebox5.Type.Literal("list"),
    folder_token: import_typebox5.Type.Optional(
      import_typebox5.Type.String({ description: "Folder token (optional, omit for root directory)" })
    )
  }),
  import_typebox5.Type.Object({
    action: import_typebox5.Type.Literal("info"),
    file_token: import_typebox5.Type.String({ description: "File or folder token" }),
    type: FileType
  }),
  import_typebox5.Type.Object({
    action: import_typebox5.Type.Literal("create_folder"),
    name: import_typebox5.Type.String({ description: "Folder name" }),
    folder_token: import_typebox5.Type.Optional(
      import_typebox5.Type.String({ description: "Parent folder token (optional, omit for root)" })
    )
  }),
  import_typebox5.Type.Object({
    action: import_typebox5.Type.Literal("move"),
    file_token: import_typebox5.Type.String({ description: "File token to move" }),
    type: FileType,
    folder_token: import_typebox5.Type.String({ description: "Target folder token" })
  }),
  import_typebox5.Type.Object({
    action: import_typebox5.Type.Literal("delete"),
    file_token: import_typebox5.Type.String({ description: "File token to delete" }),
    type: FileType
  })
]);

// src/core/extensions/feishu/src/tool-result.ts
function jsonToolResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: data
  };
}
function unknownToolActionResult(action) {
  return jsonToolResult({ error: `Unknown action: ${String(action)}` });
}
function toolExecutionErrorResult(error) {
  return jsonToolResult({ error: error instanceof Error ? error.message : String(error) });
}

// src/core/extensions/feishu/src/drive.ts
async function getRootFolderToken(client) {
  const domain = client.domain ?? "https://open.feishu.cn";
  const res = await client.httpInstance.get(
    `${domain}/open-apis/drive/explorer/v2/root_folder/meta`
  );
  if (res.code !== 0) {
    throw new Error(res.msg ?? "Failed to get root folder");
  }
  const token = res.data?.token;
  if (!token) {
    throw new Error("Root folder token not found");
  }
  return token;
}
async function listFolder(client, folderToken) {
  const validFolderToken = folderToken && folderToken !== "0" ? folderToken : void 0;
  const res = await client.drive.file.list({
    params: validFolderToken ? { folder_token: validFolderToken } : {}
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    files: res.data?.files?.map((f) => ({
      token: f.token,
      name: f.name,
      type: f.type,
      url: f.url,
      created_time: f.created_time,
      modified_time: f.modified_time,
      owner_id: f.owner_id
    })) ?? [],
    next_page_token: res.data?.next_page_token
  };
}
async function getFileInfo(client, fileToken, folderToken) {
  const res = await client.drive.file.list({
    params: folderToken ? { folder_token: folderToken } : {}
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const file = res.data?.files?.find((f) => f.token === fileToken);
  if (!file) {
    throw new Error(`File not found: ${fileToken}`);
  }
  return {
    token: file.token,
    name: file.name,
    type: file.type,
    url: file.url,
    created_time: file.created_time,
    modified_time: file.modified_time,
    owner_id: file.owner_id
  };
}
async function createFolder(client, name, folderToken) {
  let effectiveToken = folderToken && folderToken !== "0" ? folderToken : "0";
  if (effectiveToken === "0") {
    try {
      effectiveToken = await getRootFolderToken(client);
    } catch {
    }
  }
  const res = await client.drive.file.createFolder({
    data: {
      name,
      folder_token: effectiveToken
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    token: res.data?.token,
    url: res.data?.url
  };
}
async function moveFile(client, fileToken, type, folderToken) {
  const res = await client.drive.file.move({
    path: { file_token: fileToken },
    data: {
      type,
      folder_token: folderToken
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    task_id: res.data?.task_id
  };
}
async function deleteFile(client, fileToken, type) {
  const res = await client.drive.file.delete({
    path: { file_token: fileToken },
    params: {
      type
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    task_id: res.data?.task_id
  };
}
function registerFeishuDriveTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_drive: No config available, skipping drive tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_drive: No Feishu accounts configured, skipping drive tools");
    return;
  }
  const toolsCfg = resolveAnyEnabledFeishuToolsConfig(accounts);
  if (!toolsCfg.drive) {
    api.logger.debug?.("feishu_drive: drive tool disabled in config");
    return;
  }
  api.registerTool(
    (ctx) => {
      const defaultAccountId = ctx.agentAccountId;
      return {
        name: "feishu_drive",
        label: "Feishu Drive",
        description: "Feishu cloud storage operations. Actions: list, info, create_folder, move, delete",
        parameters: FeishuDriveSchema,
        async execute(_toolCallId, params) {
          const p = params;
          try {
            const client = createFeishuToolClient({
              api,
              executeParams: p,
              defaultAccountId
            });
            switch (p.action) {
              case "list":
                return jsonToolResult(await listFolder(client, p.folder_token));
              case "info":
                return jsonToolResult(await getFileInfo(client, p.file_token));
              case "create_folder":
                return jsonToolResult(await createFolder(client, p.name, p.folder_token));
              case "move":
                return jsonToolResult(await moveFile(client, p.file_token, p.type, p.folder_token));
              case "delete":
                return jsonToolResult(await deleteFile(client, p.file_token, p.type));
              default:
                return unknownToolActionResult(p.action);
            }
          } catch (err) {
            return toolExecutionErrorResult(err);
          }
        }
      };
    },
    { name: "feishu_drive" }
  );
  api.logger.info?.(`feishu_drive: Registered feishu_drive tool`);
}

// src/core/extensions/feishu/src/perm.ts
init_accounts();

// src/core/extensions/feishu/src/perm-schema.ts
var import_typebox6 = require("@sinclair/typebox");
var TokenType = import_typebox6.Type.Union([
  import_typebox6.Type.Literal("doc"),
  import_typebox6.Type.Literal("docx"),
  import_typebox6.Type.Literal("sheet"),
  import_typebox6.Type.Literal("bitable"),
  import_typebox6.Type.Literal("folder"),
  import_typebox6.Type.Literal("file"),
  import_typebox6.Type.Literal("wiki"),
  import_typebox6.Type.Literal("mindnote")
]);
var MemberType = import_typebox6.Type.Union([
  import_typebox6.Type.Literal("email"),
  import_typebox6.Type.Literal("openid"),
  import_typebox6.Type.Literal("userid"),
  import_typebox6.Type.Literal("unionid"),
  import_typebox6.Type.Literal("openchat"),
  import_typebox6.Type.Literal("opendepartmentid")
]);
var Permission = import_typebox6.Type.Union([
  import_typebox6.Type.Literal("view"),
  import_typebox6.Type.Literal("edit"),
  import_typebox6.Type.Literal("full_access")
]);
var FeishuPermSchema = import_typebox6.Type.Union([
  import_typebox6.Type.Object({
    action: import_typebox6.Type.Literal("list"),
    token: import_typebox6.Type.String({ description: "File token" }),
    type: TokenType
  }),
  import_typebox6.Type.Object({
    action: import_typebox6.Type.Literal("add"),
    token: import_typebox6.Type.String({ description: "File token" }),
    type: TokenType,
    member_type: MemberType,
    member_id: import_typebox6.Type.String({ description: "Member ID (email, open_id, user_id, etc.)" }),
    perm: Permission
  }),
  import_typebox6.Type.Object({
    action: import_typebox6.Type.Literal("remove"),
    token: import_typebox6.Type.String({ description: "File token" }),
    type: TokenType,
    member_type: MemberType,
    member_id: import_typebox6.Type.String({ description: "Member ID to remove" })
  })
]);

// src/core/extensions/feishu/src/perm.ts
async function listMembers(client, token, type) {
  const res = await client.drive.permissionMember.list({
    path: { token },
    params: { type }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    members: res.data?.items?.map((m) => ({
      member_type: m.member_type,
      member_id: m.member_id,
      perm: m.perm,
      name: m.name
    })) ?? []
  };
}
async function addMember(client, token, type, memberType, memberId, perm) {
  const res = await client.drive.permissionMember.create({
    path: { token },
    params: { type, need_notification: false },
    data: {
      member_type: memberType,
      member_id: memberId,
      perm
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    member: res.data?.member
  };
}
async function removeMember(client, token, type, memberType, memberId) {
  const res = await client.drive.permissionMember.delete({
    path: { token, member_id: memberId },
    params: { type, member_type: memberType }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true
  };
}
function registerFeishuPermTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_perm: No config available, skipping perm tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_perm: No Feishu accounts configured, skipping perm tools");
    return;
  }
  const toolsCfg = resolveAnyEnabledFeishuToolsConfig(accounts);
  if (!toolsCfg.perm) {
    api.logger.debug?.("feishu_perm: perm tool disabled in config (default: false)");
    return;
  }
  api.registerTool(
    (ctx) => {
      const defaultAccountId = ctx.agentAccountId;
      return {
        name: "feishu_perm",
        label: "Feishu Perm",
        description: "Feishu permission management. Actions: list, add, remove",
        parameters: FeishuPermSchema,
        async execute(_toolCallId, params) {
          const p = params;
          try {
            const client = createFeishuToolClient({
              api,
              executeParams: p,
              defaultAccountId
            });
            switch (p.action) {
              case "list":
                return jsonToolResult(await listMembers(client, p.token, p.type));
              case "add":
                return jsonToolResult(
                  await addMember(client, p.token, p.type, p.member_type, p.member_id, p.perm)
                );
              case "remove":
                return jsonToolResult(
                  await removeMember(client, p.token, p.type, p.member_type, p.member_id)
                );
              default:
                return unknownToolActionResult(p.action);
            }
          } catch (err) {
            return toolExecutionErrorResult(err);
          }
        }
      };
    },
    { name: "feishu_perm" }
  );
  api.logger.info?.(`feishu_perm: Registered feishu_perm tool`);
}

// src/core/extensions/feishu/index.ts
init_runtime();

// src/core/extensions/feishu/src/wiki.ts
init_accounts();

// src/core/extensions/feishu/src/wiki-schema.ts
var import_typebox7 = require("@sinclair/typebox");
var FeishuWikiSchema = import_typebox7.Type.Union([
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("spaces")
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("nodes"),
    space_id: import_typebox7.Type.String({ description: "Knowledge space ID" }),
    parent_node_token: import_typebox7.Type.Optional(
      import_typebox7.Type.String({ description: "Parent node token (optional, omit for root)" })
    )
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("get"),
    token: import_typebox7.Type.String({ description: "Wiki node token (from URL /wiki/XXX)" })
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("search"),
    query: import_typebox7.Type.String({ description: "Search query" }),
    space_id: import_typebox7.Type.Optional(import_typebox7.Type.String({ description: "Limit search to this space (optional)" }))
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("create"),
    space_id: import_typebox7.Type.String({ description: "Knowledge space ID" }),
    title: import_typebox7.Type.String({ description: "Node title" }),
    obj_type: import_typebox7.Type.Optional(
      import_typebox7.Type.Union([import_typebox7.Type.Literal("docx"), import_typebox7.Type.Literal("sheet"), import_typebox7.Type.Literal("bitable")], {
        description: "Object type (default: docx)"
      })
    ),
    parent_node_token: import_typebox7.Type.Optional(
      import_typebox7.Type.String({ description: "Parent node token (optional, omit for root)" })
    )
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("move"),
    space_id: import_typebox7.Type.String({ description: "Source knowledge space ID" }),
    node_token: import_typebox7.Type.String({ description: "Node token to move" }),
    target_space_id: import_typebox7.Type.Optional(
      import_typebox7.Type.String({ description: "Target space ID (optional, same space if omitted)" })
    ),
    target_parent_token: import_typebox7.Type.Optional(
      import_typebox7.Type.String({ description: "Target parent node token (optional, root if omitted)" })
    )
  }),
  import_typebox7.Type.Object({
    action: import_typebox7.Type.Literal("rename"),
    space_id: import_typebox7.Type.String({ description: "Knowledge space ID" }),
    node_token: import_typebox7.Type.String({ description: "Node token to rename" }),
    title: import_typebox7.Type.String({ description: "New title" })
  })
]);

// src/core/extensions/feishu/src/wiki.ts
var WIKI_ACCESS_HINT = "To grant wiki access: Open wiki space \u2192 Settings \u2192 Members \u2192 Add the bot. See: https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa#a40ad4ca";
async function listSpaces(client) {
  const res = await client.wiki.space.list({});
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const spaces = res.data?.items?.map((s) => ({
    space_id: s.space_id,
    name: s.name,
    description: s.description,
    visibility: s.visibility
  })) ?? [];
  return {
    spaces,
    ...spaces.length === 0 && { hint: WIKI_ACCESS_HINT }
  };
}
async function listNodes(client, spaceId, parentNodeToken) {
  const res = await client.wiki.spaceNode.list({
    path: { space_id: spaceId },
    params: { parent_node_token: parentNodeToken }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    nodes: res.data?.items?.map((n) => ({
      node_token: n.node_token,
      obj_token: n.obj_token,
      obj_type: n.obj_type,
      title: n.title,
      has_child: n.has_child
    })) ?? []
  };
}
async function getNode(client, token) {
  const res = await client.wiki.space.getNode({
    params: { token }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const node = res.data?.node;
  return {
    node_token: node?.node_token,
    space_id: node?.space_id,
    obj_token: node?.obj_token,
    obj_type: node?.obj_type,
    title: node?.title,
    parent_node_token: node?.parent_node_token,
    has_child: node?.has_child,
    creator: node?.creator,
    create_time: node?.node_create_time
  };
}
async function createNode(client, spaceId, title, objType, parentNodeToken) {
  const res = await client.wiki.spaceNode.create({
    path: { space_id: spaceId },
    data: {
      obj_type: objType || "docx",
      node_type: "origin",
      title,
      parent_node_token: parentNodeToken
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  const node = res.data?.node;
  return {
    node_token: node?.node_token,
    obj_token: node?.obj_token,
    obj_type: node?.obj_type,
    title: node?.title
  };
}
async function moveNode(client, spaceId, nodeToken, targetSpaceId, targetParentToken) {
  const res = await client.wiki.spaceNode.move({
    path: { space_id: spaceId, node_token: nodeToken },
    data: {
      target_space_id: targetSpaceId || spaceId,
      target_parent_token: targetParentToken
    }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    node_token: res.data?.node?.node_token
  };
}
async function renameNode(client, spaceId, nodeToken, title) {
  const res = await client.wiki.spaceNode.updateTitle({
    path: { space_id: spaceId, node_token: nodeToken },
    data: { title }
  });
  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return {
    success: true,
    node_token: nodeToken,
    title
  };
}
function registerFeishuWikiTools(api) {
  if (!api.config) {
    api.logger.debug?.("feishu_wiki: No config available, skipping wiki tools");
    return;
  }
  const accounts = listEnabledFeishuAccounts(api.config);
  if (accounts.length === 0) {
    api.logger.debug?.("feishu_wiki: No Feishu accounts configured, skipping wiki tools");
    return;
  }
  const toolsCfg = resolveAnyEnabledFeishuToolsConfig(accounts);
  if (!toolsCfg.wiki) {
    api.logger.debug?.("feishu_wiki: wiki tool disabled in config");
    return;
  }
  api.registerTool(
    (ctx) => {
      const defaultAccountId = ctx.agentAccountId;
      return {
        name: "feishu_wiki",
        label: "Feishu Wiki",
        description: "Feishu knowledge base operations. Actions: spaces, nodes, get, create, move, rename",
        parameters: FeishuWikiSchema,
        async execute(_toolCallId, params) {
          const p = params;
          try {
            const client = createFeishuToolClient({
              api,
              executeParams: p,
              defaultAccountId
            });
            switch (p.action) {
              case "spaces":
                return jsonToolResult(await listSpaces(client));
              case "nodes":
                return jsonToolResult(await listNodes(client, p.space_id, p.parent_node_token));
              case "get":
                return jsonToolResult(await getNode(client, p.token));
              case "search":
                return jsonToolResult({
                  error: "Search is not available. Use feishu_wiki with action: 'nodes' to browse or action: 'get' to lookup by token."
                });
              case "create":
                return jsonToolResult(
                  await createNode(client, p.space_id, p.title, p.obj_type, p.parent_node_token)
                );
              case "move":
                return jsonToolResult(
                  await moveNode(
                    client,
                    p.space_id,
                    p.node_token,
                    p.target_space_id,
                    p.target_parent_token
                  )
                );
              case "rename":
                return jsonToolResult(await renameNode(client, p.space_id, p.node_token, p.title));
              default:
                return unknownToolActionResult(p.action);
            }
          } catch (err) {
            return toolExecutionErrorResult(err);
          }
        }
      };
    },
    { name: "feishu_wiki" }
  );
  api.logger.info?.(`feishu_wiki: Registered feishu_wiki tool`);
}

// src/core/extensions/feishu/index.ts
init_monitor();
init_send();
init_media();
init_probe();

// src/core/extensions/feishu/src/reactions.ts
init_accounts();
init_client();
async function addReactionFeishu(params) {
  const { cfg, messageId, emojiType, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const response = await client.im.messageReaction.create({
    path: { message_id: messageId },
    data: {
      reaction_type: {
        emoji_type: emojiType
      }
    }
  });
  if (response.code !== 0) {
    throw new Error(`Feishu add reaction failed: ${response.msg || `code ${response.code}`}`);
  }
  const reactionId = response.data?.reaction_id;
  if (!reactionId) {
    throw new Error("Feishu add reaction failed: no reaction_id returned");
  }
  return { reactionId };
}
async function removeReactionFeishu(params) {
  const { cfg, messageId, reactionId, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const response = await client.im.messageReaction.delete({
    path: {
      message_id: messageId,
      reaction_id: reactionId
    }
  });
  if (response.code !== 0) {
    throw new Error(`Feishu remove reaction failed: ${response.msg || `code ${response.code}`}`);
  }
}
async function listReactionsFeishu(params) {
  const { cfg, messageId, emojiType, accountId } = params;
  const account = resolveFeishuAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Feishu account "${account.accountId}" not configured`);
  }
  const client = createFeishuClient(account);
  const response = await client.im.messageReaction.list({
    path: { message_id: messageId },
    params: emojiType ? { reaction_type: emojiType } : void 0
  });
  if (response.code !== 0) {
    throw new Error(`Feishu list reactions failed: ${response.msg || `code ${response.code}`}`);
  }
  const items = response.data?.items ?? [];
  return items.map((item) => ({
    reactionId: item.reaction_id ?? "",
    emojiType: item.reaction_type?.emoji_type ?? "",
    operatorType: item.operator_type === "app" ? "app" : "user",
    operatorId: item.operator_id?.open_id ?? item.operator_id?.user_id ?? item.operator_id?.union_id ?? ""
  }));
}
var FeishuEmoji = {
  // Common reactions
  THUMBSUP: "THUMBSUP",
  THUMBSDOWN: "THUMBSDOWN",
  HEART: "HEART",
  SMILE: "SMILE",
  GRINNING: "GRINNING",
  LAUGHING: "LAUGHING",
  CRY: "CRY",
  ANGRY: "ANGRY",
  SURPRISED: "SURPRISED",
  THINKING: "THINKING",
  CLAP: "CLAP",
  OK: "OK",
  FIST: "FIST",
  PRAY: "PRAY",
  FIRE: "FIRE",
  PARTY: "PARTY",
  CHECK: "CHECK",
  CROSS: "CROSS",
  QUESTION: "QUESTION",
  EXCLAMATION: "EXCLAMATION"
};

// src/core/extensions/feishu/index.ts
init_mention();
var plugin = {
  id: "feishu",
  name: "Feishu",
  description: "Feishu/Lark channel plugin",
  configSchema: (0, import_feishu12.emptyPluginConfigSchema)(),
  register(api) {
    setFeishuRuntime(api.runtime);
    api.registerChannel({ plugin: feishuPlugin });
    registerFeishuDocTools(api);
    registerFeishuChatTools(api);
    registerFeishuWikiTools(api);
    registerFeishuDriveTools(api);
    registerFeishuPermTools(api);
    registerFeishuBitableTools(api);
  }
};
var index_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FeishuEmoji,
  addReactionFeishu,
  buildMentionedCardContent,
  buildMentionedMessage,
  editMessageFeishu,
  extractMentionTargets,
  extractMessageBody,
  feishuPlugin,
  formatMentionAllForCard,
  formatMentionAllForText,
  formatMentionForCard,
  formatMentionForText,
  getMessageFeishu,
  isMentionForwardRequest,
  listReactionsFeishu,
  monitorFeishuProvider,
  probeFeishu,
  removeReactionFeishu,
  sendCardFeishu,
  sendFileFeishu,
  sendImageFeishu,
  sendMediaFeishu,
  sendMessageFeishu,
  updateCardFeishu,
  uploadFileFeishu,
  uploadImageFeishu
});
