// replay.js：断线重放
// text 为断点处（已应用完 seq < offlineFrom）的文本快照；
// 只重放 seq 不小于 offlineFrom 的已应用操作（按序、去重后）。
import { orderOps } from "./oplog.js";

function applyOne(out, op) {
  const position = Math.min(Math.max(op.pos, 0), out.length);
  if (op.kind === "insert") {
    return out.slice(0, position) + op.text + out.slice(position);
  }
  return out.slice(0, position) + out.slice(position + 1);
}

export function replay(text, ops, offlineFrom) {
  const from = offlineFrom || 0;
  const { ordered } = orderOps(ops);
  let out = text;
  const replayed = [];
  const applied = [];
  let expected = null;
  for (let i = 0; i < ordered.length; i++) {
    const op = ordered[i];
    if (op.seq < from) continue;
    if (expected !== null && op.seq > expected) {
      const gaps = [];
      for (let seq = expected; seq < op.seq; seq++) gaps.push(seq);
      const error = new Error("op sequence gap: missing " + gaps.join(","));
      error.code = "E_OP_GAP";
      error.gaps = gaps;
      error.text = out;
      error.replayed = replayed;
      error.applied = applied;
      throw error;
    }
    out = applyOne(out, op);
    replayed.push(op.id);
    applied.push(op.id);
    expected = op.seq + 1;
  }
  return { text: out, replayed: replayed, applied: applied };
}
