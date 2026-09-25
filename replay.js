// replay.js：断线重放，只重放序号不小于断点的已应用操作（按序、去重后）
import { applyOne } from "./oplog.js";

export function replay(text, ops, offlineFrom) {
  const ordered = ops.slice().sort((a, b) => a.seq - b.seq);
  let out = text;
  const replayed = [];
  const applied = [];
  const seen = new Set();
  let expected = offlineFrom;
  for (const op of ordered) {
    if (seen.has(op.seq)) continue;
    seen.add(op.seq);
    applied.push(op.id);
    if (op.seq < offlineFrom) continue;
    if (op.seq > expected) break;
    out = applyOne(out, op);
    replayed.push(op.id);
    expected += 1;
  }
  return { text: out, replayed: replayed, applied: applied };
}
