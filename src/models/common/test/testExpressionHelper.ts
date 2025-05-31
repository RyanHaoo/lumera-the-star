import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { IdentifierSchema, Identifier } from "../private/expressionHelper";

describe("parsing Identifier", () => {
  it("parse valid", () => {
    for (const valid of ["a", "1", "a_1", "名称"]) {
      const result = IdentifierSchema.safeParse(valid);
      assert(result.success);
      const parsed: Identifier = result.data;
      assert.strictEqual(parsed, valid);
    }
  });
  it("throws on empty data", () => {
    const result = IdentifierSchema.safeParse("");
    assert(!result.success);
  });
  it("throws on invalid", () => {
    for (const valid of [" a", "et-", "dfa\t"]) {
      const result = IdentifierSchema.safeParse(valid);
      assert(!result.success);
      assert.strictEqual(result.error.issues.length, 1);
      const issue = result.error.issues[0];
      assert.strictEqual(issue.code, "invalid_format");
      assert.match(issue.message, /invalid character/);
    }
  });
});
