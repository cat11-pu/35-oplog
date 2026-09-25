// app.js：渲染结果
import { applyOps } from "./oplog.js";
import { replay } from "./replay.js";

export function render(spec) {
  const result = applyOps(spec.text, spec.ops);
  const offlineFrom = spec.offline_from || 0;
  const base = applyOps(spec.text, spec.ops.filter((op) => op.seq < offlineFrom));
  const back = replay(base.text, spec.ops, offlineFrom);
  return { text: result.text, applied: result.applied, deduped: result.deduped,
           replayed: back.replayed, converge: back.text === result.text, gaps: result.gaps };
}
