import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Condition } from "../condition.js";
import { Predicate } from "../expression.js";

const ConditionSchema = Condition.asSchema();
const PredicateSchema = Predicate.asSchema();

describe("Condition.asSchema", () => {
  it("parses simple predicate condition", () => {
    const input = { foo: 1, bar_$$0: 3 };
    const result = ConditionSchema.safeParse(input);
    assert(result.success);
    const condition = result.data;

    assert(condition instanceof Condition);
    assert.deepStrictEqual(condition.data, {
      predicates: [
        PredicateSchema.parse(["foo", 1]),
        PredicateSchema.parse(["bar", 3]),
      ],
    });
  });

  it("parses condition with all clause", () => {
    const input = {
      all: { foo: 1, bar: 2 },
      baz: 3,
    };
    const result = ConditionSchema.safeParse(input);
    assert(result.success);
    const condition = result.data;

    assert(condition instanceof Condition);
    assert(condition.data.allClause instanceof Condition);
    assert.deepStrictEqual(condition.data, {
      allClause: ConditionSchema.parse({ foo: 1, bar: 2 }),
      predicates: [PredicateSchema.parse(["baz", 3])],
    });
  });

  it("parses condition with type", () => {
    const input = {
      type: "sudan",
      "foo.bar": 1,
    };
    const result = ConditionSchema.safeParse(input);
    assert(result.success);
    const condition = result.data;
    assert.deepStrictEqual(condition.data, {
      type: "sudan",
      predicates: [PredicateSchema.parse(["foo.bar", 1])],
    });
  });

  it("fails on invalid predicate", () => {
    const input = {
      any: {
        all: {
          "f:bar+foo.su$>=_$$10": 2,
        },
      },
    };
    const result = ConditionSchema.safeParse(input);
    assert(!result.success);
    assert.strictEqual(result.error.issues.length, 1);
    const issue = result.error.issues[0];

    assert.strictEqual(issue.code, "invalid_format");
    assert.deepStrictEqual(issue.path, [
      "any",
      "all",
      "f:bar+foo.su$>=_$$10",
      "f:",
      1,
      1,
    ]);
  });
});
