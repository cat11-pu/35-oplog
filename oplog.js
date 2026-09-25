// oplog.js：按 seq 升序、同序号去重、序号连续校验后应用操作
// 先做一次稳定排序，随后单趟线性推进，每个操作常量时间

// 按 seq 升序排序（稳定排序，同 seq 保留到达顺序），同 seq 的第一条保留，
// 其余条目的 id 计入 deduped。
export function orderOps(ops) {
  const sorted = ops.slice().sort((a, b) => a.seq - b.seq);
  const ordered = [];
  const groups = []; // 与 ordered 平行：该 seq 被去重掉的 id
  const deduped = [];
  for (const op of sorted) {
    if (ordered.length > 0 && ordered[ordered.length - 1].seq === op.seq) {
      groups[groups.length - 1].push(op.id);
      deduped.push(op.id);
    } else {
      ordered.push(op);
      groups.push([]);
    }
  }
  return { ordered: ordered, groups: groups, deduped: deduped };
}

function applyOne(out, op) {
  // 插入与删除位置按当前文本长度裁剪到 [0, out.length]
  const position = Math.min(Math.max(op.pos, 0), out.length);
  if (op.kind === "insert") {
    return out.slice(0, position) + op.text + out.slice(position);
  }
  return out.slice(0, position) + out.slice(position + 1);
}

export function applyOps(text, ops) {
  const { ordered, groups } = orderOps(ops);
  const applied = [];
  const deduped = [];
  let out = text;
  let expected = null; // 下一个应见到的 seq；以首个到达 seq 为起点
  for (let i = 0; i < ordered.length; i++) {
    const op = ordered[i];
    if (expected !== null && op.seq !== expected) {
      // 序号空洞：缺号计入 gaps，缺号之后的操作一律不得应用
      const gaps = [];
      for (let seq = expected; seq < op.seq; seq++) gaps.push(seq);
      const error = new Error("op sequence gap: missing " + gaps.join(","));
      error.code = "E_OP_GAP";
      error.gaps = gaps;
      error.text = out;
      error.applied = applied;
      error.deduped = deduped;
      throw error;
    }
    out = applyOne(out, op);
    applied.push(op.id);
    for (const id of groups[i]) deduped.push(id);
    expected = op.seq + 1;
  }
  return { text: out, applied: applied, deduped: deduped };
}
