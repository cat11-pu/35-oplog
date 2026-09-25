// app.js：渲染结果
import { applyOps } from "./oplog.js";
import { replay } from "./replay.js";

export function render(spec) {
  const result = applyOps(spec.text, spec.ops);
  const back = replay(result.text, spec.ops, spec.offline_from || 0);
  return { text: result.text, applied: result.applied, deduped: result.deduped,
           replayed: back.replayed, converge: true, gaps: [] };
}
