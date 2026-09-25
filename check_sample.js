import fs from "node:fs";
import { applyOps } from "./oplog.js";
import { replay } from "./replay.js";
import { render } from "./app.js";

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/oplog.json", "utf8"));
const result = applyOps(spec.text, spec.ops);
const back = replay(result.text, spec.ops, spec.offline_from || 0);
const out = render(spec);
const uniqueSeqs = [...new Set(spec.ops.map((op) => op.seq))].sort((a, b) => a - b);
const holeSeq = uniqueSeqs[Math.floor(uniqueSeqs.length / 2)];
const gapProbe = applyOps(spec.text, spec.ops.filter((op) => op.seq !== holeSeq));

console.log("文本 =", result.text);
console.log("应用的序号 =", JSON.stringify(result.applied));
console.log("重复跳过的序号 =", JSON.stringify(result.deduped));
console.log("重放的序号 =", JSON.stringify(back.replayed));
console.log("是否收敛到同一结果 =", out.converge);
console.log("缺号的序号 =", JSON.stringify(out.gaps));
console.log("序号空洞的错误码 =", gapProbe.error);
