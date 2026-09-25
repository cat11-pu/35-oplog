// replay.js：断线重放（基线：不记断点、全部重放）
export function replay(text, ops, offlineFrom) {
  return { text: text, replayed: [], applied: [] };
}
