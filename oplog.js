// oplog.js：按序应用（基线：来一条用一条、不排号）
export function applyOps(text, ops) {
  let out = text;
  const applied = [];
  for (const op of ops) {
    const position = Math.min(Math.max(op.pos, 0), out.length);
    if (op.kind === "insert") out = out.slice(0, position) + op.text + out.slice(position);
    else out = out.slice(0, position) + out.slice(position + 1);
    applied.push(op.id);
  }
  return { text: out, applied: applied, deduped: [] };
}
