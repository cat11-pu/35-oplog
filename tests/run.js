import assert from "node:assert";
import { applyOps } from "../oplog.js";
import { replay } from "../replay.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const ops = [{ id: "o1", seq: 1, kind: "insert", pos: 0, text: "a" }];

check("applyOps returns text", () => {
  assert.strictEqual(typeof applyOps("", ops).text, "string");
});

check("applyOps lists applied ids", () => {
  assert.deepStrictEqual(applyOps("", ops).applied, ["o1"]);
});

check("applyOps reports deduped", () => {
  assert.ok(Array.isArray(applyOps("", ops).deduped));
});

check("replay returns replayed list", () => {
  assert.ok(Array.isArray(replay("", ops, 0).replayed));
});

check("render exposes converge flag", () => {
  assert.strictEqual(typeof render({ text: "", ops: ops, offline_from: 0 }).converge, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
