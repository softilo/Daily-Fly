import fs from 'fs/promises';
import path from 'path';

export interface StaffNotificationReadState {
  readIds: Record<string, string>;
  webReadBefore?: string;
  allReadBefore?: string;
  updatedAt: string;
}

type NotificationsStoreDocument = Record<string, StaffNotificationReadState>;

const STORE_PATH = process.env.VERCEL
  ? path.join('/tmp', 'dailyfly-notification-reads.json')
  : path.join(process.cwd(), '.next', 'notification-reads.json');

const MAX_READ_IDS_PER_USER = 500;

let writeQueue: Promise<void> = Promise.resolve();

function createEmptyUserState(): StaffNotificationReadState {
  return {
    readIds: {},
    updatedAt: new Date(0).toISOString(),
  };
}

function trimReadIds(readIds: Record<string, string>): Record<string, string> {
  const entries = Object.entries(readIds);
  if (entries.length <= MAX_READ_IDS_PER_USER) {
    return readIds;
  }
  entries.sort((a, b) => b[1].localeCompare(a[1]));
  return Object.fromEntries(entries.slice(0, MAX_READ_IDS_PER_USER));
}

async function readStore(): Promise<NotificationsStoreDocument> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as NotificationsStoreDocument;
    }
    return {};
  } catch {
    return {};
  }
}

async function writeStore(doc: NotificationsStoreDocument): Promise<void> {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(doc), 'utf-8');
  } catch {
    // Ignore filesystem errors in read-only runtimes
  }
}

async function mutateUserState(
  userId: string,
  updater: (current: StaffNotificationReadState) => StaffNotificationReadState,
): Promise<StaffNotificationReadState> {
  let resultState = createEmptyUserState();

  const nextTask = writeQueue.then(async () => {
    const doc = await readStore();
    const current = doc[userId] ?? createEmptyUserState();
    const updated = updater({
      readIds: { ...(current.readIds ?? {}) },
      webReadBefore: current.webReadBefore,
      allReadBefore: current.allReadBefore,
      updatedAt: current.updatedAt,
    });
    updated.readIds = trimReadIds(updated.readIds);
    updated.updatedAt = new Date().toISOString();
    doc[userId] = updated;
    resultState = updated;
    await writeStore(doc);
  });

  writeQueue = nextTask.catch(() => {});
  await nextTask;
  return resultState;
}

export async function getNotificationReadState(
  userId: string,
): Promise<StaffNotificationReadState> {
  if (!userId) return createEmptyUserState();
  const doc = await readStore();
  return doc[userId] ?? createEmptyUserState();
}

export async function markNotificationIdsRead(
  userId: string,
  ids: string[],
): Promise<StaffNotificationReadState> {
  const cleanIds = ids.map((id) => id.trim()).filter(Boolean);
  if (!userId || cleanIds.length === 0) {
    return getNotificationReadState(userId);
  }
  const nowIso = new Date().toISOString();
  return mutateUserState(userId, (state) => {
    for (const id of cleanIds) {
      state.readIds[id] = nowIso;
    }
    return state;
  });
}

export async function markWebInquiriesRead(
  userId: string,
  ids: string[],
  cutoffIso?: string,
): Promise<StaffNotificationReadState> {
  if (!userId) return createEmptyUserState();
  const nowIso = cutoffIso || new Date().toISOString();
  return mutateUserState(userId, (state) => {
    for (const id of ids) {
      if (id.trim()) state.readIds[id.trim()] = nowIso;
    }
    if (!state.webReadBefore || nowIso > state.webReadBefore) {
      state.webReadBefore = nowIso;
    }
    return state;
  });
}

export async function markAllNotificationsRead(
  userId: string,
  ids: string[],
  cutoffIso?: string,
): Promise<StaffNotificationReadState> {
  if (!userId) return createEmptyUserState();
  const nowIso = cutoffIso || new Date().toISOString();
  return mutateUserState(userId, (state) => {
    for (const id of ids) {
      if (id.trim()) state.readIds[id.trim()] = nowIso;
    }
    if (!state.webReadBefore || nowIso > state.webReadBefore) {
      state.webReadBefore = nowIso;
    }
    if (!state.allReadBefore || nowIso > state.allReadBefore) {
      state.allReadBefore = nowIso;
    }
    return state;
  });
}

export function isNotificationMarkedRead(
  state: StaffNotificationReadState,
  item: {
    id: string;
    category: string;
    createdAt: string;
  },
): boolean {
  if (state.readIds[item.id]) {
    return true;
  }

  const itemTime = Date.parse(item.createdAt);
  if (Number.isNaN(itemTime)) {
    return false;
  }

  if (item.category === 'WEB_INQUIRY' && state.webReadBefore) {
    const cutoff = Date.parse(state.webReadBefore);
    if (!Number.isNaN(cutoff) && itemTime <= cutoff) {
      return true;
    }
  }

  if (state.allReadBefore) {
    const cutoff = Date.parse(state.allReadBefore);
    if (!Number.isNaN(cutoff) && itemTime <= cutoff) {
      return true;
    }
  }

  return false;
}
