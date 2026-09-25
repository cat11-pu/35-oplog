// oplog.js：按序号升序应用，同号去重；序号从首条起必须连续，
// 缺号计入 gaps 并报 E_OP_GAP，缺号之后的操作不再应用
export const OP_GAP_CODE = "E_OP_GAP";

function applyOne(out, op) {
  const position = Math.min(Math.max(op.pos, 0), out.length);
  if (op.kind === "insert") return out.slice(0, position) + op.text + out.slice(position);
  return out.slice(0, position) + out.slice(position + 1);
}

export function applyOps(text, ops) {
  const ordered = ops.slice().sort((a, b) => a.seq - b.seq);
  let out = text;
  const applied = [];
  const deduped = [];
  const gaps = [];
  let expected = ordered.length > 0 ? ordered[0].seq : 0;
  let error = null;
  for (const op of ordered) {
    if (op.seq < expected) {
      deduped.push(op.id);
      continue;
    }
    if (op.seq > expected) {
      for (let missing = expected; missing < op.seq; missing += 1) gaps.push(missing);
      error = OP_GAP_CODE;
      break;
    }
    out = applyOne(out, op);
    applied.push(op.id);
    expected += 1;
  }
  return { text: out, applied: applied, deduped: deduped, gaps: gaps, error: error };
}

export { applyOne };
