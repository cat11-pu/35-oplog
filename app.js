// app.js：渲染结果（返回结构固定为 text/applied/deduped/replayed/converge/gaps 六键）
import { applyOps } from "./oplog.js";
import { replay } from "./replay.js";

export function render(spec) {
  const from = spec.offline_from || 0;

  let result;
  try {
    result = applyOps(spec.text, spec.ops);
  } catch (error) {
    if (error && error.code === "E_OP_GAP") {
      return {
        text: error.text,
        applied: error.applied,
        deduped: error.deduped,
        replayed: [],
        converge: false,
        gaps: error.gaps,
      };
    }
    throw error;
  }

  // 断点快照：从头应用所有 seq < offline_from 的已应用操作
  const before = applyOps(spec.text, (spec.ops || []).filter((op) => op.seq < from));
  let back;
  try {
    back = replay(before.text, spec.ops, from);
  } catch (error) {
    if (error && error.code === "E_OP_GAP") {
      return {
        text: result.text,
        applied: result.applied,
        deduped: result.deduped,
        replayed: error.replayed,
        converge: false,
        gaps: error.gaps,
      };
    }
    throw error;
  }

  return {
    text: result.text,
    applied: result.applied,
    deduped: result.deduped,
    replayed: back.replayed,
    converge: back.text === result.text,
    gaps: [],
  };
}
