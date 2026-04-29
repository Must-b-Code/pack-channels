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

// src/core/extensions/zalouser/src/zca-client.ts
var import_zca_js, ThreadType, LoginQRCallbackEventType, Reactions, TextStyle, Zalo;
var init_zca_client = __esm({
  "src/core/extensions/zalouser/src/zca-client.ts"() {
    "use strict";
    import_zca_js = require("zca-js");
    ThreadType = import_zca_js.ThreadType;
    LoginQRCallbackEventType = import_zca_js.LoginQRCallbackEventType;
    Reactions = import_zca_js.Reactions;
    TextStyle = {
      Bold: "b",
      Italic: "i",
      Underline: "u",
      StrikeThrough: "s",
      Red: "c_db342e",
      Orange: "c_f27806",
      Yellow: "c_f7b503",
      Green: "c_15a85f",
      Small: "f_13",
      Big: "f_18",
      UnorderedList: "lst_1",
      OrderedList: "lst_2",
      Indent: "ind_$"
    };
    Zalo = import_zca_js.Zalo;
  }
});

// src/core/extensions/zalouser/src/reaction.ts
function normalizeZaloReactionIcon(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return Reactions.LIKE;
  }
  return REACTION_ALIAS_MAP.get(trimmed.toLowerCase()) ?? REACTION_ALIAS_MAP.get(trimmed) ?? trimmed;
}
var REACTION_ALIAS_MAP;
var init_reaction = __esm({
  "src/core/extensions/zalouser/src/reaction.ts"() {
    "use strict";
    init_zca_client();
    REACTION_ALIAS_MAP = /* @__PURE__ */ new Map([
      ["like", Reactions.LIKE],
      ["\u{1F44D}", Reactions.LIKE],
      [":+1:", Reactions.LIKE],
      ["heart", Reactions.HEART],
      ["\u2764\uFE0F", Reactions.HEART],
      ["<3", Reactions.HEART],
      ["haha", Reactions.HAHA],
      ["laugh", Reactions.HAHA],
      ["\u{1F602}", Reactions.HAHA],
      ["wow", Reactions.WOW],
      ["\u{1F62E}", Reactions.WOW],
      ["cry", Reactions.CRY],
      ["\u{1F622}", Reactions.CRY],
      ["angry", Reactions.ANGRY],
      ["\u{1F621}", Reactions.ANGRY]
    ]);
  }
});

// src/core/extensions/zalouser/src/runtime.ts
var import_compat, setZalouserRuntime, getZalouserRuntime;
var init_runtime = __esm({
  "src/core/extensions/zalouser/src/runtime.ts"() {
    "use strict";
    import_compat = require("src/core/source/plugin-sdk/compat");
    ({ setRuntime: setZalouserRuntime, getRuntime: getZalouserRuntime } = (0, import_compat.createPluginRuntimeStore)("Zalouser runtime not initialized"));
  }
});

// src/core/extensions/zalouser/src/zalo-js.ts
function resolveStateDir(env = process.env) {
  return getZalouserRuntime().state.resolveStateDir(env, import_node_os.default.homedir);
}
function resolveCredentialsDir(env = process.env) {
  return import_node_path.default.join(resolveStateDir(env), "credentials", "zalouser");
}
function credentialsFilename(profile) {
  const trimmed = profile.trim().toLowerCase();
  if (!trimmed || trimmed === "default") {
    return "credentials.json";
  }
  return `credentials-${encodeURIComponent(trimmed)}.json`;
}
function resolveCredentialsPath(profile, env = process.env) {
  return import_node_path.default.join(resolveCredentialsDir(env), credentialsFilename(profile));
}
function withTimeout(promise, timeoutMs, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(label));
    }, timeoutMs);
    void promise.then((result) => {
      clearTimeout(timer);
      resolve(result);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function normalizeProfile(profile) {
  const trimmed = profile?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "default";
}
function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
function clampTextStyles(text, styles) {
  if (!styles || styles.length === 0) {
    return void 0;
  }
  const maxLength = text.length;
  const clamped = styles.map((style) => {
    const start = Math.max(0, Math.min(style.start, maxLength));
    const end = Math.min(style.start + style.len, maxLength);
    if (end <= start) {
      return null;
    }
    if (style.st === TextStyle.Indent) {
      return {
        start,
        len: end - start,
        st: style.st,
        indentSize: style.indentSize
      };
    }
    return {
      start,
      len: end - start,
      st: style.st
    };
  }).filter((style) => style !== null);
  return clamped.length > 0 ? clamped : void 0;
}
function toNumberId(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed.replace(/_\d+$/, "");
    }
  }
  return "";
}
function toStringValue(value) {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}
function normalizeAccountInfoUser(info) {
  if (!info || typeof info !== "object") {
    return null;
  }
  if ("profile" in info) {
    const profile = info.profile;
    if (profile && typeof profile === "object") {
      return profile;
    }
    return null;
  }
  return info;
}
function toInteger(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.trunc(parsed);
}
function normalizeMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (!content || typeof content !== "object") {
    return "";
  }
  const record = content;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const href = typeof record.href === "string" ? record.href.trim() : "";
  const combined = [title, description, href].filter(Boolean).join("\n").trim();
  if (combined) {
    return combined;
  }
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}
function resolveInboundTimestamp(rawTs) {
  if (typeof rawTs === "number" && Number.isFinite(rawTs)) {
    return rawTs > 1e12 ? rawTs : rawTs * 1e3;
  }
  const parsed = Number.parseInt(String(rawTs ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return Date.now();
  }
  return parsed > 1e12 ? parsed : parsed * 1e3;
}
function extractMentionIds(rawMentions) {
  if (!Array.isArray(rawMentions)) {
    return [];
  }
  const sink = /* @__PURE__ */ new Set();
  for (const entry of rawMentions) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const record = entry;
    const id = toNumberId(record.uid);
    if (id) {
      sink.add(id);
    }
  }
  return Array.from(sink);
}
function toNonNegativeInteger(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = Math.trunc(value);
    return normalized >= 0 ? normalized : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) {
      return parsed >= 0 ? parsed : null;
    }
  }
  return null;
}
function extractOwnMentionSpans(rawMentions, ownUserId, contentLength) {
  if (!Array.isArray(rawMentions) || !ownUserId || contentLength <= 0) {
    return [];
  }
  const spans = [];
  for (const entry of rawMentions) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const record = entry;
    const uid = toNumberId(record.uid);
    if (!uid || uid !== ownUserId) {
      continue;
    }
    const startRaw = toNonNegativeInteger(record.pos ?? record.start ?? record.offset);
    const lengthRaw = toNonNegativeInteger(record.len ?? record.length);
    if (startRaw === null || lengthRaw === null || lengthRaw <= 0) {
      continue;
    }
    const start = Math.min(startRaw, contentLength);
    const end = Math.min(start + lengthRaw, contentLength);
    if (end <= start) {
      continue;
    }
    spans.push({ start, end });
  }
  if (spans.length <= 1) {
    return spans;
  }
  spans.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (!last || span.start > last.end) {
      merged.push({ ...span });
      continue;
    }
    last.end = Math.max(last.end, span.end);
  }
  return merged;
}
function stripOwnMentionsForCommandBody(content, rawMentions, ownUserId) {
  if (!content || !ownUserId) {
    return content;
  }
  const spans = extractOwnMentionSpans(rawMentions, ownUserId, content.length);
  if (spans.length === 0) {
    return stripLeadingAtMentionForCommand(content);
  }
  let cursor = 0;
  let output = "";
  for (const span of spans) {
    if (span.start > cursor) {
      output += content.slice(cursor, span.start);
    }
    cursor = Math.max(cursor, span.end);
  }
  if (cursor < content.length) {
    output += content.slice(cursor);
  }
  return output.replace(/\s+/g, " ").trim();
}
function stripLeadingAtMentionForCommand(content) {
  const fallbackMatch = content.match(/^\s*@[^\s]+(?:\s+|[:,-]\s*)([/!][\s\S]*)$/);
  if (!fallbackMatch) {
    return content;
  }
  return fallbackMatch[1].trim();
}
function resolveGroupNameFromMessageData(data) {
  const candidates = [data.groupName, data.gName, data.idToName, data.threadName, data.roomName];
  for (const candidate of candidates) {
    const value = toStringValue(candidate);
    if (value) {
      return value;
    }
  }
  return void 0;
}
function buildEventMessage(data) {
  const msgId = toStringValue(data.msgId);
  const cliMsgId = toStringValue(data.cliMsgId);
  const uidFrom = toStringValue(data.uidFrom);
  const idTo = toStringValue(data.idTo);
  if (!msgId || !cliMsgId || !uidFrom || !idTo) {
    return void 0;
  }
  return {
    msgId,
    cliMsgId,
    uidFrom,
    idTo,
    msgType: toStringValue(data.msgType) || "webchat",
    st: toInteger(data.st, 0),
    at: toInteger(data.at, 0),
    cmd: toInteger(data.cmd, 0),
    ts: toStringValue(data.ts) || Date.now()
  };
}
function extractSendMessageId(result) {
  if (!result || typeof result !== "object") {
    return void 0;
  }
  const payload = result;
  const direct = payload.msgId;
  if (direct !== void 0 && direct !== null) {
    return String(direct);
  }
  const primary = payload.message?.msgId;
  if (primary !== void 0 && primary !== null) {
    return String(primary);
  }
  const attachmentId = payload.attachment?.[0]?.msgId;
  if (attachmentId !== void 0 && attachmentId !== null) {
    return String(attachmentId);
  }
  return void 0;
}
function resolveMediaFileName(params) {
  const explicit = params.fileName?.trim();
  if (explicit) {
    return explicit;
  }
  try {
    const parsed = new URL(params.mediaUrl);
    const fromPath = import_node_path.default.basename(parsed.pathname).trim();
    if (fromPath) {
      return fromPath;
    }
  } catch {
  }
  const ext = params.contentType === "image/png" ? "png" : params.contentType === "image/webp" ? "webp" : params.contentType === "image/jpeg" ? "jpg" : params.contentType === "video/mp4" ? "mp4" : params.contentType === "audio/mpeg" ? "mp3" : params.contentType === "audio/ogg" ? "ogg" : params.contentType === "audio/wav" ? "wav" : params.kind === "video" ? "mp4" : params.kind === "audio" ? "mp3" : params.kind === "image" ? "jpg" : "bin";
  return `upload.${ext}`;
}
function resolveUploadedVoiceAsset(uploaded) {
  for (const item of uploaded) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const fileType = item.fileType?.toLowerCase();
    const fileUrl = item.fileUrl?.trim();
    if (!fileUrl) {
      continue;
    }
    if (fileType === "others" || fileType === "video") {
      return { fileUrl, fileName: item.fileName?.trim() || void 0 };
    }
  }
  return void 0;
}
function buildZaloVoicePlaybackUrl(asset) {
  return asset.fileUrl.trim();
}
function mapFriend(friend) {
  return {
    userId: String(friend.userId),
    displayName: friend.displayName || friend.zaloName || friend.username || String(friend.userId),
    avatar: friend.avatar || void 0
  };
}
function mapGroup(groupId, group) {
  const totalMember = typeof group.totalMember === "number" && Number.isFinite(group.totalMember) ? group.totalMember : void 0;
  return {
    groupId: String(groupId),
    name: group.name?.trim() || String(groupId),
    memberCount: totalMember
  };
}
function readCredentials(profile) {
  const filePath = resolveCredentialsPath(profile);
  try {
    if (!import_node_fs.default.existsSync(filePath)) {
      return null;
    }
    const raw = import_node_fs.default.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed.imei !== "string" || !parsed.imei || !parsed.cookie || typeof parsed.userAgent !== "string" || !parsed.userAgent) {
      return null;
    }
    return {
      imei: parsed.imei,
      cookie: parsed.cookie,
      userAgent: parsed.userAgent,
      language: typeof parsed.language === "string" ? parsed.language : void 0,
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
      lastUsedAt: typeof parsed.lastUsedAt === "string" ? parsed.lastUsedAt : void 0
    };
  } catch {
    return null;
  }
}
function touchCredentials(profile) {
  const existing = readCredentials(profile);
  if (!existing) {
    return;
  }
  const next = {
    ...existing,
    lastUsedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const dir = resolveCredentialsDir();
  import_node_fs.default.mkdirSync(dir, { recursive: true });
  import_node_fs.default.writeFileSync(resolveCredentialsPath(profile), JSON.stringify(next, null, 2), "utf-8");
}
function writeCredentials(profile, credentials) {
  const dir = resolveCredentialsDir();
  import_node_fs.default.mkdirSync(dir, { recursive: true });
  const existing = readCredentials(profile);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const next = {
    ...credentials,
    createdAt: existing?.createdAt ?? now,
    lastUsedAt: now
  };
  import_node_fs.default.writeFileSync(resolveCredentialsPath(profile), JSON.stringify(next, null, 2), "utf-8");
}
function clearCredentials(profile) {
  const filePath = resolveCredentialsPath(profile);
  try {
    if (import_node_fs.default.existsSync(filePath)) {
      import_node_fs.default.unlinkSync(filePath);
      return true;
    }
  } catch {
  }
  return false;
}
async function ensureApi(profileInput, timeoutMs = API_LOGIN_TIMEOUT_MS) {
  const profile = normalizeProfile(profileInput);
  const cached = apiByProfile.get(profile);
  if (cached) {
    return cached;
  }
  const pending = apiInitByProfile.get(profile);
  if (pending) {
    return await pending;
  }
  const initPromise = (async () => {
    const stored = readCredentials(profile);
    if (!stored) {
      throw new Error(`No saved Zalo session for profile "${profile}"`);
    }
    const zalo = new Zalo({
      logging: false,
      selfListen: false
    });
    const api = await withTimeout(
      zalo.login({
        imei: stored.imei,
        cookie: stored.cookie,
        userAgent: stored.userAgent,
        language: stored.language
      }),
      timeoutMs,
      `Timed out restoring Zalo session for profile "${profile}"`
    );
    apiByProfile.set(profile, api);
    touchCredentials(profile);
    return api;
  })();
  apiInitByProfile.set(profile, initPromise);
  try {
    return await initPromise;
  } catch (error) {
    apiByProfile.delete(profile);
    throw error;
  } finally {
    apiInitByProfile.delete(profile);
  }
}
function invalidateApi(profileInput) {
  const profile = normalizeProfile(profileInput);
  const api = apiByProfile.get(profile);
  if (api) {
    try {
      api.listener.stop();
    } catch {
    }
  }
  apiByProfile.delete(profile);
  apiInitByProfile.delete(profile);
}
function isQrLoginFresh(login) {
  return Date.now() - login.startedAt < QR_LOGIN_TTL_MS;
}
function resetQrLogin(profileInput) {
  const profile = normalizeProfile(profileInput);
  const active = activeQrLogins.get(profile);
  if (!active) {
    return;
  }
  try {
    active.abort?.();
  } catch {
  }
  activeQrLogins.delete(profile);
}
async function fetchGroupsByIds(api, ids) {
  const result = /* @__PURE__ */ new Map();
  for (let index = 0; index < ids.length; index += GROUP_INFO_CHUNK_SIZE) {
    const chunk = ids.slice(index, index + GROUP_INFO_CHUNK_SIZE);
    if (chunk.length === 0) {
      continue;
    }
    const response = await api.getGroupInfo(chunk);
    const map = response.gridInfoMap ?? {};
    for (const [groupId, info] of Object.entries(map)) {
      result.set(groupId, info);
    }
  }
  return result;
}
function makeGroupContextCacheKey(profile, groupId) {
  return `${profile}:${groupId}`;
}
function readCachedGroupContext(profile, groupId) {
  const key = makeGroupContextCacheKey(profile, groupId);
  const cached = groupContextCache.get(key);
  if (!cached) {
    return null;
  }
  if (cached.expiresAt <= Date.now()) {
    groupContextCache.delete(key);
    return null;
  }
  groupContextCache.delete(key);
  groupContextCache.set(key, cached);
  return cached.value;
}
function trimGroupContextCache(now) {
  for (const [key, value] of groupContextCache) {
    if (value.expiresAt > now) {
      continue;
    }
    groupContextCache.delete(key);
  }
  while (groupContextCache.size > GROUP_CONTEXT_CACHE_MAX_ENTRIES) {
    const oldestKey = groupContextCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    groupContextCache.delete(oldestKey);
  }
}
function writeCachedGroupContext(profile, context) {
  const now = Date.now();
  const key = makeGroupContextCacheKey(profile, context.groupId);
  if (groupContextCache.has(key)) {
    groupContextCache.delete(key);
  }
  groupContextCache.set(key, {
    value: context,
    expiresAt: now + GROUP_CONTEXT_CACHE_TTL_MS
  });
  trimGroupContextCache(now);
}
function clearCachedGroupContext(profile) {
  for (const key of groupContextCache.keys()) {
    if (key.startsWith(`${profile}:`)) {
      groupContextCache.delete(key);
    }
  }
}
function extractGroupMembersFromInfo(groupInfo) {
  if (!groupInfo || !Array.isArray(groupInfo.currentMems)) {
    return void 0;
  }
  const members = groupInfo.currentMems.map((member) => {
    if (!member || typeof member !== "object") {
      return "";
    }
    const record = member;
    return toStringValue(record.dName) || toStringValue(record.zaloName);
  }).filter(Boolean);
  if (members.length === 0) {
    return void 0;
  }
  return members;
}
function toInboundMessage(message, ownUserId) {
  const data = message.data;
  const isGroup = message.type === ThreadType.Group;
  const senderId = toNumberId(data.uidFrom);
  const threadId = isGroup ? toNumberId(data.idTo) : toNumberId(data.uidFrom) || toNumberId(data.idTo);
  if (!threadId || !senderId) {
    return null;
  }
  const content = normalizeMessageContent(data.content);
  const normalizedOwnUserId = toNumberId(ownUserId);
  const mentionIds = extractMentionIds(data.mentions);
  const quoteOwnerId = data.quote && typeof data.quote === "object" ? toNumberId(data.quote.ownerId) : "";
  const hasAnyMention = mentionIds.length > 0;
  const canResolveExplicitMention = Boolean(normalizedOwnUserId);
  const wasExplicitlyMentioned = Boolean(
    normalizedOwnUserId && mentionIds.some((id) => id === normalizedOwnUserId)
  );
  const commandContent = wasExplicitlyMentioned ? stripOwnMentionsForCommandBody(content, data.mentions, normalizedOwnUserId) : hasAnyMention && !canResolveExplicitMention ? stripLeadingAtMentionForCommand(content) : content;
  const implicitMention = Boolean(
    normalizedOwnUserId && quoteOwnerId && quoteOwnerId === normalizedOwnUserId
  );
  const eventMessage = buildEventMessage(data);
  return {
    threadId,
    isGroup,
    senderId,
    senderName: typeof data.dName === "string" ? data.dName.trim() || void 0 : void 0,
    groupName: isGroup ? resolveGroupNameFromMessageData(data) : void 0,
    content,
    commandContent,
    timestampMs: resolveInboundTimestamp(data.ts),
    msgId: typeof data.msgId === "string" ? data.msgId : void 0,
    cliMsgId: typeof data.cliMsgId === "string" ? data.cliMsgId : void 0,
    hasAnyMention,
    canResolveExplicitMention,
    wasExplicitlyMentioned,
    implicitMention,
    eventMessage,
    raw: message
  };
}
function zalouserSessionExists(profileInput) {
  const profile = normalizeProfile(profileInput);
  return readCredentials(profile) !== null;
}
async function checkZaloAuthenticated(profileInput) {
  const profile = normalizeProfile(profileInput);
  if (!zalouserSessionExists(profile)) {
    return false;
  }
  try {
    const api = await ensureApi(profile, 12e3);
    await withTimeout(api.fetchAccountInfo(), 12e3, "Timed out checking Zalo session");
    return true;
  } catch {
    invalidateApi(profile);
    return false;
  }
}
async function getZaloUserInfo(profileInput) {
  const profile = normalizeProfile(profileInput);
  const api = await ensureApi(profile);
  const info = await api.fetchAccountInfo();
  const user = normalizeAccountInfoUser(info);
  if (!user?.userId) {
    return null;
  }
  return {
    userId: String(user.userId),
    displayName: user.displayName || user.zaloName || String(user.userId),
    avatar: user.avatar || void 0
  };
}
async function listZaloFriends(profileInput) {
  const profile = normalizeProfile(profileInput);
  const api = await ensureApi(profile);
  const friends = await api.getAllFriends();
  return friends.map(mapFriend);
}
async function listZaloFriendsMatching(profileInput, query) {
  const friends = await listZaloFriends(profileInput);
  const q = query?.trim().toLowerCase();
  if (!q) {
    return friends;
  }
  const scored = friends.map((friend) => {
    const id = friend.userId.toLowerCase();
    const name = friend.displayName.toLowerCase();
    const exact = id === q || name === q;
    const includes = id.includes(q) || name.includes(q);
    return { friend, exact, includes };
  }).filter((entry) => entry.includes).sort((a, b) => Number(b.exact) - Number(a.exact));
  return scored.map((entry) => entry.friend);
}
async function listZaloGroups(profileInput) {
  const profile = normalizeProfile(profileInput);
  const api = await ensureApi(profile);
  const allGroups = await api.getAllGroups();
  const ids = Object.keys(allGroups.gridVerMap ?? {});
  if (ids.length === 0) {
    return [];
  }
  const details = await fetchGroupsByIds(api, ids);
  const rows = [];
  for (const id of ids) {
    const info = details.get(id);
    if (!info) {
      rows.push({ groupId: id, name: id });
      continue;
    }
    rows.push(mapGroup(id, info));
  }
  return rows;
}
async function listZaloGroupsMatching(profileInput, query) {
  const groups = await listZaloGroups(profileInput);
  const q = query?.trim().toLowerCase();
  if (!q) {
    return groups;
  }
  return groups.filter((group) => {
    const id = group.groupId.toLowerCase();
    const name = group.name.toLowerCase();
    return id.includes(q) || name.includes(q);
  });
}
async function listZaloGroupMembers(profileInput, groupId) {
  const profile = normalizeProfile(profileInput);
  const api = await ensureApi(profile);
  const infoResponse = await api.getGroupInfo(groupId);
  const groupInfo = infoResponse.gridInfoMap?.[groupId];
  if (!groupInfo) {
    return [];
  }
  const memberIds = Array.isArray(groupInfo.memberIds) ? groupInfo.memberIds.map((id) => toNumberId(id)).filter(Boolean) : [];
  const memVerIds = Array.isArray(groupInfo.memVerList) ? groupInfo.memVerList.map((id) => toNumberId(id)).filter(Boolean) : [];
  const currentMembers = Array.isArray(groupInfo.currentMems) ? groupInfo.currentMems : [];
  const currentById = /* @__PURE__ */ new Map();
  for (const member of currentMembers) {
    const id = toNumberId(member?.id);
    if (!id) {
      continue;
    }
    currentById.set(id, {
      displayName: member.dName?.trim() || member.zaloName?.trim() || void 0,
      avatar: member.avatar || void 0
    });
  }
  const uniqueIds = Array.from(
    /* @__PURE__ */ new Set([...memberIds, ...memVerIds, ...currentById.keys()])
  );
  const profileMap = /* @__PURE__ */ new Map();
  if (uniqueIds.length > 0) {
    const profiles = await api.getGroupMembersInfo(uniqueIds);
    const profileEntries = profiles.profiles;
    for (const [rawId, profileValue] of Object.entries(profileEntries)) {
      const id = toNumberId(rawId) || toNumberId(profileValue?.id);
      if (!id || !profileValue) {
        continue;
      }
      profileMap.set(id, {
        displayName: profileValue.displayName?.trim() || profileValue.zaloName?.trim() || void 0,
        avatar: profileValue.avatar || void 0
      });
    }
  }
  return uniqueIds.map((id) => ({
    userId: id,
    displayName: profileMap.get(id)?.displayName || currentById.get(id)?.displayName || id,
    avatar: profileMap.get(id)?.avatar || currentById.get(id)?.avatar
  }));
}
async function resolveZaloGroupContext(profileInput, groupId) {
  const profile = normalizeProfile(profileInput);
  const normalizedGroupId = toNumberId(groupId) || groupId.trim();
  if (!normalizedGroupId) {
    throw new Error("groupId is required");
  }
  const cached = readCachedGroupContext(profile, normalizedGroupId);
  if (cached) {
    return cached;
  }
  const api = await ensureApi(profile);
  const response = await api.getGroupInfo(normalizedGroupId);
  const groupInfo = response.gridInfoMap?.[normalizedGroupId];
  const context = {
    groupId: normalizedGroupId,
    name: groupInfo?.name?.trim() || void 0,
    members: extractGroupMembersFromInfo(groupInfo)
  };
  writeCachedGroupContext(profile, context);
  return context;
}
async function sendZaloTextMessage(threadId, text, options = {}) {
  const profile = normalizeProfile(options.profile);
  const trimmedThreadId = threadId.trim();
  if (!trimmedThreadId) {
    return { ok: false, error: "No threadId provided" };
  }
  const api = await ensureApi(profile);
  const type = options.isGroup ? ThreadType.Group : ThreadType.User;
  try {
    if (options.mediaUrl?.trim()) {
      const media = await (0, import_zalouser.loadOutboundMediaFromUrl)(options.mediaUrl.trim(), {
        mediaLocalRoots: options.mediaLocalRoots
      });
      const fileName = resolveMediaFileName({
        mediaUrl: options.mediaUrl,
        fileName: media.fileName,
        contentType: media.contentType,
        kind: media.kind
      });
      const payloadText2 = (text || options.caption || "").slice(0, 2e3);
      const textStyles2 = clampTextStyles(payloadText2, options.textStyles);
      if (media.kind === "audio") {
        let textMessageId;
        if (payloadText2) {
          const textResponse = await api.sendMessage(
            textStyles2 ? { msg: payloadText2, styles: textStyles2 } : payloadText2,
            trimmedThreadId,
            type
          );
          textMessageId = extractSendMessageId(textResponse);
        }
        const attachmentFileName = fileName.includes(".") ? fileName : `${fileName}.bin`;
        const uploaded = await api.uploadAttachment(
          [
            {
              data: media.buffer,
              filename: attachmentFileName,
              metadata: {
                totalSize: media.buffer.length
              }
            }
          ],
          trimmedThreadId,
          type
        );
        const voiceAsset = resolveUploadedVoiceAsset(uploaded);
        if (!voiceAsset) {
          throw new Error("Failed to resolve uploaded audio URL for voice message");
        }
        const voiceUrl = buildZaloVoicePlaybackUrl(voiceAsset);
        const response3 = await api.sendVoice({ voiceUrl }, trimmedThreadId, type);
        return {
          ok: true,
          messageId: extractSendMessageId(response3) ?? textMessageId
        };
      }
      const response2 = await api.sendMessage(
        {
          msg: payloadText2,
          ...textStyles2 ? { styles: textStyles2 } : {},
          attachments: [
            {
              data: media.buffer,
              filename: fileName.includes(".") ? fileName : `${fileName}.bin`,
              metadata: {
                totalSize: media.buffer.length
              }
            }
          ]
        },
        trimmedThreadId,
        type
      );
      return { ok: true, messageId: extractSendMessageId(response2) };
    }
    const payloadText = text.slice(0, 2e3);
    const textStyles = clampTextStyles(payloadText, options.textStyles);
    const response = await api.sendMessage(
      textStyles ? { msg: payloadText, styles: textStyles } : payloadText,
      trimmedThreadId,
      type
    );
    return { ok: true, messageId: extractSendMessageId(response) };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
async function sendZaloTypingEvent(threadId, options = {}) {
  const profile = normalizeProfile(options.profile);
  const trimmedThreadId = threadId.trim();
  if (!trimmedThreadId) {
    throw new Error("No threadId provided");
  }
  const api = await ensureApi(profile);
  const type = options.isGroup ? ThreadType.Group : ThreadType.User;
  if ("sendTypingEvent" in api && typeof api.sendTypingEvent === "function") {
    await api.sendTypingEvent(trimmedThreadId, type);
    return;
  }
  throw new Error("Zalo typing indicator is not supported by current API session");
}
async function resolveOwnUserId(api) {
  try {
    const info = await api.fetchAccountInfo();
    const resolved = toNumberId(normalizeAccountInfoUser(info)?.userId);
    if (resolved) {
      return resolved;
    }
  } catch {
  }
  try {
    const ownId = toNumberId(api.getOwnId());
    if (ownId) {
      return ownId;
    }
  } catch {
  }
  return "";
}
async function sendZaloReaction(params) {
  const profile = normalizeProfile(params.profile);
  const threadId = params.threadId.trim();
  const msgId = toStringValue(params.msgId);
  const cliMsgId = toStringValue(params.cliMsgId);
  if (!threadId || !msgId || !cliMsgId) {
    return { ok: false, error: "threadId, msgId, and cliMsgId are required" };
  }
  try {
    const api = await ensureApi(profile);
    const type = params.isGroup ? ThreadType.Group : ThreadType.User;
    const icon = params.remove ? { rType: -1, source: 6, icon: "" } : normalizeZaloReactionIcon(params.emoji);
    await api.addReaction(icon, {
      data: { msgId, cliMsgId },
      threadId,
      type
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
async function sendZaloDeliveredEvent(params) {
  const profile = normalizeProfile(params.profile);
  const api = await ensureApi(profile);
  const type = params.isGroup ? ThreadType.Group : ThreadType.User;
  await api.sendDeliveredEvent(params.isSeen === true, params.message, type);
}
async function sendZaloSeenEvent(params) {
  const profile = normalizeProfile(params.profile);
  const api = await ensureApi(profile);
  const type = params.isGroup ? ThreadType.Group : ThreadType.User;
  await api.sendSeenEvent(params.message, type);
}
async function sendZaloLink(threadId, url, options = {}) {
  const profile = normalizeProfile(options.profile);
  const trimmedThreadId = threadId.trim();
  const trimmedUrl = url.trim();
  if (!trimmedThreadId) {
    return { ok: false, error: "No threadId provided" };
  }
  if (!trimmedUrl) {
    return { ok: false, error: "No URL provided" };
  }
  try {
    const api = await ensureApi(profile);
    const type = options.isGroup ? ThreadType.Group : ThreadType.User;
    const response = await api.sendLink(
      { link: trimmedUrl, msg: options.caption },
      trimmedThreadId,
      type
    );
    return { ok: true, messageId: String(response.msgId) };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
async function startZaloQrLogin(params) {
  const profile = normalizeProfile(params.profile);
  if (!params.force && await checkZaloAuthenticated(profile)) {
    const info = await getZaloUserInfo(profile).catch(() => null);
    const name = info?.displayName ? ` (${info.displayName})` : "";
    return {
      message: `Zalo is already linked${name}.`
    };
  }
  if (params.force) {
    await logoutZaloProfile(profile);
  }
  const existing = activeQrLogins.get(profile);
  if (existing && isQrLoginFresh(existing)) {
    if (existing.qrDataUrl) {
      return {
        qrDataUrl: existing.qrDataUrl,
        message: "QR already active. Scan it with the Zalo app."
      };
    }
  } else if (existing) {
    resetQrLogin(profile);
  }
  if (!activeQrLogins.has(profile)) {
    const login = {
      id: (0, import_node_crypto.randomUUID)(),
      profile,
      startedAt: Date.now(),
      connected: false,
      waitPromise: Promise.resolve()
    };
    login.waitPromise = (async () => {
      let capturedCredentials = null;
      try {
        const zalo = new Zalo({ logging: false, selfListen: false });
        const api = await zalo.loginQR(void 0, (event) => {
          const current2 = activeQrLogins.get(profile);
          if (!current2 || current2.id !== login.id) {
            return;
          }
          if (event.actions?.abort) {
            current2.abort = () => {
              try {
                event.actions?.abort?.();
              } catch {
              }
            };
          }
          switch (event.type) {
            case LoginQRCallbackEventType.QRCodeGenerated: {
              const image = event.data.image.replace(/^data:image\/png;base64,/, "");
              current2.qrDataUrl = image.startsWith("data:image") ? image : `data:image/png;base64,${image}`;
              break;
            }
            case LoginQRCallbackEventType.QRCodeExpired: {
              try {
                event.actions.retry();
              } catch {
                current2.error = "QR expired before confirmation. Start login again.";
              }
              break;
            }
            case LoginQRCallbackEventType.QRCodeDeclined: {
              current2.error = "QR login was declined on the phone.";
              break;
            }
            case LoginQRCallbackEventType.GotLoginInfo: {
              capturedCredentials = {
                imei: event.data.imei,
                cookie: event.data.cookie,
                userAgent: event.data.userAgent
              };
              break;
            }
            default:
              break;
          }
        });
        const current = activeQrLogins.get(profile);
        if (!current || current.id !== login.id) {
          return;
        }
        if (!capturedCredentials) {
          const ctx = api.getContext();
          const cookieJar = api.getCookie();
          const cookieJson = cookieJar.toJSON();
          capturedCredentials = {
            imei: ctx.imei,
            cookie: cookieJson?.cookies ?? [],
            userAgent: ctx.userAgent,
            language: ctx.language
          };
        }
        writeCredentials(profile, capturedCredentials);
        invalidateApi(profile);
        apiByProfile.set(profile, api);
        current.connected = true;
      } catch (error) {
        const current = activeQrLogins.get(profile);
        if (current && current.id === login.id) {
          current.error = toErrorMessage(error);
        }
      }
    })();
    activeQrLogins.set(profile, login);
  }
  const active = activeQrLogins.get(profile);
  if (!active) {
    return { message: "Failed to initialize Zalo QR login." };
  }
  const timeoutMs = Math.max(params.timeoutMs ?? DEFAULT_QR_START_TIMEOUT_MS, 3e3);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (active.error) {
      resetQrLogin(profile);
      return {
        message: `Failed to start QR login: ${active.error}`
      };
    }
    if (active.connected) {
      resetQrLogin(profile);
      return {
        message: "Zalo already connected."
      };
    }
    if (active.qrDataUrl) {
      return {
        qrDataUrl: active.qrDataUrl,
        message: "Scan this QR with the Zalo app."
      };
    }
    await delay(150);
  }
  return {
    message: "Still preparing QR. Call wait to continue checking login status."
  };
}
async function waitForZaloQrLogin(params) {
  const profile = normalizeProfile(params.profile);
  const active = activeQrLogins.get(profile);
  if (!active) {
    const connected = await checkZaloAuthenticated(profile);
    return {
      connected,
      message: connected ? "Zalo session is ready." : "No active Zalo QR login in progress."
    };
  }
  if (!isQrLoginFresh(active)) {
    resetQrLogin(profile);
    return {
      connected: false,
      message: "QR login expired. Start again to generate a fresh QR code."
    };
  }
  const timeoutMs = Math.max(params.timeoutMs ?? DEFAULT_QR_WAIT_TIMEOUT_MS, 1e3);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (active.error) {
      const message = `Zalo login failed: ${active.error}`;
      resetQrLogin(profile);
      return {
        connected: false,
        message
      };
    }
    if (active.connected) {
      resetQrLogin(profile);
      return {
        connected: true,
        message: "Login successful."
      };
    }
    await Promise.race([active.waitPromise, delay(400)]);
  }
  return {
    connected: false,
    message: "Still waiting for QR scan confirmation."
  };
}
async function logoutZaloProfile(profileInput) {
  const profile = normalizeProfile(profileInput);
  resetQrLogin(profile);
  clearCachedGroupContext(profile);
  const listener = activeListeners.get(profile);
  if (listener) {
    try {
      listener.stop();
    } catch {
    }
    activeListeners.delete(profile);
  }
  invalidateApi(profile);
  const cleared = clearCredentials(profile);
  return {
    cleared,
    loggedOut: true,
    message: cleared ? "Logged out and cleared local session." : "No local session to clear."
  };
}
async function startZaloListener(params) {
  const profile = normalizeProfile(params.profile);
  const existing = activeListeners.get(profile);
  if (existing) {
    throw new Error(
      `Zalo listener already running for profile "${profile}" (account "${existing.accountId}")`
    );
  }
  const api = await ensureApi(profile);
  const ownUserId = await resolveOwnUserId(api);
  let stopped = false;
  let watchdogTimer = null;
  let lastWatchdogTickAt = Date.now();
  const cleanup = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    if (watchdogTimer) {
      clearInterval(watchdogTimer);
      watchdogTimer = null;
    }
    try {
      api.listener.off("message", onMessage);
      api.listener.off("error", onError);
      api.listener.off("closed", onClosed);
    } catch {
    }
    try {
      api.listener.stop();
    } catch {
    }
    activeListeners.delete(profile);
  };
  const onMessage = (incoming) => {
    if (incoming.isSelf) {
      return;
    }
    const normalized = toInboundMessage(incoming, ownUserId);
    if (!normalized) {
      return;
    }
    params.onMessage(normalized);
  };
  const failListener = (error) => {
    if (stopped || params.abortSignal.aborted) {
      return;
    }
    cleanup();
    invalidateApi(profile);
    params.onError(error);
  };
  const onError = (error) => {
    const wrapped = error instanceof Error ? error : new Error(String(error));
    failListener(wrapped);
  };
  const onClosed = (code, reason) => {
    failListener(new Error(`Zalo listener closed (${code}): ${reason || "no reason"}`));
  };
  api.listener.on("message", onMessage);
  api.listener.on("error", onError);
  api.listener.on("closed", onClosed);
  try {
    api.listener.start({ retryOnClose: false });
  } catch (error) {
    cleanup();
    throw error;
  }
  watchdogTimer = setInterval(() => {
    if (stopped || params.abortSignal.aborted) {
      return;
    }
    const now = Date.now();
    const gapMs = now - lastWatchdogTickAt;
    lastWatchdogTickAt = now;
    if (gapMs <= LISTENER_WATCHDOG_MAX_GAP_MS) {
      return;
    }
    failListener(
      new Error(
        `Zalo listener watchdog gap detected (${Math.round(gapMs / 1e3)}s): forcing reconnect`
      )
    );
  }, LISTENER_WATCHDOG_INTERVAL_MS);
  watchdogTimer.unref?.();
  params.abortSignal.addEventListener(
    "abort",
    () => {
      cleanup();
    },
    { once: true }
  );
  activeListeners.set(profile, {
    profile,
    accountId: params.accountId,
    stop: cleanup
  });
  return { stop: cleanup };
}
async function resolveZaloGroupsByEntries(params) {
  const groups = await listZaloGroups(params.profile);
  const byName = /* @__PURE__ */ new Map();
  for (const group of groups) {
    const key = group.name.trim().toLowerCase();
    if (!key) {
      continue;
    }
    const list = byName.get(key) ?? [];
    list.push(group);
    byName.set(key, list);
  }
  return params.entries.map((input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { input, resolved: false };
    }
    if (/^\d+$/.test(trimmed)) {
      return { input, resolved: true, id: trimmed };
    }
    const candidates = byName.get(trimmed.toLowerCase()) ?? [];
    const match = candidates[0];
    return match ? { input, resolved: true, id: match.groupId } : { input, resolved: false };
  });
}
async function resolveZaloAllowFromEntries(params) {
  const friends = await listZaloFriends(params.profile);
  const byName = /* @__PURE__ */ new Map();
  for (const friend of friends) {
    const key = friend.displayName.trim().toLowerCase();
    if (!key) {
      continue;
    }
    const list = byName.get(key) ?? [];
    list.push(friend);
    byName.set(key, list);
  }
  return params.entries.map((input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { input, resolved: false };
    }
    if (/^\d+$/.test(trimmed)) {
      return { input, resolved: true, id: trimmed };
    }
    const matches = byName.get(trimmed.toLowerCase()) ?? [];
    const match = matches[0];
    if (!match) {
      return { input, resolved: false };
    }
    return {
      input,
      resolved: true,
      id: match.userId,
      note: matches.length > 1 ? "multiple matches; chose first" : void 0
    };
  });
}
var import_node_crypto, import_node_fs, import_promises, import_node_os, import_node_path, import_zalouser, API_LOGIN_TIMEOUT_MS, QR_LOGIN_TTL_MS, DEFAULT_QR_START_TIMEOUT_MS, DEFAULT_QR_WAIT_TIMEOUT_MS, GROUP_INFO_CHUNK_SIZE, GROUP_CONTEXT_CACHE_TTL_MS, GROUP_CONTEXT_CACHE_MAX_ENTRIES, LISTENER_WATCHDOG_INTERVAL_MS, LISTENER_WATCHDOG_MAX_GAP_MS, apiByProfile, apiInitByProfile, activeQrLogins, activeListeners, groupContextCache;
var init_zalo_js = __esm({
  "src/core/extensions/zalouser/src/zalo-js.ts"() {
    "use strict";
    import_node_crypto = require("node:crypto");
    import_node_fs = __toESM(require("node:fs"), 1);
    import_promises = __toESM(require("node:fs/promises"), 1);
    import_node_os = __toESM(require("node:os"), 1);
    import_node_path = __toESM(require("node:path"), 1);
    import_zalouser = require("src/core/source/plugin-sdk/zalouser");
    init_reaction();
    init_runtime();
    init_zca_client();
    API_LOGIN_TIMEOUT_MS = 2e4;
    QR_LOGIN_TTL_MS = 3 * 6e4;
    DEFAULT_QR_START_TIMEOUT_MS = 3e4;
    DEFAULT_QR_WAIT_TIMEOUT_MS = 12e4;
    GROUP_INFO_CHUNK_SIZE = 80;
    GROUP_CONTEXT_CACHE_TTL_MS = 5 * 6e4;
    GROUP_CONTEXT_CACHE_MAX_ENTRIES = 500;
    LISTENER_WATCHDOG_INTERVAL_MS = 3e4;
    LISTENER_WATCHDOG_MAX_GAP_MS = 35e3;
    apiByProfile = /* @__PURE__ */ new Map();
    apiInitByProfile = /* @__PURE__ */ new Map();
    activeQrLogins = /* @__PURE__ */ new Map();
    activeListeners = /* @__PURE__ */ new Map();
    groupContextCache = /* @__PURE__ */ new Map();
  }
});

// src/core/extensions/zalouser/src/group-policy.ts
function toGroupCandidate(value) {
  return value?.trim() ?? "";
}
function normalizeZalouserGroupSlug(raw) {
  const trimmed = raw?.trim().toLowerCase() ?? "";
  if (!trimmed) {
    return "";
  }
  return trimmed.replace(/^#/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function buildZalouserGroupCandidates(params) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  const push = (value) => {
    const normalized = toGroupCandidate(value);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    out.push(normalized);
  };
  const groupId = toGroupCandidate(params.groupId);
  const groupChannel = toGroupCandidate(params.groupChannel);
  const groupName = toGroupCandidate(params.groupName);
  push(groupId);
  if (params.includeGroupIdAlias === true && groupId) {
    push(`group:${groupId}`);
  }
  if (params.allowNameMatching !== false) {
    push(groupChannel);
    push(groupName);
    if (groupName) {
      push(normalizeZalouserGroupSlug(groupName));
    }
  }
  if (params.includeWildcard !== false) {
    push("*");
  }
  return out;
}
function findZalouserGroupEntry(groups, candidates) {
  if (!groups) {
    return void 0;
  }
  for (const candidate of candidates) {
    const entry = groups[candidate];
    if (entry) {
      return entry;
    }
  }
  return void 0;
}
function isZalouserGroupEntryAllowed(entry) {
  if (!entry) {
    return false;
  }
  return entry.allow !== false && entry.enabled !== false;
}
var init_group_policy = __esm({
  "src/core/extensions/zalouser/src/group-policy.ts"() {
    "use strict";
  }
});

// src/core/extensions/zalouser/src/message-sid.ts
function toMessageSidPart(value) {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}
function parseZalouserMessageSidFull(value) {
  const raw = toMessageSidPart(value);
  if (!raw) {
    return null;
  }
  const [msgIdPart, cliMsgIdPart] = raw.split(":").map((entry) => entry.trim());
  if (!msgIdPart || !cliMsgIdPart) {
    return null;
  }
  return { msgId: msgIdPart, cliMsgId: cliMsgIdPart };
}
function resolveZalouserReactionMessageIds(params) {
  const explicitMessageId = toMessageSidPart(params.messageId);
  const explicitCliMsgId = toMessageSidPart(params.cliMsgId);
  if (explicitMessageId && explicitCliMsgId) {
    return { msgId: explicitMessageId, cliMsgId: explicitCliMsgId };
  }
  const parsedFromCurrent = parseZalouserMessageSidFull(params.currentMessageId);
  if (parsedFromCurrent) {
    return parsedFromCurrent;
  }
  const currentRaw = toMessageSidPart(params.currentMessageId);
  if (!currentRaw) {
    return null;
  }
  if (explicitMessageId && !explicitCliMsgId) {
    return { msgId: explicitMessageId, cliMsgId: currentRaw };
  }
  if (!explicitMessageId && explicitCliMsgId) {
    return { msgId: currentRaw, cliMsgId: explicitCliMsgId };
  }
  return { msgId: currentRaw, cliMsgId: currentRaw };
}
function formatZalouserMessageSidFull(params) {
  const msgId = toMessageSidPart(params.msgId);
  const cliMsgId = toMessageSidPart(params.cliMsgId);
  if (!msgId && !cliMsgId) {
    return void 0;
  }
  if (msgId && cliMsgId) {
    return `${msgId}:${cliMsgId}`;
  }
  return msgId || cliMsgId || void 0;
}
function resolveZalouserMessageSid(params) {
  const msgId = toMessageSidPart(params.msgId);
  const cliMsgId = toMessageSidPart(params.cliMsgId);
  if (msgId || cliMsgId) {
    return msgId || cliMsgId;
  }
  return toMessageSidPart(params.fallback) || void 0;
}
var init_message_sid = __esm({
  "src/core/extensions/zalouser/src/message-sid.ts"() {
    "use strict";
  }
});

// src/core/extensions/zalouser/src/text-styles.ts
function parseZalouserTextStyles(input) {
  const allStyles = [];
  const escapeMap = [];
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const lineStyles = [];
  const processedLines = [];
  let activeFence = null;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const { text: unquotedLine, indent: baseIndent } = stripQuotePrefix(rawLine);
    if (activeFence) {
      const codeLine = activeFence.quoteIndent > 0 ? stripQuotePrefix(rawLine, activeFence.quoteIndent).text : rawLine;
      if (isClosingFence(codeLine, activeFence)) {
        activeFence = null;
        continue;
      }
      processedLines.push(
        escapeLiteralText(
          normalizeCodeBlockLeadingWhitespace(stripCodeFenceIndent(codeLine, activeFence.indent)),
          escapeMap
        )
      );
      continue;
    }
    let line = unquotedLine;
    const openingFence = resolveOpeningFence(rawLine);
    if (openingFence) {
      const fenceLine = openingFence.quoteIndent > 0 ? unquotedLine : rawLine;
      if (!hasClosingFence(lines, lineIndex + 1, openingFence)) {
        processedLines.push(escapeLiteralText(fenceLine, escapeMap));
        activeFence = openingFence;
        continue;
      }
      activeFence = openingFence;
      continue;
    }
    const outputLineIndex = processedLines.length;
    if (isIndentedCodeBlockLine(line)) {
      if (baseIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: baseIndent
        });
      }
      processedLines.push(escapeLiteralText(normalizeCodeBlockLeadingWhitespace(line), escapeMap));
      continue;
    }
    const { text: markdownLine, size: markdownPadding } = stripOptionalMarkdownPadding(line);
    const headingMatch = markdownLine.match(/^(#{1,4})\s(.*)$/);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      lineStyles.push({ lineIndex: outputLineIndex, style: TextStyle.Bold });
      if (depth === 1) {
        lineStyles.push({ lineIndex: outputLineIndex, style: TextStyle.Big });
      }
      if (baseIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: baseIndent
        });
      }
      processedLines.push(headingMatch[2]);
      continue;
    }
    const indentMatch = markdownLine.match(/^(\s+)(.*)$/);
    let indentLevel = 0;
    let content = markdownLine;
    if (indentMatch) {
      indentLevel = clampIndent(indentMatch[1].length);
      content = indentMatch[2];
    }
    const totalIndent = Math.min(5, baseIndent + indentLevel);
    if (/^[-*+]\s\[[ xX]\]\s/.test(content)) {
      if (totalIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: totalIndent
        });
      }
      processedLines.push(content);
      continue;
    }
    const orderedListMatch = content.match(/^(\d+)\.\s(.*)$/);
    if (orderedListMatch) {
      if (totalIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: totalIndent
        });
      }
      lineStyles.push({ lineIndex: outputLineIndex, style: TextStyle.OrderedList });
      processedLines.push(orderedListMatch[2]);
      continue;
    }
    const unorderedListMatch = content.match(/^[-*+]\s(.*)$/);
    if (unorderedListMatch) {
      if (totalIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: totalIndent
        });
      }
      lineStyles.push({ lineIndex: outputLineIndex, style: TextStyle.UnorderedList });
      processedLines.push(unorderedListMatch[1]);
      continue;
    }
    if (markdownPadding > 0) {
      if (baseIndent > 0) {
        lineStyles.push({
          lineIndex: outputLineIndex,
          style: TextStyle.Indent,
          indentSize: baseIndent
        });
      }
      processedLines.push(line);
      continue;
    }
    if (totalIndent > 0) {
      lineStyles.push({
        lineIndex: outputLineIndex,
        style: TextStyle.Indent,
        indentSize: totalIndent
      });
      processedLines.push(content);
      continue;
    }
    processedLines.push(line);
  }
  const segments = parseInlineSegments(processedLines.join("\n"));
  let plainText = "";
  for (const segment of segments) {
    const start = plainText.length;
    plainText += segment.text;
    for (const style of segment.styles) {
      allStyles.push({ start, len: segment.text.length, st: style });
    }
  }
  if (escapeMap.length > 0) {
    const escapeRegex = /\x01(\d+)\x02/g;
    const shifts = [];
    let cumulativeDelta = 0;
    for (const match of plainText.matchAll(escapeRegex)) {
      const escapeIndex = Number.parseInt(match[1], 10);
      cumulativeDelta += match[0].length - escapeMap[escapeIndex].length;
      shifts.push({ pos: (match.index ?? 0) + match[0].length, delta: cumulativeDelta });
    }
    for (const style of allStyles) {
      let startDelta = 0;
      let endDelta = 0;
      const end = style.start + style.len;
      for (const shift of shifts) {
        if (shift.pos <= style.start) {
          startDelta = shift.delta;
        }
        if (shift.pos <= end) {
          endDelta = shift.delta;
        }
      }
      style.start -= startDelta;
      style.len -= endDelta - startDelta;
    }
    plainText = plainText.replace(
      escapeRegex,
      (_match, index) => escapeMap[Number.parseInt(index, 10)]
    );
  }
  const finalLines = plainText.split("\n");
  let offset = 0;
  for (let lineIndex = 0; lineIndex < finalLines.length; lineIndex += 1) {
    const lineLength = finalLines[lineIndex].length;
    if (lineLength > 0) {
      for (const lineStyle of lineStyles) {
        if (lineStyle.lineIndex !== lineIndex) {
          continue;
        }
        if (lineStyle.style === TextStyle.Indent) {
          allStyles.push({
            start: offset,
            len: lineLength,
            st: TextStyle.Indent,
            indentSize: lineStyle.indentSize
          });
        } else {
          allStyles.push({ start: offset, len: lineLength, st: lineStyle.style });
        }
      }
    }
    offset += lineLength + 1;
  }
  return { text: plainText, styles: allStyles };
}
function clampIndent(spaceCount) {
  return Math.min(5, Math.max(1, Math.floor(spaceCount / 2)));
}
function stripOptionalMarkdownPadding(line) {
  const match = line.match(/^( {1,3})(?=\S)/);
  if (!match) {
    return { text: line, size: 0 };
  }
  return {
    text: line.slice(match[1].length),
    size: match[1].length
  };
}
function hasClosingFence(lines, startIndex, fence) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const candidate = fence.quoteIndent > 0 ? stripQuotePrefix(lines[index], fence.quoteIndent).text : lines[index];
    if (isClosingFence(candidate, fence)) {
      return true;
    }
  }
  return false;
}
function resolveOpeningFence(line) {
  const directFence = parseFenceMarker(line);
  if (directFence) {
    return { ...directFence, quoteIndent: 0 };
  }
  const quoted = stripQuotePrefix(line);
  if (quoted.indent === 0) {
    return null;
  }
  const quotedFence = parseFenceMarker(quoted.text);
  if (!quotedFence) {
    return null;
  }
  return {
    ...quotedFence,
    quoteIndent: quoted.indent
  };
}
function stripQuotePrefix(line, maxDepth = Number.POSITIVE_INFINITY) {
  let cursor = 0;
  while (cursor < line.length && cursor < 3 && line[cursor] === " ") {
    cursor += 1;
  }
  let removedDepth = 0;
  let consumedCursor = cursor;
  while (removedDepth < maxDepth && consumedCursor < line.length && line[consumedCursor] === ">") {
    removedDepth += 1;
    consumedCursor += 1;
    if (line[consumedCursor] === " ") {
      consumedCursor += 1;
    }
  }
  if (removedDepth === 0) {
    return { text: line, indent: 0 };
  }
  return {
    text: line.slice(consumedCursor),
    indent: Math.min(5, removedDepth)
  };
}
function parseFenceMarker(line) {
  const match = line.match(/^([ ]{0,3})(`{3,}|~{3,})(.*)$/);
  if (!match) {
    return null;
  }
  const marker = match[2];
  const char = marker[0];
  if (char !== "`" && char !== "~") {
    return null;
  }
  return {
    char,
    length: marker.length,
    indent: match[1].length
  };
}
function isClosingFence(line, fence) {
  const match = line.match(/^([ ]{0,3})(`{3,}|~{3,})[ \t]*$/);
  if (!match) {
    return false;
  }
  return match[2][0] === fence.char && match[2].length >= fence.length;
}
function escapeLiteralText(input, escapeMap) {
  return input.replace(/[\\*_~{}`]/g, (ch) => {
    const index = escapeMap.length;
    escapeMap.push(ch);
    return `${index}`;
  });
}
function parseInlineSegments(text, inheritedStyles = []) {
  const segments = [];
  let cursor = 0;
  while (cursor < text.length) {
    const nextMatch = findNextInlineMatch(text, cursor);
    if (!nextMatch) {
      pushSegment(segments, text.slice(cursor), inheritedStyles);
      break;
    }
    if (nextMatch.match.index > cursor) {
      pushSegment(segments, text.slice(cursor, nextMatch.match.index), inheritedStyles);
    }
    const combinedStyles = [...inheritedStyles, ...nextMatch.styles];
    if (nextMatch.marker.literal) {
      pushSegment(segments, nextMatch.text, combinedStyles);
    } else {
      segments.push(...parseInlineSegments(nextMatch.text, combinedStyles));
    }
    cursor = nextMatch.match.index + nextMatch.match[0].length;
  }
  return segments;
}
function findNextInlineMatch(text, startIndex) {
  let bestMatch = null;
  for (const [priority, marker] of INLINE_MARKERS.entries()) {
    const regex = new RegExp(marker.pattern.source, marker.pattern.flags);
    regex.lastIndex = startIndex;
    const match = regex.exec(text);
    if (!match) {
      continue;
    }
    if (bestMatch && (match.index > bestMatch.match.index || match.index === bestMatch.match.index && priority > bestMatch.priority)) {
      continue;
    }
    bestMatch = {
      match,
      marker,
      text: marker.extractText(match),
      styles: marker.resolveStyles?.(match) ?? [],
      priority
    };
  }
  return bestMatch;
}
function pushSegment(segments, text, styles) {
  if (!text) {
    return;
  }
  const lastSegment = segments.at(-1);
  if (lastSegment && sameStyles(lastSegment.styles, styles)) {
    lastSegment.text += text;
    return;
  }
  segments.push({
    text,
    styles: [...styles]
  });
}
function sameStyles(left, right) {
  return left.length === right.length && left.every((style, index) => style === right[index]);
}
function normalizeCodeBlockLeadingWhitespace(line) {
  return line.replace(
    /^[ \t]+/,
    (leadingWhitespace) => leadingWhitespace.replace(/\t/g, "\xA0\xA0\xA0\xA0").replace(/ /g, "\xA0")
  );
}
function isIndentedCodeBlockLine(line) {
  return /^(?: {4,}|\t)/.test(line);
}
function stripCodeFenceIndent(line, indent) {
  let consumed = 0;
  let cursor = 0;
  while (cursor < line.length && consumed < indent && line[cursor] === " ") {
    cursor += 1;
    consumed += 1;
  }
  return line.slice(cursor);
}
var TAG_STYLE_MAP, INLINE_MARKERS;
var init_text_styles = __esm({
  "src/core/extensions/zalouser/src/text-styles.ts"() {
    "use strict";
    init_zca_client();
    TAG_STYLE_MAP = {
      red: TextStyle.Red,
      orange: TextStyle.Orange,
      yellow: TextStyle.Yellow,
      green: TextStyle.Green,
      small: null,
      big: TextStyle.Big,
      underline: TextStyle.Underline
    };
    INLINE_MARKERS = [
      {
        pattern: /`([^`\n]+)`/g,
        extractText: (match) => match[0],
        literal: true
      },
      {
        pattern: /\\([*_~#\\{}>+\-`])/g,
        extractText: (match) => match[1],
        literal: true
      },
      {
        pattern: new RegExp(`\\{(${Object.keys(TAG_STYLE_MAP).join("|")})\\}(.+?)\\{/\\1\\}`, "g"),
        extractText: (match) => match[2],
        resolveStyles: (match) => {
          const style = TAG_STYLE_MAP[match[1]];
          return style ? [style] : [];
        }
      },
      {
        pattern: /(?<!\*)\*\*\*(?=\S)([^\n]*?\S)(?<!\*)\*\*\*(?!\*)/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.Bold, TextStyle.Italic]
      },
      {
        pattern: /(?<!\*)\*\*(?![\s*])([^\n]*?\S)(?<!\*)\*\*(?!\*)/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.Bold]
      },
      {
        pattern: /(?<![\w_])__(?![\s_])([^\n]*?\S)(?<!_)__(?![\w_])/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.Bold]
      },
      {
        pattern: /(?<!~)~~(?=\S)([^\n]*?\S)(?<!~)~~(?!~)/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.StrikeThrough]
      },
      {
        pattern: /(?<!\*)\*(?![\s*])([^\n]*?\S)(?<!\*)\*(?!\*)/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.Italic]
      },
      {
        pattern: /(?<![\w_])_(?![\s_])([^\n]*?\S)(?<!_)_(?![\w_])/g,
        extractText: (match) => match[1],
        resolveStyles: () => [TextStyle.Italic]
      }
    ];
  }
});

// src/core/extensions/zalouser/src/send.ts
async function sendMessageZalouser(threadId, text, options = {}) {
  const prepared = options.textMode === "markdown" ? parseZalouserTextStyles(text) : { text, styles: options.textStyles };
  const textChunkLimit = options.textChunkLimit ?? ZALO_TEXT_LIMIT;
  const chunks = splitStyledText(
    prepared.text,
    (prepared.styles?.length ?? 0) > 0 ? prepared.styles : void 0,
    textChunkLimit,
    options.textChunkMode
  );
  let lastResult = null;
  for (const [index, chunk] of chunks.entries()) {
    const chunkOptions = index === 0 ? { ...options, textStyles: chunk.styles } : {
      ...options,
      caption: void 0,
      mediaLocalRoots: void 0,
      mediaUrl: void 0,
      textStyles: chunk.styles
    };
    const result = await sendZaloTextMessage(threadId, chunk.text, chunkOptions);
    if (!result.ok) {
      return result;
    }
    lastResult = result;
  }
  return lastResult ?? { ok: false, error: "No message content provided" };
}
async function sendImageZalouser(threadId, imageUrl, options = {}) {
  return await sendMessageZalouser(threadId, options.caption ?? "", {
    ...options,
    caption: void 0,
    mediaUrl: imageUrl
  });
}
async function sendLinkZalouser(threadId, url, options = {}) {
  return await sendZaloLink(threadId, url, options);
}
async function sendTypingZalouser(threadId, options = {}) {
  await sendZaloTypingEvent(threadId, options);
}
async function sendReactionZalouser(params) {
  const result = await sendZaloReaction({
    profile: params.profile,
    threadId: params.threadId,
    isGroup: params.isGroup,
    msgId: params.msgId,
    cliMsgId: params.cliMsgId,
    emoji: params.emoji,
    remove: params.remove
  });
  return {
    ok: result.ok,
    error: result.error
  };
}
async function sendDeliveredZalouser(params) {
  await sendZaloDeliveredEvent(params);
}
async function sendSeenZalouser(params) {
  await sendZaloSeenEvent(params);
}
function splitStyledText(text, styles, limit, mode) {
  if (text.length === 0) {
    return [{ text, styles: void 0 }];
  }
  const chunks = [];
  for (const range of splitTextRanges(text, limit, mode ?? DEFAULT_TEXT_CHUNK_MODE)) {
    const { start, end } = range;
    chunks.push({
      text: text.slice(start, end),
      styles: sliceTextStyles(styles, start, end)
    });
  }
  return chunks;
}
function sliceTextStyles(styles, start, end) {
  if (!styles || styles.length === 0) {
    return void 0;
  }
  const chunkStyles = styles.map((style) => {
    const overlapStart = Math.max(style.start, start);
    const overlapEnd = Math.min(style.start + style.len, end);
    if (overlapEnd <= overlapStart) {
      return null;
    }
    if (style.st === TextStyle.Indent) {
      return {
        start: overlapStart - start,
        len: overlapEnd - overlapStart,
        st: style.st,
        indentSize: style.indentSize
      };
    }
    return {
      start: overlapStart - start,
      len: overlapEnd - overlapStart,
      st: style.st
    };
  }).filter((style) => style !== null);
  return chunkStyles.length > 0 ? chunkStyles : void 0;
}
function splitTextRanges(text, limit, mode) {
  if (mode === "newline") {
    return splitTextRangesByPreferredBreaks(text, limit);
  }
  const ranges = [];
  for (let start = 0; start < text.length; start += limit) {
    ranges.push({
      start,
      end: Math.min(text.length, start + limit)
    });
  }
  return ranges;
}
function splitTextRangesByPreferredBreaks(text, limit) {
  const ranges = [];
  let start = 0;
  while (start < text.length) {
    const maxEnd = Math.min(text.length, start + limit);
    let end = maxEnd;
    if (maxEnd < text.length) {
      end = findParagraphBreak(text, start, maxEnd) ?? findLastBreak(text, "\n", start, maxEnd) ?? findLastWhitespaceBreak(text, start, maxEnd) ?? maxEnd;
    }
    if (end <= start) {
      end = maxEnd;
    }
    ranges.push({ start, end });
    start = end;
  }
  return ranges;
}
function findParagraphBreak(text, start, end) {
  const slice = text.slice(start, end);
  const matches = slice.matchAll(/\n[\t ]*\n+/g);
  let lastMatch;
  for (const match of matches) {
    lastMatch = match;
  }
  if (!lastMatch || lastMatch.index === void 0) {
    return void 0;
  }
  return start + lastMatch.index + lastMatch[0].length;
}
function findLastBreak(text, marker, start, end) {
  const index = text.lastIndexOf(marker, end - 1);
  if (index < start) {
    return void 0;
  }
  return index + marker.length;
}
function findLastWhitespaceBreak(text, start, end) {
  for (let index = end - 1; index > start; index -= 1) {
    if (/\s/.test(text[index])) {
      return index + 1;
    }
  }
  return void 0;
}
var ZALO_TEXT_LIMIT, DEFAULT_TEXT_CHUNK_MODE;
var init_send = __esm({
  "src/core/extensions/zalouser/src/send.ts"() {
    "use strict";
    init_text_styles();
    init_zalo_js();
    init_zca_client();
    ZALO_TEXT_LIMIT = 2e3;
    DEFAULT_TEXT_CHUNK_MODE = "length";
  }
});

// src/core/extensions/zalouser/src/monitor.ts
var monitor_exports = {};
__export(monitor_exports, {
  __testing: () => __testing,
  monitorZalouserProvider: () => monitorZalouserProvider
});
function normalizeZalouserEntry(entry) {
  return entry.replace(/^(zalouser|zlu):/i, "").trim();
}
function buildNameIndex(items, nameFn) {
  const index = /* @__PURE__ */ new Map();
  for (const item of items) {
    const name = nameFn(item)?.trim().toLowerCase();
    if (!name) {
      continue;
    }
    const list = index.get(name) ?? [];
    list.push(item);
    index.set(name, list);
  }
  return index;
}
function resolveUserAllowlistEntries(entries, byName) {
  const additions = [];
  const mapping = [];
  const unresolved = [];
  for (const entry of entries) {
    if (/^\d+$/.test(entry)) {
      additions.push(entry);
      continue;
    }
    const matches = byName.get(entry.toLowerCase()) ?? [];
    const match = matches[0];
    const id = match?.userId ? String(match.userId) : void 0;
    if (id) {
      additions.push(id);
      mapping.push(`${entry}->${id}`);
    } else {
      unresolved.push(entry);
    }
  }
  return { additions, mapping, unresolved };
}
function resolveInboundQueueKey(message) {
  const threadId = message.threadId?.trim() || "unknown";
  if (message.isGroup) {
    return `group:${threadId}`;
  }
  const senderId = message.senderId?.trim();
  return `direct:${senderId || threadId}`;
}
function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function resolveZalouserDmSessionScope(config) {
  const configured = config.session?.dmScope;
  return configured === "main" || !configured ? "per-channel-peer" : configured;
}
function resolveZalouserInboundSessionKey(params) {
  if (params.isGroup) {
    return params.route.sessionKey;
  }
  const directSessionKey = params.core.channel.routing.buildAgentSessionKey({
    agentId: params.route.agentId,
    channel: "zalouser",
    accountId: params.route.accountId,
    peer: { kind: "direct", id: params.senderId },
    dmScope: resolveZalouserDmSessionScope(params.config),
    identityLinks: params.config.session?.identityLinks
  }).toLowerCase();
  const legacySessionKey = params.core.channel.routing.buildAgentSessionKey({
    agentId: params.route.agentId,
    channel: "zalouser",
    accountId: params.route.accountId,
    peer: { kind: "group", id: params.senderId }
  }).toLowerCase();
  const hasDirectSession = params.core.channel.session.readSessionUpdatedAt({
    storePath: params.storePath,
    sessionKey: directSessionKey
  }) !== void 0;
  const hasLegacySession = params.core.channel.session.readSessionUpdatedAt({
    storePath: params.storePath,
    sessionKey: legacySessionKey
  }) !== void 0;
  return hasLegacySession && !hasDirectSession ? legacySessionKey : directSessionKey;
}
function logVerbose(core, runtime, message) {
  if (core.logging.shouldLogVerbose()) {
    runtime.log(`[zalouser] ${message}`);
  }
}
function isSenderAllowed(senderId, allowFrom) {
  if (allowFrom.includes("*")) {
    return true;
  }
  const normalizedSenderId = senderId?.trim().toLowerCase();
  if (!normalizedSenderId) {
    return false;
  }
  return allowFrom.some((entry) => {
    const normalized = entry.toLowerCase().replace(/^(zalouser|zlu):/i, "");
    return normalized === normalizedSenderId;
  });
}
function resolveGroupRequireMention(params) {
  const entry = findZalouserGroupEntry(
    params.groups ?? {},
    buildZalouserGroupCandidates({
      groupId: params.groupId,
      groupName: params.groupName,
      includeGroupIdAlias: true,
      includeWildcard: true,
      allowNameMatching: params.allowNameMatching
    })
  );
  if (typeof entry?.requireMention === "boolean") {
    return entry.requireMention;
  }
  return true;
}
async function sendZalouserDeliveryAcks(params) {
  await sendDeliveredZalouser({
    profile: params.profile,
    isGroup: params.isGroup,
    message: params.message,
    isSeen: true
  });
  await sendSeenZalouser({
    profile: params.profile,
    isGroup: params.isGroup,
    message: params.message
  });
}
async function processMessage(message, account, config, core, runtime, historyState, statusSink) {
  const pairing = (0, import_zalouser6.createScopedPairingAccess)({
    core,
    channel: "zalouser",
    accountId: account.accountId
  });
  const rawBody = message.content?.trim();
  if (!rawBody) {
    return;
  }
  const commandBody = message.commandContent?.trim() || rawBody;
  const isGroup = message.isGroup;
  const chatId = message.threadId;
  const senderId = message.senderId?.trim();
  if (!senderId) {
    logVerbose(core, runtime, `zalouser: drop message ${chatId} (missing senderId)`);
    return;
  }
  const senderName = message.senderName ?? "";
  const configuredGroupName = message.groupName?.trim() || "";
  const groupContext = isGroup && !configuredGroupName ? await resolveZaloGroupContext(account.profile, chatId).catch((err) => {
    logVerbose(
      core,
      runtime,
      `zalouser: group context lookup failed for ${chatId}: ${String(err)}`
    );
    return null;
  }) : null;
  const groupName = configuredGroupName || groupContext?.name?.trim() || "";
  const groupMembers = groupContext?.members?.slice(0, 20).join(", ") || void 0;
  if (message.eventMessage) {
    try {
      await sendZalouserDeliveryAcks({
        profile: account.profile,
        isGroup,
        message: message.eventMessage
      });
    } catch (err) {
      logVerbose(core, runtime, `zalouser: delivery/seen ack failed for ${chatId}: ${String(err)}`);
    }
  }
  const defaultGroupPolicy = (0, import_zalouser6.resolveDefaultGroupPolicy)(config);
  const { groupPolicy, providerMissingFallbackApplied } = (0, import_zalouser6.resolveOpenProviderRuntimeGroupPolicy)({
    providerConfigPresent: config.channels?.zalouser !== void 0,
    groupPolicy: account.config.groupPolicy,
    defaultGroupPolicy
  });
  (0, import_zalouser6.warnMissingProviderGroupPolicyFallbackOnce)({
    providerMissingFallbackApplied,
    providerKey: "zalouser",
    accountId: account.accountId,
    log: (entry) => logVerbose(core, runtime, entry)
  });
  const groups = account.config.groups ?? {};
  const allowNameMatching = (0, import_zalouser6.isDangerousNameMatchingEnabled)(account.config);
  if (isGroup) {
    const groupEntry = findZalouserGroupEntry(
      groups,
      buildZalouserGroupCandidates({
        groupId: chatId,
        groupName,
        includeGroupIdAlias: true,
        includeWildcard: true,
        allowNameMatching
      })
    );
    const routeAccess = (0, import_zalouser6.evaluateGroupRouteAccessForPolicy)({
      groupPolicy,
      routeAllowlistConfigured: Object.keys(groups).length > 0,
      routeMatched: Boolean(groupEntry),
      routeEnabled: isZalouserGroupEntryAllowed(groupEntry)
    });
    if (!routeAccess.allowed) {
      if (routeAccess.reason === "disabled") {
        logVerbose(core, runtime, `zalouser: drop group ${chatId} (groupPolicy=disabled)`);
      } else if (routeAccess.reason === "empty_allowlist") {
        logVerbose(
          core,
          runtime,
          `zalouser: drop group ${chatId} (groupPolicy=allowlist, no allowlist)`
        );
      } else if (routeAccess.reason === "route_not_allowlisted") {
        logVerbose(core, runtime, `zalouser: drop group ${chatId} (not allowlisted)`);
      } else if (routeAccess.reason === "route_disabled") {
        logVerbose(core, runtime, `zalouser: drop group ${chatId} (group disabled)`);
      }
      return;
    }
  }
  const dmPolicy2 = account.config.dmPolicy ?? "pairing";
  const configAllowFrom = (account.config.allowFrom ?? []).map((v) => String(v));
  const configGroupAllowFrom = (account.config.groupAllowFrom ?? []).map((v) => String(v));
  const shouldComputeCommandAuth = core.channel.commands.shouldComputeCommandAuthorized(
    commandBody,
    config
  );
  const storeAllowFrom = !isGroup && dmPolicy2 !== "allowlist" && (dmPolicy2 !== "open" || shouldComputeCommandAuth) ? await pairing.readAllowFromStore().catch(() => []) : [];
  const accessDecision = (0, import_compat3.resolveDmGroupAccessWithLists)({
    isGroup,
    dmPolicy: dmPolicy2,
    groupPolicy,
    allowFrom: configAllowFrom,
    groupAllowFrom: configGroupAllowFrom,
    storeAllowFrom,
    isSenderAllowed: (allowFrom) => isSenderAllowed(senderId, allowFrom)
  });
  if (isGroup && accessDecision.decision !== "allow") {
    if (accessDecision.reasonCode === import_compat3.DM_GROUP_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST) {
      logVerbose(core, runtime, "Blocked zalouser group message (no group allowlist)");
    } else if (accessDecision.reasonCode === import_compat3.DM_GROUP_ACCESS_REASON.GROUP_POLICY_NOT_ALLOWLISTED) {
      logVerbose(
        core,
        runtime,
        `Blocked zalouser sender ${senderId} (not in groupAllowFrom/allowFrom)`
      );
    }
    return;
  }
  if (!isGroup && accessDecision.decision !== "allow") {
    if (accessDecision.decision === "pairing") {
      await (0, import_zalouser6.issuePairingChallenge)({
        channel: "zalouser",
        senderId,
        senderIdLine: `Your Zalo user id: ${senderId}`,
        meta: { name: senderName || void 0 },
        upsertPairingRequest: pairing.upsertPairingRequest,
        onCreated: () => {
          logVerbose(core, runtime, `zalouser pairing request sender=${senderId}`);
        },
        sendPairingReply: async (text) => {
          await sendMessageZalouser(chatId, text, { profile: account.profile });
          statusSink?.({ lastOutboundAt: Date.now() });
        },
        onReplyError: (err) => {
          logVerbose(
            core,
            runtime,
            `zalouser pairing reply failed for ${senderId}: ${String(err)}`
          );
        }
      });
      return;
    }
    if (accessDecision.reasonCode === import_compat3.DM_GROUP_ACCESS_REASON.DM_POLICY_DISABLED) {
      logVerbose(core, runtime, `Blocked zalouser DM from ${senderId} (dmPolicy=disabled)`);
    } else {
      logVerbose(
        core,
        runtime,
        `Blocked unauthorized zalouser sender ${senderId} (dmPolicy=${dmPolicy2})`
      );
    }
    return;
  }
  const { commandAuthorized } = await (0, import_zalouser6.resolveSenderCommandAuthorization)({
    cfg: config,
    rawBody: commandBody,
    isGroup,
    dmPolicy: dmPolicy2,
    configuredAllowFrom: configAllowFrom,
    configuredGroupAllowFrom: configGroupAllowFrom,
    senderId,
    isSenderAllowed,
    readAllowFromStore: async () => storeAllowFrom,
    shouldComputeCommandAuthorized: (body2, cfg) => core.channel.commands.shouldComputeCommandAuthorized(body2, cfg),
    resolveCommandAuthorizedFromAuthorizers: (params) => core.channel.commands.resolveCommandAuthorizedFromAuthorizers(params)
  });
  const hasControlCommand = core.channel.commands.isControlCommandMessage(commandBody, config);
  if (isGroup && hasControlCommand && commandAuthorized !== true) {
    logVerbose(
      core,
      runtime,
      `zalouser: drop control command from unauthorized sender ${senderId}`
    );
    return;
  }
  const peer = isGroup ? { kind: "group", id: chatId } : { kind: "direct", id: senderId };
  const route = core.channel.routing.resolveAgentRoute({
    cfg: config,
    channel: "zalouser",
    accountId: account.accountId,
    peer: {
      // Keep DM peer kind as "direct" so session keys follow dmScope and UI labels stay DM-shaped.
      kind: peer.kind,
      id: peer.id
    }
  });
  const historyKey = isGroup ? route.sessionKey : void 0;
  const requireMention = isGroup ? resolveGroupRequireMention({
    groupId: chatId,
    groupName,
    groups,
    allowNameMatching
  }) : false;
  const mentionRegexes = core.channel.mentions.buildMentionRegexes(config, route.agentId);
  const explicitMention = {
    hasAnyMention: message.hasAnyMention === true,
    isExplicitlyMentioned: message.wasExplicitlyMentioned === true,
    canResolveExplicit: message.canResolveExplicitMention === true
  };
  const wasMentioned = isGroup ? core.channel.mentions.matchesMentionWithExplicit({
    text: rawBody,
    mentionRegexes,
    explicit: explicitMention
  }) : true;
  const canDetectMention = mentionRegexes.length > 0 || explicitMention.canResolveExplicit;
  const mentionGate = (0, import_zalouser6.resolveMentionGatingWithBypass)({
    isGroup,
    requireMention,
    canDetectMention,
    wasMentioned,
    implicitMention: message.implicitMention === true,
    hasAnyMention: explicitMention.hasAnyMention,
    allowTextCommands: core.channel.commands.shouldHandleTextCommands({
      cfg: config,
      surface: "zalouser"
    }),
    hasControlCommand,
    commandAuthorized: commandAuthorized === true
  });
  if (isGroup && requireMention && !canDetectMention && !mentionGate.effectiveWasMentioned) {
    runtime.error?.(
      `[${account.accountId}] zalouser mention required but detection unavailable (missing mention regexes and bot self id); dropping group ${chatId}`
    );
    return;
  }
  if (isGroup && mentionGate.shouldSkip) {
    (0, import_compat3.recordPendingHistoryEntryIfEnabled)({
      historyMap: historyState.groupHistories,
      historyKey: historyKey ?? "",
      limit: historyState.historyLimit,
      entry: historyKey && rawBody ? {
        sender: senderName || senderId,
        body: rawBody,
        timestamp: message.timestampMs,
        messageId: resolveZalouserMessageSid({
          msgId: message.msgId,
          cliMsgId: message.cliMsgId,
          fallback: `${message.timestampMs}`
        })
      } : null
    });
    logVerbose(core, runtime, `zalouser: skip group ${chatId} (mention required, not mentioned)`);
    return;
  }
  const fromLabel = isGroup ? groupName || `group:${chatId}` : senderName || `user:${senderId}`;
  const storePath = core.channel.session.resolveStorePath(config.session?.store, {
    agentId: route.agentId
  });
  const inboundSessionKey = resolveZalouserInboundSessionKey({
    core,
    config,
    route,
    storePath,
    isGroup,
    senderId
  });
  const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(config);
  const previousTimestamp = core.channel.session.readSessionUpdatedAt({
    storePath,
    sessionKey: inboundSessionKey
  });
  const body = core.channel.reply.formatAgentEnvelope({
    channel: "Zalo Personal",
    from: fromLabel,
    timestamp: message.timestampMs,
    previousTimestamp,
    envelope: envelopeOptions,
    body: rawBody
  });
  const combinedBody = isGroup && historyKey ? (0, import_compat3.buildPendingHistoryContextFromMap)({
    historyMap: historyState.groupHistories,
    historyKey,
    limit: historyState.historyLimit,
    currentMessage: body,
    formatEntry: (entry) => core.channel.reply.formatAgentEnvelope({
      channel: "Zalo Personal",
      from: fromLabel,
      timestamp: entry.timestamp,
      envelope: envelopeOptions,
      body: `${entry.sender}: ${entry.body}${entry.messageId ? ` [id:${entry.messageId}]` : ""}`
    })
  }) : body;
  const inboundHistory = isGroup && historyKey && historyState.historyLimit > 0 ? (historyState.groupHistories.get(historyKey) ?? []).map((entry) => ({
    sender: entry.sender,
    body: entry.body,
    timestamp: entry.timestamp
  })) : void 0;
  const normalizedTo = isGroup ? `zalouser:group:${chatId}` : `zalouser:${chatId}`;
  const ctxPayload = core.channel.reply.finalizeInboundContext({
    Body: combinedBody,
    BodyForAgent: rawBody,
    InboundHistory: inboundHistory,
    RawBody: rawBody,
    CommandBody: commandBody,
    BodyForCommands: commandBody,
    From: isGroup ? `zalouser:group:${chatId}` : `zalouser:${senderId}`,
    To: normalizedTo,
    SessionKey: inboundSessionKey,
    AccountId: route.accountId,
    ChatType: isGroup ? "group" : "direct",
    ConversationLabel: fromLabel,
    GroupSubject: isGroup ? groupName || void 0 : void 0,
    GroupChannel: isGroup ? groupName || void 0 : void 0,
    GroupMembers: isGroup ? groupMembers : void 0,
    SenderName: senderName || void 0,
    SenderId: senderId,
    WasMentioned: isGroup ? mentionGate.effectiveWasMentioned : void 0,
    CommandAuthorized: commandAuthorized,
    Provider: "zalouser",
    Surface: "zalouser",
    MessageSid: resolveZalouserMessageSid({
      msgId: message.msgId,
      cliMsgId: message.cliMsgId,
      fallback: `${message.timestampMs}`
    }),
    MessageSidFull: formatZalouserMessageSidFull({
      msgId: message.msgId,
      cliMsgId: message.cliMsgId
    }),
    OriginatingChannel: "zalouser",
    OriginatingTo: normalizedTo
  });
  await core.channel.session.recordInboundSession({
    storePath,
    sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
    ctx: ctxPayload,
    onRecordError: (err) => {
      runtime.error?.(`zalouser: failed updating session meta: ${String(err)}`);
    }
  });
  const { onModelSelected, ...prefixOptions } = (0, import_zalouser6.createReplyPrefixOptions)({
    cfg: config,
    agentId: route.agentId,
    channel: "zalouser",
    accountId: account.accountId
  });
  const typingCallbacks = (0, import_zalouser6.createTypingCallbacks)({
    start: async () => {
      await sendTypingZalouser(chatId, {
        profile: account.profile,
        isGroup
      });
    },
    onStartError: (err) => {
      runtime.error?.(
        `[${account.accountId}] zalouser typing start failed for ${chatId}: ${String(err)}`
      );
      logVerbose(core, runtime, `zalouser typing failed for ${chatId}: ${String(err)}`);
    }
  });
  await core.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
    ctx: ctxPayload,
    cfg: config,
    dispatcherOptions: {
      ...prefixOptions,
      typingCallbacks,
      deliver: async (payload) => {
        await deliverZalouserReply({
          payload,
          profile: account.profile,
          chatId,
          isGroup,
          runtime,
          core,
          config,
          accountId: account.accountId,
          statusSink,
          tableMode: core.channel.text.resolveMarkdownTableMode({
            cfg: config,
            channel: "zalouser",
            accountId: account.accountId
          })
        });
      },
      onError: (err, info) => {
        runtime.error(`[${account.accountId}] Zalouser ${info.kind} reply failed: ${String(err)}`);
      }
    },
    replyOptions: {
      onModelSelected
    }
  });
  if (isGroup && historyKey) {
    (0, import_compat3.clearHistoryEntriesIfEnabled)({
      historyMap: historyState.groupHistories,
      historyKey,
      limit: historyState.historyLimit
    });
  }
}
async function deliverZalouserReply(params) {
  const { payload, profile, chatId, isGroup, runtime, core, config, accountId, statusSink } = params;
  const tableMode = params.tableMode ?? "code";
  const text = core.channel.text.convertMarkdownTables(payload.text ?? "", tableMode);
  const chunkMode = core.channel.text.resolveChunkMode(config, "zalouser", accountId);
  const textChunkLimit = core.channel.text.resolveTextChunkLimit(config, "zalouser", accountId, {
    fallbackLimit: ZALOUSER_TEXT_LIMIT
  });
  const sentMedia = await (0, import_zalouser6.sendMediaWithLeadingCaption)({
    mediaUrls: (0, import_zalouser6.resolveOutboundMediaUrls)(payload),
    caption: text,
    send: async ({ mediaUrl, caption }) => {
      logVerbose(core, runtime, `Sending media to ${chatId}`);
      await sendMessageZalouser(chatId, caption ?? "", {
        profile,
        mediaUrl,
        isGroup,
        textMode: "markdown",
        textChunkMode: chunkMode,
        textChunkLimit
      });
      statusSink?.({ lastOutboundAt: Date.now() });
    },
    onError: (error) => {
      runtime.error(`Zalouser media send failed: ${String(error)}`);
    }
  });
  if (sentMedia) {
    return;
  }
  if (text) {
    try {
      await sendMessageZalouser(chatId, text, {
        profile,
        isGroup,
        textMode: "markdown",
        textChunkMode: chunkMode,
        textChunkLimit
      });
      statusSink?.({ lastOutboundAt: Date.now() });
    } catch (err) {
      runtime.error(`Zalouser message send failed: ${String(err)}`);
    }
  }
}
async function monitorZalouserProvider(options) {
  let { account, config } = options;
  const { abortSignal, statusSink, runtime } = options;
  const core = getZalouserRuntime();
  const inboundQueue = new import_compat3.KeyedAsyncQueue();
  const historyLimit = Math.max(
    0,
    account.config.historyLimit ?? config.messages?.groupChat?.historyLimit ?? import_compat3.DEFAULT_GROUP_HISTORY_LIMIT
  );
  const groupHistories = /* @__PURE__ */ new Map();
  try {
    const profile = account.profile;
    const allowFromEntries = (account.config.allowFrom ?? []).map((entry) => normalizeZalouserEntry(String(entry))).filter((entry) => entry && entry !== "*");
    const groupAllowFromEntries = (account.config.groupAllowFrom ?? []).map((entry) => normalizeZalouserEntry(String(entry))).filter((entry) => entry && entry !== "*");
    if (allowFromEntries.length > 0 || groupAllowFromEntries.length > 0) {
      const friends = await listZaloFriends(profile);
      const byName = buildNameIndex(friends, (friend) => friend.displayName);
      if (allowFromEntries.length > 0) {
        const { additions, mapping, unresolved } = resolveUserAllowlistEntries(
          allowFromEntries,
          byName
        );
        const allowFrom = (0, import_zalouser6.mergeAllowlist)({ existing: account.config.allowFrom, additions });
        account = {
          ...account,
          config: {
            ...account.config,
            allowFrom
          }
        };
        (0, import_zalouser6.summarizeMapping)("zalouser users", mapping, unresolved, runtime);
      }
      if (groupAllowFromEntries.length > 0) {
        const { additions, mapping, unresolved } = resolveUserAllowlistEntries(
          groupAllowFromEntries,
          byName
        );
        const groupAllowFrom = (0, import_zalouser6.mergeAllowlist)({
          existing: account.config.groupAllowFrom,
          additions
        });
        account = {
          ...account,
          config: {
            ...account.config,
            groupAllowFrom
          }
        };
        (0, import_zalouser6.summarizeMapping)("zalouser group users", mapping, unresolved, runtime);
      }
    }
    const groupsConfig = account.config.groups ?? {};
    const groupKeys = Object.keys(groupsConfig).filter((key) => key !== "*");
    if (groupKeys.length > 0) {
      const groups = await listZaloGroups(profile);
      const byName = buildNameIndex(groups, (group) => group.name);
      const mapping = [];
      const unresolved = [];
      const nextGroups = { ...groupsConfig };
      for (const entry of groupKeys) {
        const cleaned = normalizeZalouserEntry(entry);
        if (/^\d+$/.test(cleaned)) {
          if (!nextGroups[cleaned]) {
            nextGroups[cleaned] = groupsConfig[entry];
          }
          mapping.push(`${entry}\u2192${cleaned}`);
          continue;
        }
        const matches = byName.get(cleaned.toLowerCase()) ?? [];
        const match = matches[0];
        const id = match?.groupId ? String(match.groupId) : void 0;
        if (id) {
          if (!nextGroups[id]) {
            nextGroups[id] = groupsConfig[entry];
          }
          mapping.push(`${entry}\u2192${id}`);
        } else {
          unresolved.push(entry);
        }
      }
      account = {
        ...account,
        config: {
          ...account.config,
          groups: nextGroups
        }
      };
      (0, import_zalouser6.summarizeMapping)("zalouser groups", mapping, unresolved, runtime);
    }
  } catch (err) {
    runtime.log?.(`zalouser resolve failed; using config entries. ${String(err)}`);
  }
  let listenerStop = null;
  let stopped = false;
  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    listenerStop?.();
    listenerStop = null;
  };
  let settled = false;
  const { promise: waitForExit, resolve: resolveRun, reject: rejectRun } = createDeferred();
  const settleSuccess = () => {
    if (settled) {
      return;
    }
    settled = true;
    stop();
    resolveRun();
  };
  const settleFailure = (error) => {
    if (settled) {
      return;
    }
    settled = true;
    stop();
    rejectRun(error instanceof Error ? error : new Error(String(error)));
  };
  const onAbort = () => {
    settleSuccess();
  };
  abortSignal.addEventListener("abort", onAbort, { once: true });
  let listener;
  try {
    listener = await startZaloListener({
      accountId: account.accountId,
      profile: account.profile,
      abortSignal,
      onMessage: (msg) => {
        if (stopped) {
          return;
        }
        logVerbose(core, runtime, `[${account.accountId}] inbound message`);
        statusSink?.({ lastInboundAt: Date.now() });
        const queueKey = resolveInboundQueueKey(msg);
        void inboundQueue.enqueue(queueKey, async () => {
          if (stopped || abortSignal.aborted) {
            return;
          }
          await processMessage(
            msg,
            account,
            config,
            core,
            runtime,
            { historyLimit, groupHistories },
            statusSink
          );
        }).catch((err) => {
          runtime.error(`[${account.accountId}] Failed to process message: ${String(err)}`);
        });
      },
      onError: (err) => {
        if (stopped || abortSignal.aborted) {
          return;
        }
        runtime.error(`[${account.accountId}] Zalo listener error: ${String(err)}`);
        settleFailure(err);
      }
    });
  } catch (error) {
    abortSignal.removeEventListener("abort", onAbort);
    throw error;
  }
  listenerStop = listener.stop;
  if (stopped) {
    listenerStop();
    listenerStop = null;
  }
  if (abortSignal.aborted) {
    settleSuccess();
  }
  try {
    await waitForExit;
  } finally {
    abortSignal.removeEventListener("abort", onAbort);
  }
  return { stop };
}
var import_compat3, import_zalouser6, ZALOUSER_TEXT_LIMIT, __testing;
var init_monitor = __esm({
  "src/core/extensions/zalouser/src/monitor.ts"() {
    "use strict";
    import_compat3 = require("src/core/source/plugin-sdk/compat");
    import_zalouser6 = require("src/core/source/plugin-sdk/zalouser");
    init_group_policy();
    init_message_sid();
    init_runtime();
    init_send();
    init_zalo_js();
    ZALOUSER_TEXT_LIMIT = 2e3;
    __testing = {
      processMessage: async (params) => {
        const historyLimit = Math.max(
          0,
          params.historyState?.historyLimit ?? params.account.config.historyLimit ?? params.config.messages?.groupChat?.historyLimit ?? import_compat3.DEFAULT_GROUP_HISTORY_LIMIT
        );
        const groupHistories = params.historyState?.groupHistories ?? /* @__PURE__ */ new Map();
        await processMessage(
          params.message,
          params.account,
          params.config,
          getZalouserRuntime(),
          params.runtime,
          { historyLimit, groupHistories },
          params.statusSink
        );
      }
    };
  }
});

// src/core/extensions/zalouser/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_zalouser8 = require("src/core/source/plugin-sdk/zalouser");

// src/core/extensions/zalouser/src/channel.ts
var import_compat4 = require("src/core/source/plugin-sdk/compat");
var import_zalouser7 = require("src/core/source/plugin-sdk/zalouser");

// src/core/extensions/zalouser/src/accounts.ts
var import_account_id = require("src/core/source/plugin-sdk/account-id");
var import_zalouser2 = require("src/core/source/plugin-sdk/zalouser");
init_zalo_js();
var {
  listAccountIds: listZalouserAccountIds,
  resolveDefaultAccountId: resolveDefaultZalouserAccountId
} = (0, import_zalouser2.createAccountListHelpers)("zalouser");
function resolveAccountConfig(cfg, accountId) {
  const accounts = cfg.channels?.zalouser?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return void 0;
  }
  return accounts[accountId];
}
function mergeZalouserAccountConfig(cfg, accountId) {
  const raw = cfg.channels?.zalouser ?? {};
  const { accounts: _ignored, defaultAccount: _ignored2, ...base } = raw;
  const account = resolveAccountConfig(cfg, accountId) ?? {};
  return { ...base, ...account };
}
function resolveProfile(config, accountId) {
  if (config.profile?.trim()) {
    return config.profile.trim();
  }
  if (process.env.ZALOUSER_PROFILE?.trim()) {
    return process.env.ZALOUSER_PROFILE.trim();
  }
  if (process.env.ZCA_PROFILE?.trim()) {
    return process.env.ZCA_PROFILE.trim();
  }
  if (accountId !== import_account_id.DEFAULT_ACCOUNT_ID) {
    return accountId;
  }
  return "default";
}
function resolveZalouserAccountSync(params) {
  const accountId = (0, import_account_id.normalizeAccountId)(params.accountId);
  const baseEnabled = params.cfg.channels?.zalouser?.enabled !== false;
  const merged = mergeZalouserAccountConfig(params.cfg, accountId);
  const accountEnabled = merged.enabled !== false;
  const enabled = baseEnabled && accountEnabled;
  const profile = resolveProfile(merged, accountId);
  return {
    accountId,
    name: merged.name?.trim() || void 0,
    enabled,
    profile,
    authenticated: false,
    config: merged
  };
}
async function getZcaUserInfo(profile) {
  const info = await getZaloUserInfo(profile);
  if (!info) {
    return null;
  }
  return {
    userId: info.userId,
    displayName: info.displayName
  };
}

// src/core/extensions/zalouser/src/config-schema.ts
var import_compat2 = require("src/core/source/plugin-sdk/compat");
var import_zalouser3 = require("src/core/source/plugin-sdk/zalouser");
var import_zod = require("zod");
var groupConfigSchema = import_zod.z.object({
  allow: import_zod.z.boolean().optional(),
  enabled: import_zod.z.boolean().optional(),
  requireMention: import_zod.z.boolean().optional(),
  tools: import_zalouser3.ToolPolicySchema
});
var zalouserAccountSchema = import_zod.z.object({
  name: import_zod.z.string().optional(),
  enabled: import_zod.z.boolean().optional(),
  markdown: import_zalouser3.MarkdownConfigSchema,
  profile: import_zod.z.string().optional(),
  dangerouslyAllowNameMatching: import_zod.z.boolean().optional(),
  dmPolicy: import_compat2.DmPolicySchema.optional(),
  allowFrom: import_compat2.AllowFromListSchema,
  historyLimit: import_zod.z.number().int().min(0).optional(),
  groupAllowFrom: import_compat2.AllowFromListSchema,
  groupPolicy: import_compat2.GroupPolicySchema.optional(),
  groups: import_zod.z.object({}).catchall(groupConfigSchema).optional(),
  messagePrefix: import_zod.z.string().optional(),
  responsePrefix: import_zod.z.string().optional()
});
var ZalouserConfigSchema = (0, import_compat2.buildCatchallMultiAccountChannelSchema)(zalouserAccountSchema);

// src/core/extensions/zalouser/src/channel.ts
init_group_policy();
init_message_sid();

// src/core/extensions/zalouser/src/onboarding.ts
var import_zalouser5 = require("src/core/source/plugin-sdk/zalouser");

// src/core/extensions/zalouser/src/qr-temp-file.ts
var import_promises2 = __toESM(require("node:fs/promises"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);
var import_zalouser4 = require("src/core/source/plugin-sdk/zalouser");
async function writeQrDataUrlToTempFile(qrDataUrl, profile) {
  const trimmed = qrDataUrl.trim();
  const match = trimmed.match(/^data:image\/png;base64,(.+)$/i);
  const base64 = (match?.[1] ?? "").trim();
  if (!base64) {
    return null;
  }
  const safeProfile = profile.replace(/[^a-zA-Z0-9_-]+/g, "-") || "default";
  const filePath = import_node_path2.default.join(
    (0, import_zalouser4.resolvePreferredMustBTmpDir)(),
    `must-b-zalouser-qr-${safeProfile}.png`
  );
  await import_promises2.default.writeFile(filePath, Buffer.from(base64, "base64"));
  return filePath;
}

// src/core/extensions/zalouser/src/onboarding.ts
init_zalo_js();
var channel = "zalouser";
function setZalouserAccountScopedConfig(cfg, accountId, defaultPatch, accountPatch = defaultPatch) {
  return (0, import_zalouser5.patchScopedAccountConfig)({
    cfg,
    channelKey: channel,
    accountId,
    patch: defaultPatch,
    accountPatch
  });
}
function setZalouserDmPolicy(cfg, dmPolicy2) {
  return (0, import_zalouser5.setTopLevelChannelDmPolicyWithAllowFrom)({
    cfg,
    channel: "zalouser",
    dmPolicy: dmPolicy2
  });
}
async function noteZalouserHelp(prompter) {
  await prompter.note(
    [
      "Zalo Personal Account login via QR code.",
      "",
      "This plugin uses zca-js directly (no external CLI dependency).",
      "",
      "Docs: https://docs.must-b.ai/channels/zalouser"
    ].join("\n"),
    "Zalo Personal Setup"
  );
}
async function promptZalouserAllowFrom(params) {
  const { cfg, prompter, accountId } = params;
  const resolved = resolveZalouserAccountSync({ cfg, accountId });
  const existingAllowFrom = resolved.config.allowFrom ?? [];
  const parseInput = (raw) => raw.split(/[\n,;]+/g).map((entry) => entry.trim()).filter(Boolean);
  while (true) {
    const entry = await prompter.text({
      message: "Zalouser allowFrom (name or user id)",
      placeholder: "Alice, 123456789",
      initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : void 0,
      validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
    });
    const parts = parseInput(String(entry));
    const resolvedEntries = await resolveZaloAllowFromEntries({
      profile: resolved.profile,
      entries: parts
    });
    const unresolved = resolvedEntries.filter((item) => !item.resolved).map((item) => item.input);
    if (unresolved.length > 0) {
      await prompter.note(
        `Could not resolve: ${unresolved.join(", ")}. Use numeric user ids or exact friend names.`,
        "Zalo Personal allowlist"
      );
      continue;
    }
    const resolvedIds = resolvedEntries.filter((item) => item.resolved && item.id).map((item) => item.id);
    const unique = (0, import_zalouser5.mergeAllowFromEntries)(existingAllowFrom, resolvedIds);
    const notes = resolvedEntries.filter((item) => item.note).map((item) => `${item.input} -> ${item.id} (${item.note})`);
    if (notes.length > 0) {
      await prompter.note(notes.join("\n"), "Zalo Personal allowlist");
    }
    return setZalouserAccountScopedConfig(cfg, accountId, {
      dmPolicy: "allowlist",
      allowFrom: unique
    });
  }
}
function setZalouserGroupPolicy(cfg, accountId, groupPolicy) {
  return setZalouserAccountScopedConfig(cfg, accountId, {
    groupPolicy
  });
}
function setZalouserGroupAllowlist(cfg, accountId, groupKeys) {
  const groups = Object.fromEntries(groupKeys.map((key) => [key, { allow: true }]));
  return setZalouserAccountScopedConfig(cfg, accountId, {
    groups
  });
}
var dmPolicy = {
  label: "Zalo Personal",
  channel,
  policyKey: "channels.zalouser.dmPolicy",
  allowFromKey: "channels.zalouser.allowFrom",
  getCurrent: (cfg) => cfg.channels?.zalouser?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setZalouserDmPolicy(cfg, policy),
  promptAllowFrom: async ({ cfg, prompter, accountId }) => {
    const id = accountId && (0, import_zalouser5.normalizeAccountId)(accountId) ? (0, import_zalouser5.normalizeAccountId)(accountId) ?? import_zalouser5.DEFAULT_ACCOUNT_ID : resolveDefaultZalouserAccountId(cfg);
    return promptZalouserAllowFrom({
      cfg,
      prompter,
      accountId: id
    });
  }
};
var zalouserOnboardingAdapter = {
  channel,
  dmPolicy,
  getStatus: async ({ cfg }) => {
    const ids = listZalouserAccountIds(cfg);
    let configured = false;
    for (const accountId of ids) {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const isAuth = await checkZaloAuthenticated(account.profile);
      if (isAuth) {
        configured = true;
        break;
      }
    }
    return {
      channel,
      configured,
      statusLines: [`Zalo Personal: ${configured ? "logged in" : "needs QR login"}`],
      selectionHint: configured ? "recommended \xB7 logged in" : "recommended \xB7 QR login",
      quickstartScore: configured ? 1 : 15
    };
  },
  configure: async ({
    cfg,
    prompter,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom
  }) => {
    const defaultAccountId = resolveDefaultZalouserAccountId(cfg);
    const accountId = await (0, import_zalouser5.resolveAccountIdForConfigure)({
      cfg,
      prompter,
      label: "Zalo Personal",
      accountOverride: accountOverrides.zalouser,
      shouldPromptAccountIds,
      listAccountIds: listZalouserAccountIds,
      defaultAccountId
    });
    let next = cfg;
    const account = resolveZalouserAccountSync({ cfg: next, accountId });
    const alreadyAuthenticated = await checkZaloAuthenticated(account.profile);
    if (!alreadyAuthenticated) {
      await noteZalouserHelp(prompter);
      const wantsLogin = await prompter.confirm({
        message: "Login via QR code now?",
        initialValue: true
      });
      if (wantsLogin) {
        const start = await startZaloQrLogin({ profile: account.profile, timeoutMs: 35e3 });
        if (start.qrDataUrl) {
          const qrPath = await writeQrDataUrlToTempFile(start.qrDataUrl, account.profile);
          await prompter.note(
            [
              start.message,
              qrPath ? `QR image saved to: ${qrPath}` : "Could not write QR image file; use gateway web login UI instead.",
              "Scan + approve on phone, then continue."
            ].join("\n"),
            "QR Login"
          );
          const scanned = await prompter.confirm({
            message: "Did you scan and approve the QR on your phone?",
            initialValue: true
          });
          if (scanned) {
            const waited = await waitForZaloQrLogin({
              profile: account.profile,
              timeoutMs: 12e4
            });
            await prompter.note(waited.message, waited.connected ? "Success" : "Login pending");
          }
        } else {
          await prompter.note(start.message, "Login pending");
        }
      }
    } else {
      const keepSession = await prompter.confirm({
        message: "Zalo Personal already logged in. Keep session?",
        initialValue: true
      });
      if (!keepSession) {
        await logoutZaloProfile(account.profile);
        const start = await startZaloQrLogin({
          profile: account.profile,
          force: true,
          timeoutMs: 35e3
        });
        if (start.qrDataUrl) {
          const qrPath = await writeQrDataUrlToTempFile(start.qrDataUrl, account.profile);
          await prompter.note(
            [start.message, qrPath ? `QR image saved to: ${qrPath}` : void 0].filter(Boolean).join("\n"),
            "QR Login"
          );
          const waited = await waitForZaloQrLogin({ profile: account.profile, timeoutMs: 12e4 });
          await prompter.note(waited.message, waited.connected ? "Success" : "Login pending");
        }
      }
    }
    next = setZalouserAccountScopedConfig(
      next,
      accountId,
      { profile: account.profile !== "default" ? account.profile : void 0 },
      { profile: account.profile, enabled: true }
    );
    if (forceAllowFrom) {
      next = await promptZalouserAllowFrom({
        cfg: next,
        prompter,
        accountId
      });
    }
    const updatedAccount = resolveZalouserAccountSync({ cfg: next, accountId });
    const accessConfig = await (0, import_zalouser5.promptChannelAccessConfig)({
      prompter,
      label: "Zalo groups",
      currentPolicy: updatedAccount.config.groupPolicy ?? "allowlist",
      currentEntries: Object.keys(updatedAccount.config.groups ?? {}),
      placeholder: "Family, Work, 123456789",
      updatePrompt: Boolean(updatedAccount.config.groups)
    });
    if (accessConfig) {
      if (accessConfig.policy !== "allowlist") {
        next = setZalouserGroupPolicy(next, accountId, accessConfig.policy);
      } else {
        let keys = accessConfig.entries;
        if (accessConfig.entries.length > 0) {
          try {
            const resolved = await resolveZaloGroupsByEntries({
              profile: updatedAccount.profile,
              entries: accessConfig.entries
            });
            const resolvedIds = resolved.filter((entry) => entry.resolved && entry.id).map((entry) => entry.id);
            const unresolved = resolved.filter((entry) => !entry.resolved).map((entry) => entry.input);
            keys = [...resolvedIds, ...unresolved.map((entry) => entry.trim()).filter(Boolean)];
            const resolution = (0, import_zalouser5.formatResolvedUnresolvedNote)({
              resolved: resolvedIds,
              unresolved
            });
            if (resolution) {
              await prompter.note(resolution, "Zalo groups");
            }
          } catch (err) {
            await prompter.note(
              `Group lookup failed; keeping entries as typed. ${String(err)}`,
              "Zalo groups"
            );
          }
        }
        next = setZalouserGroupPolicy(next, accountId, "allowlist");
        next = setZalouserGroupAllowlist(next, accountId, keys);
      }
    }
    return { cfg: next, accountId };
  }
};

// src/core/extensions/zalouser/src/probe.ts
init_zalo_js();
async function probeZalouser(profile, timeoutMs) {
  try {
    const user = timeoutMs ? await Promise.race([
      getZaloUserInfo(profile),
      new Promise(
        (resolve) => setTimeout(() => resolve(null), Math.max(timeoutMs, 1e3))
      )
    ]) : await getZaloUserInfo(profile);
    if (!user) {
      return { ok: false, error: "Not authenticated" };
    }
    return { ok: true, user };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// src/core/extensions/zalouser/src/channel.ts
init_runtime();
init_send();

// src/core/extensions/zalouser/src/status-issues.ts
var isRecord = (value) => Boolean(value && typeof value === "object");
var asString = (value) => typeof value === "string" ? value : typeof value === "number" ? String(value) : void 0;
function readZalouserAccountStatus(value) {
  if (!isRecord(value)) {
    return null;
  }
  return {
    accountId: value.accountId,
    enabled: value.enabled,
    configured: value.configured,
    dmPolicy: value.dmPolicy,
    lastError: value.lastError
  };
}
function collectZalouserStatusIssues(accounts) {
  const issues = [];
  for (const entry of accounts) {
    const account = readZalouserAccountStatus(entry);
    if (!account) {
      continue;
    }
    const accountId = asString(account.accountId) ?? "default";
    const enabled = account.enabled !== false;
    if (!enabled) {
      continue;
    }
    const configured = account.configured === true;
    if (!configured) {
      issues.push({
        channel: "zalouser",
        accountId,
        kind: "auth",
        message: "Not authenticated (no saved Zalo session).",
        fix: "Run: must-b channels login --channel zalouser"
      });
      continue;
    }
    if (account.dmPolicy === "open") {
      issues.push({
        channel: "zalouser",
        accountId,
        kind: "config",
        message: 'Zalo Personal dmPolicy is "open", allowing any user to message the bot without pairing.',
        fix: 'Set channels.zalouser.dmPolicy to "pairing" or "allowlist" to restrict access.'
      });
    }
  }
  return issues;
}

// src/core/extensions/zalouser/src/channel.ts
init_zalo_js();
var meta = {
  id: "zalouser",
  label: "Zalo Personal",
  selectionLabel: "Zalo (Personal Account)",
  docsPath: "/channels/zalouser",
  docsLabel: "zalouser",
  blurb: "Zalo personal account via QR code login.",
  aliases: ["zlu"],
  order: 85,
  quickstartAllowFrom: true
};
function stripZalouserTargetPrefix(raw) {
  return raw.trim().replace(/^(zalouser|zlu):/i, "").trim();
}
function normalizePrefixedTarget(raw) {
  const trimmed = stripZalouserTargetPrefix(raw);
  if (!trimmed) {
    return void 0;
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("group:")) {
    const id = trimmed.slice("group:".length).trim();
    return id ? `group:${id}` : void 0;
  }
  if (lower.startsWith("g:")) {
    const id = trimmed.slice("g:".length).trim();
    return id ? `group:${id}` : void 0;
  }
  if (lower.startsWith("user:")) {
    const id = trimmed.slice("user:".length).trim();
    return id ? `user:${id}` : void 0;
  }
  if (lower.startsWith("dm:")) {
    const id = trimmed.slice("dm:".length).trim();
    return id ? `user:${id}` : void 0;
  }
  if (lower.startsWith("u:")) {
    const id = trimmed.slice("u:".length).trim();
    return id ? `user:${id}` : void 0;
  }
  if (/^g-\S+$/i.test(trimmed)) {
    return `group:${trimmed}`;
  }
  if (/^u-\S+$/i.test(trimmed)) {
    return `user:${trimmed}`;
  }
  return trimmed;
}
function parseZalouserOutboundTarget(raw) {
  const normalized = normalizePrefixedTarget(raw);
  if (!normalized) {
    throw new Error("Zalouser target is required");
  }
  const lowered = normalized.toLowerCase();
  if (lowered.startsWith("group:")) {
    const threadId = normalized.slice("group:".length).trim();
    if (!threadId) {
      throw new Error("Zalouser group target is missing group id");
    }
    return { threadId, isGroup: true };
  }
  if (lowered.startsWith("user:")) {
    const threadId = normalized.slice("user:".length).trim();
    if (!threadId) {
      throw new Error("Zalouser user target is missing user id");
    }
    return { threadId, isGroup: false };
  }
  return { threadId: normalized, isGroup: false };
}
function parseZalouserDirectoryGroupId(raw) {
  const normalized = normalizePrefixedTarget(raw);
  if (!normalized) {
    throw new Error("Zalouser group target is required");
  }
  const lowered = normalized.toLowerCase();
  if (lowered.startsWith("group:")) {
    const groupId = normalized.slice("group:".length).trim();
    if (!groupId) {
      throw new Error("Zalouser group target is missing group id");
    }
    return groupId;
  }
  if (lowered.startsWith("user:")) {
    throw new Error("Zalouser group members lookup requires a group target (group:<id>)");
  }
  return normalized;
}
function resolveZalouserQrProfile(accountId) {
  const normalized = (0, import_zalouser7.normalizeAccountId)(accountId);
  if (!normalized || normalized === import_zalouser7.DEFAULT_ACCOUNT_ID) {
    return process.env.ZALOUSER_PROFILE?.trim() || process.env.ZCA_PROFILE?.trim() || "default";
  }
  return normalized;
}
function resolveZalouserOutboundChunkMode(cfg, accountId) {
  return getZalouserRuntime().channel.text.resolveChunkMode(cfg, "zalouser", accountId);
}
function resolveZalouserOutboundTextChunkLimit(cfg, accountId) {
  return getZalouserRuntime().channel.text.resolveTextChunkLimit(cfg, "zalouser", accountId, {
    fallbackLimit: zalouserDock.outbound?.textChunkLimit ?? 2e3
  });
}
function mapUser(params) {
  return {
    kind: "user",
    id: params.id,
    name: params.name ?? void 0,
    avatarUrl: params.avatarUrl ?? void 0,
    raw: params.raw
  };
}
function mapGroup2(params) {
  return {
    kind: "group",
    id: params.id,
    name: params.name ?? void 0,
    raw: params.raw
  };
}
function resolveZalouserGroupPolicyEntry(params) {
  const account = resolveZalouserAccountSync({
    cfg: params.cfg,
    accountId: params.accountId ?? void 0
  });
  const groups = account.config.groups ?? {};
  return findZalouserGroupEntry(
    groups,
    buildZalouserGroupCandidates({
      groupId: params.groupId,
      groupChannel: params.groupChannel,
      includeWildcard: true,
      allowNameMatching: (0, import_zalouser7.isDangerousNameMatchingEnabled)(account.config)
    })
  );
}
function resolveZalouserGroupToolPolicy(params) {
  return resolveZalouserGroupPolicyEntry(params)?.tools;
}
function resolveZalouserRequireMention(params) {
  const entry = resolveZalouserGroupPolicyEntry(params);
  if (typeof entry?.requireMention === "boolean") {
    return entry.requireMention;
  }
  return true;
}
var zalouserMessageActions = {
  listActions: ({ cfg }) => {
    const accounts = listZalouserAccountIds(cfg).map((accountId) => resolveZalouserAccountSync({ cfg, accountId })).filter((account) => account.enabled);
    if (accounts.length === 0) {
      return [];
    }
    return ["react"];
  },
  supportsAction: ({ action }) => action === "react",
  handleAction: async ({ action, params, cfg, accountId, toolContext }) => {
    if (action !== "react") {
      throw new Error(`Zalouser action ${action} not supported`);
    }
    const account = resolveZalouserAccountSync({ cfg, accountId });
    const threadId = (typeof params.threadId === "string" ? params.threadId.trim() : "") || (typeof params.to === "string" ? params.to.trim() : "") || (typeof params.chatId === "string" ? params.chatId.trim() : "") || (toolContext?.currentChannelId?.trim() ?? "");
    if (!threadId) {
      throw new Error("Zalouser react requires threadId (or to/chatId).");
    }
    const emoji = typeof params.emoji === "string" ? params.emoji.trim() : "";
    if (!emoji) {
      throw new Error("Zalouser react requires emoji.");
    }
    const ids = resolveZalouserReactionMessageIds({
      messageId: typeof params.messageId === "string" ? params.messageId : void 0,
      cliMsgId: typeof params.cliMsgId === "string" ? params.cliMsgId : void 0,
      currentMessageId: toolContext?.currentMessageId
    });
    if (!ids) {
      throw new Error(
        "Zalouser react requires messageId + cliMsgId (or a current message context id)."
      );
    }
    const result = await sendReactionZalouser({
      profile: account.profile,
      threadId,
      isGroup: params.isGroup === true,
      msgId: ids.msgId,
      cliMsgId: ids.cliMsgId,
      emoji,
      remove: params.remove === true
    });
    if (!result.ok) {
      throw new Error(result.error || "Failed to react on Zalo message");
    }
    return {
      content: [
        {
          type: "text",
          text: params.remove === true ? `Removed reaction ${emoji} from ${ids.msgId}` : `Reacted ${emoji} on ${ids.msgId}`
        }
      ],
      details: {
        messageId: ids.msgId,
        cliMsgId: ids.cliMsgId,
        threadId
      }
    };
  }
};
var zalouserDock = {
  id: "zalouser",
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
    blockStreaming: true
  },
  outbound: { textChunkLimit: 2e3 },
  config: {
    resolveAllowFrom: ({ cfg, accountId }) => (0, import_compat4.mapAllowFromEntries)(resolveZalouserAccountSync({ cfg, accountId }).config.allowFrom),
    formatAllowFrom: ({ allowFrom }) => (0, import_zalouser7.formatAllowFromLowercase)({ allowFrom, stripPrefixRe: /^(zalouser|zlu):/i })
  },
  groups: {
    resolveRequireMention: resolveZalouserRequireMention,
    resolveToolPolicy: resolveZalouserGroupToolPolicy
  },
  threading: {
    resolveReplyToMode: () => "off"
  }
};
var zalouserPlugin = {
  id: "zalouser",
  meta,
  onboarding: zalouserOnboardingAdapter,
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
    reactions: true,
    threads: false,
    polls: false,
    nativeCommands: false,
    blockStreaming: true
  },
  reload: { configPrefixes: ["channels.zalouser"] },
  configSchema: (0, import_zalouser7.buildChannelConfigSchema)(ZalouserConfigSchema),
  config: {
    listAccountIds: (cfg) => listZalouserAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveZalouserAccountSync({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultZalouserAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => (0, import_zalouser7.setAccountEnabledInConfigSection)({
      cfg,
      sectionKey: "zalouser",
      accountId,
      enabled,
      allowTopLevel: true
    }),
    deleteAccount: ({ cfg, accountId }) => (0, import_zalouser7.deleteAccountFromConfigSection)({
      cfg,
      sectionKey: "zalouser",
      accountId,
      clearBaseFields: [
        "profile",
        "name",
        "dmPolicy",
        "allowFrom",
        "historyLimit",
        "groupAllowFrom",
        "groupPolicy",
        "groups",
        "messagePrefix"
      ]
    }),
    isConfigured: async (account) => await checkZaloAuthenticated(account.profile),
    describeAccount: (account) => ({
      accountId: account.accountId,
      name: account.name,
      enabled: account.enabled,
      configured: void 0
    }),
    resolveAllowFrom: ({ cfg, accountId }) => (0, import_compat4.mapAllowFromEntries)(resolveZalouserAccountSync({ cfg, accountId }).config.allowFrom),
    formatAllowFrom: ({ allowFrom }) => (0, import_zalouser7.formatAllowFromLowercase)({ allowFrom, stripPrefixRe: /^(zalouser|zlu):/i })
  },
  security: {
    resolveDmPolicy: ({ cfg, accountId, account }) => {
      return (0, import_compat4.buildAccountScopedDmSecurityPolicy)({
        cfg,
        channelKey: "zalouser",
        accountId,
        fallbackAccountId: account.accountId ?? import_zalouser7.DEFAULT_ACCOUNT_ID,
        policy: account.config.dmPolicy,
        allowFrom: account.config.allowFrom ?? [],
        policyPathSuffix: "dmPolicy",
        normalizeEntry: (raw) => raw.replace(/^(zalouser|zlu):/i, "")
      });
    }
  },
  groups: {
    resolveRequireMention: resolveZalouserRequireMention,
    resolveToolPolicy: resolveZalouserGroupToolPolicy
  },
  threading: {
    resolveReplyToMode: () => "off"
  },
  actions: zalouserMessageActions,
  setup: {
    resolveAccountId: ({ accountId }) => (0, import_zalouser7.normalizeAccountId)(accountId),
    applyAccountName: ({ cfg, accountId, name }) => (0, import_zalouser7.applyAccountNameToChannelSection)({
      cfg,
      channelKey: "zalouser",
      accountId,
      name
    }),
    validateInput: () => null,
    applyAccountConfig: ({ cfg, accountId, input }) => {
      const namedConfig = (0, import_zalouser7.applyAccountNameToChannelSection)({
        cfg,
        channelKey: "zalouser",
        accountId,
        name: input.name
      });
      const next = accountId !== import_zalouser7.DEFAULT_ACCOUNT_ID ? (0, import_zalouser7.migrateBaseNameToDefaultAccount)({
        cfg: namedConfig,
        channelKey: "zalouser"
      }) : namedConfig;
      return (0, import_zalouser7.applySetupAccountConfigPatch)({
        cfg: next,
        channelKey: "zalouser",
        accountId,
        patch: {}
      });
    }
  },
  messaging: {
    normalizeTarget: (raw) => normalizePrefixedTarget(raw),
    targetResolver: {
      looksLikeId: (raw) => {
        const normalized = normalizePrefixedTarget(raw);
        if (!normalized) {
          return false;
        }
        if (/^group:[^\s]+$/i.test(normalized) || /^user:[^\s]+$/i.test(normalized)) {
          return true;
        }
        return (0, import_zalouser7.isNumericTargetId)(normalized);
      },
      hint: "<user:id|group:id>"
    }
  },
  directory: {
    self: async ({ cfg, accountId }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const parsed = await getZaloUserInfo(account.profile);
      if (!parsed?.userId) {
        return null;
      }
      return mapUser({
        id: String(parsed.userId),
        name: parsed.displayName ?? null,
        avatarUrl: parsed.avatar ?? null,
        raw: parsed
      });
    },
    listPeers: async ({ cfg, accountId, query, limit }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const friends = await listZaloFriendsMatching(account.profile, query);
      const rows = friends.map(
        (friend) => mapUser({
          id: String(friend.userId),
          name: friend.displayName ?? null,
          avatarUrl: friend.avatar ?? null,
          raw: friend
        })
      );
      return typeof limit === "number" && limit > 0 ? rows.slice(0, limit) : rows;
    },
    listGroups: async ({ cfg, accountId, query, limit }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const groups = await listZaloGroupsMatching(account.profile, query);
      const rows = groups.map(
        (group) => mapGroup2({
          id: `group:${String(group.groupId)}`,
          name: group.name ?? null,
          raw: group
        })
      );
      return typeof limit === "number" && limit > 0 ? rows.slice(0, limit) : rows;
    },
    listGroupMembers: async ({ cfg, accountId, groupId, limit }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const normalizedGroupId = parseZalouserDirectoryGroupId(groupId);
      const members = await listZaloGroupMembers(account.profile, normalizedGroupId);
      const rows = members.map(
        (member) => mapUser({
          id: member.userId,
          name: member.displayName,
          avatarUrl: member.avatar ?? null,
          raw: member
        })
      );
      return typeof limit === "number" && limit > 0 ? rows.slice(0, limit) : rows;
    }
  },
  resolver: {
    resolveTargets: async ({ cfg, accountId, inputs, kind, runtime }) => {
      const results = [];
      for (const input of inputs) {
        const trimmed = input.trim();
        if (!trimmed) {
          results.push({ input, resolved: false, note: "empty input" });
          continue;
        }
        if (/^\d+$/.test(trimmed)) {
          results.push({ input, resolved: true, id: trimmed });
          continue;
        }
        try {
          const account = resolveZalouserAccountSync({
            cfg,
            accountId: accountId ?? import_zalouser7.DEFAULT_ACCOUNT_ID
          });
          if (kind === "user") {
            const friends = await listZaloFriendsMatching(account.profile, trimmed);
            const best = friends[0];
            results.push({
              input,
              resolved: Boolean(best?.userId),
              id: best?.userId,
              name: best?.displayName,
              note: friends.length > 1 ? "multiple matches; chose first" : void 0
            });
          } else {
            const groups = await listZaloGroupsMatching(account.profile, trimmed);
            const best = groups.find((group) => group.name.toLowerCase() === trimmed.toLowerCase()) ?? groups[0];
            results.push({
              input,
              resolved: Boolean(best?.groupId),
              id: best?.groupId,
              name: best?.name,
              note: groups.length > 1 ? "multiple matches; chose first" : void 0
            });
          }
        } catch (err) {
          runtime.error?.(`zalouser resolve failed: ${String(err)}`);
          results.push({ input, resolved: false, note: "lookup failed" });
        }
      }
      return results;
    }
  },
  pairing: {
    idLabel: "zalouserUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^(zalouser|zlu):/i, ""),
    notifyApproval: async ({ cfg, id }) => {
      const account = resolveZalouserAccountSync({ cfg });
      const authenticated = await checkZaloAuthenticated(account.profile);
      if (!authenticated) {
        throw new Error("Zalouser not authenticated");
      }
      await sendMessageZalouser(id, "Your pairing request has been approved.", {
        profile: account.profile
      });
    }
  },
  auth: {
    login: async ({ cfg, accountId, runtime }) => {
      const account = resolveZalouserAccountSync({
        cfg,
        accountId: accountId ?? import_zalouser7.DEFAULT_ACCOUNT_ID
      });
      runtime.log(
        `Generating QR login for Zalo Personal (account: ${account.accountId}, profile: ${account.profile})...`
      );
      const started = await startZaloQrLogin({
        profile: account.profile,
        timeoutMs: 35e3
      });
      if (!started.qrDataUrl) {
        throw new Error(started.message || "Failed to start QR login");
      }
      const qrPath = await writeQrDataUrlToTempFile(started.qrDataUrl, account.profile);
      if (qrPath) {
        runtime.log(`Scan QR image: ${qrPath}`);
      } else {
        runtime.log("QR generated but could not be written to a temp file.");
      }
      const waited = await waitForZaloQrLogin({ profile: account.profile, timeoutMs: 18e4 });
      if (!waited.connected) {
        throw new Error(waited.message || "Zalouser login failed");
      }
      runtime.log(waited.message);
    }
  },
  outbound: {
    deliveryMode: "direct",
    chunker: (text, limit) => getZalouserRuntime().channel.text.chunkMarkdownText(text, limit),
    chunkerMode: "markdown",
    sendPayload: async (ctx) => await (0, import_zalouser7.sendPayloadWithChunkedTextAndMedia)({
      ctx,
      sendText: (nextCtx) => zalouserPlugin.outbound.sendText(nextCtx),
      sendMedia: (nextCtx) => zalouserPlugin.outbound.sendMedia(nextCtx),
      emptyResult: { channel: "zalouser", messageId: "" }
    }),
    sendText: async ({ to, text, accountId, cfg }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const target = parseZalouserOutboundTarget(to);
      const result = await sendMessageZalouser(target.threadId, text, {
        profile: account.profile,
        isGroup: target.isGroup,
        textMode: "markdown",
        textChunkMode: resolveZalouserOutboundChunkMode(cfg, account.accountId),
        textChunkLimit: resolveZalouserOutboundTextChunkLimit(cfg, account.accountId)
      });
      return (0, import_zalouser7.buildChannelSendResult)("zalouser", result);
    },
    sendMedia: async ({ to, text, mediaUrl, accountId, cfg, mediaLocalRoots }) => {
      const account = resolveZalouserAccountSync({ cfg, accountId });
      const target = parseZalouserOutboundTarget(to);
      const result = await sendMessageZalouser(target.threadId, text, {
        profile: account.profile,
        isGroup: target.isGroup,
        mediaUrl,
        mediaLocalRoots,
        textMode: "markdown",
        textChunkMode: resolveZalouserOutboundChunkMode(cfg, account.accountId),
        textChunkLimit: resolveZalouserOutboundTextChunkLimit(cfg, account.accountId)
      });
      return (0, import_zalouser7.buildChannelSendResult)("zalouser", result);
    }
  },
  status: {
    defaultRuntime: {
      accountId: import_zalouser7.DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null
    },
    collectStatusIssues: collectZalouserStatusIssues,
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null
    }),
    probeAccount: async ({ account, timeoutMs }) => probeZalouser(account.profile, timeoutMs),
    buildAccountSnapshot: async ({ account, runtime }) => {
      const configured = await checkZaloAuthenticated(account.profile);
      const configError = "not authenticated";
      const base = (0, import_zalouser7.buildBaseAccountStatusSnapshot)({
        account: {
          accountId: account.accountId,
          name: account.name,
          enabled: account.enabled,
          configured
        },
        runtime: configured ? runtime : { ...runtime, lastError: runtime?.lastError ?? configError }
      });
      return {
        ...base,
        dmPolicy: account.config.dmPolicy ?? "pairing"
      };
    }
  },
  gateway: {
    startAccount: async (ctx) => {
      const account = ctx.account;
      let userLabel = "";
      try {
        const userInfo = await getZcaUserInfo(account.profile);
        if (userInfo?.displayName) {
          userLabel = ` (${userInfo.displayName})`;
        }
        ctx.setStatus({
          accountId: account.accountId,
          profile: userInfo
        });
      } catch {
      }
      const statusSink = (0, import_compat4.createAccountStatusSink)({
        accountId: ctx.accountId,
        setStatus: ctx.setStatus
      });
      ctx.log?.info(`[${account.accountId}] starting zalouser provider${userLabel}`);
      const { monitorZalouserProvider: monitorZalouserProvider2 } = await Promise.resolve().then(() => (init_monitor(), monitor_exports));
      return monitorZalouserProvider2({
        account,
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        statusSink
      });
    },
    loginWithQrStart: async (params) => {
      const profile = resolveZalouserQrProfile(params.accountId);
      return await startZaloQrLogin({
        profile,
        force: params.force,
        timeoutMs: params.timeoutMs
      });
    },
    loginWithQrWait: async (params) => {
      const profile = resolveZalouserQrProfile(params.accountId);
      return await waitForZaloQrLogin({
        profile,
        timeoutMs: params.timeoutMs
      });
    },
    logoutAccount: async (ctx) => await logoutZaloProfile(ctx.account.profile || resolveZalouserQrProfile(ctx.accountId))
  }
};

// src/core/extensions/zalouser/index.ts
init_runtime();

// src/core/extensions/zalouser/src/tool.ts
var import_typebox = require("@sinclair/typebox");
init_send();
init_zalo_js();
var ACTIONS = ["send", "image", "link", "friends", "groups", "me", "status"];
function stringEnum(values, options = {}) {
  return import_typebox.Type.Unsafe({
    type: "string",
    enum: [...values],
    ...options
  });
}
var ZalouserToolSchema = import_typebox.Type.Object(
  {
    action: stringEnum(ACTIONS, { description: `Action to perform: ${ACTIONS.join(", ")}` }),
    threadId: import_typebox.Type.Optional(import_typebox.Type.String({ description: "Thread ID for messaging" })),
    message: import_typebox.Type.Optional(import_typebox.Type.String({ description: "Message text" })),
    isGroup: import_typebox.Type.Optional(import_typebox.Type.Boolean({ description: "Is group chat" })),
    profile: import_typebox.Type.Optional(import_typebox.Type.String({ description: "Profile name" })),
    query: import_typebox.Type.Optional(import_typebox.Type.String({ description: "Search query" })),
    url: import_typebox.Type.Optional(import_typebox.Type.String({ description: "URL for media/link" }))
  },
  { additionalProperties: false }
);
function json(payload) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    details: payload
  };
}
async function executeZalouserTool(_toolCallId, params, _signal, _onUpdate) {
  try {
    switch (params.action) {
      case "send": {
        if (!params.threadId || !params.message) {
          throw new Error("threadId and message required for send action");
        }
        const result = await sendMessageZalouser(params.threadId, params.message, {
          profile: params.profile,
          isGroup: params.isGroup
        });
        if (!result.ok) {
          throw new Error(result.error || "Failed to send message");
        }
        return json({ success: true, messageId: result.messageId });
      }
      case "image": {
        if (!params.threadId) {
          throw new Error("threadId required for image action");
        }
        if (!params.url) {
          throw new Error("url required for image action");
        }
        const result = await sendImageZalouser(params.threadId, params.url, {
          profile: params.profile,
          caption: params.message,
          isGroup: params.isGroup
        });
        if (!result.ok) {
          throw new Error(result.error || "Failed to send image");
        }
        return json({ success: true, messageId: result.messageId });
      }
      case "link": {
        if (!params.threadId || !params.url) {
          throw new Error("threadId and url required for link action");
        }
        const result = await sendLinkZalouser(params.threadId, params.url, {
          profile: params.profile,
          caption: params.message,
          isGroup: params.isGroup
        });
        if (!result.ok) {
          throw new Error(result.error || "Failed to send link");
        }
        return json({ success: true, messageId: result.messageId });
      }
      case "friends": {
        const rows = await listZaloFriendsMatching(params.profile, params.query);
        return json(rows);
      }
      case "groups": {
        const rows = await listZaloGroupsMatching(params.profile, params.query);
        return json(rows);
      }
      case "me": {
        const info = await getZaloUserInfo(params.profile);
        return json(info ?? { error: "Not authenticated" });
      }
      case "status": {
        const authenticated = await checkZaloAuthenticated(params.profile);
        return json({
          authenticated,
          output: authenticated ? "authenticated" : "not authenticated"
        });
      }
      default: {
        params.action;
        throw new Error(
          `Unknown action: ${String(params.action)}. Valid actions: send, image, link, friends, groups, me, status`
        );
      }
    }
  } catch (err) {
    return json({
      error: err instanceof Error ? err.message : String(err)
    });
  }
}

// src/core/extensions/zalouser/index.ts
var plugin = {
  id: "zalouser",
  name: "Zalo Personal",
  description: "Zalo personal account messaging via native zca-js integration",
  configSchema: (0, import_zalouser8.emptyPluginConfigSchema)(),
  register(api) {
    setZalouserRuntime(api.runtime);
    api.registerChannel({ plugin: zalouserPlugin, dock: zalouserDock });
    api.registerTool({
      name: "zalouser",
      label: "Zalo Personal",
      description: "Send messages and access data via Zalo personal account. Actions: send (text message), image (send image URL), link (send link), friends (list/search friends), groups (list groups), me (profile info), status (auth check).",
      parameters: ZalouserToolSchema,
      execute: executeZalouserTool
    });
  }
};
var index_default = plugin;
