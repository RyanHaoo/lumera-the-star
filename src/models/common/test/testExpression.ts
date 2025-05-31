import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { DotExpression, Arithmetic, Predicate } from "../expression";

const DotExpressionSchema = DotExpression.asSchema();
const ArithmeticSchema = Arithmetic.asSchema();
const PredicateSchema = Predicate.asSchema();

describe("parsing DotExpression", () => {
  it("parsing single", () => {
    const result = DotExpressionSchema.safeParse("foo");
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof DotExpression);
    assert.deepStrictEqual(parsed.data, { context: "foo", dotChain: [] });
  });
  it("parsing chain", () => {
    const result = DotExpressionSchema.safeParse("foo.bar.foo");
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof DotExpression);
    assert.deepStrictEqual(parsed.data, {
      context: "foo",
      dotChain: ["bar", "foo"],
    });
  });
  it("parsing invalid", () => {
    const result = DotExpressionSchema.safeParse("foo.b@r");
    assert(!result.success);
    assert.strictEqual(result.error.issues.length, 1);
    assert.partialDeepStrictEqual(result.error.issues[0], {
      code: "invalid_format",
      message: 'Identifier "b@r" contains invalid characters: @',
    });
    assert.deepStrictEqual(result.error.issues[0].path, [1]);
  });
});

describe("parsing Arithmetic", () => {
  it("parse valid arithmetic", () => {
    const result = ArithmeticSchema.safeParse("a.a+b-c");
    assert(result.success);
    const parsed = result.data;
    assert.deepStrictEqual(parsed.data, [
      ["+", DotExpressionSchema.parse("a.a")],
      ["+", DotExpressionSchema.parse("b")],
      ["-", DotExpressionSchema.parse("c")],
    ]);
  });
  it("parses arithmetic starts with operator", () => {
    const result = ArithmeticSchema.safeParse("-a+b");
    assert(result.success);
    const parsed = result.data;
    assert.deepStrictEqual(parsed.data, [
      ["-", DotExpressionSchema.parse("a")],
      ["+", DotExpressionSchema.parse("b")],
    ]);
  });
  it("throws on invalid identifier", () => {
    const result = ArithmeticSchema.safeParse("a+ b-c@");
    assert(!result.success);
    assert.equal(result.error.issues.length, 2);
    const [issue1, issue2] = result.error.issues;
    assert.strictEqual(issue1.code, "invalid_format");
    assert.deepStrictEqual(issue1.path, [1, 0]);
    assert.strictEqual(issue2.code, "invalid_format");
    assert.deepStrictEqual(issue2.path, [2, 0]);
  });
  it("throws on no operator", () => {
    const result = ArithmeticSchema.safeParse("ab.c");
    assert(!result.success);
    assert.equal(result.error.issues.length, 1);
    assert.partialDeepStrictEqual(result.error.issues[0], {
      code: "invalid_format",
      message:
        'Invalid Arthmetic expression "ab.c" contains no known operators: +, -',
    });
    assert.deepStrictEqual(result.error.issues[0].path, []);
  });
});

describe("parsing Predicate", () => {
  it("parses simple DotExpression with default compare", () => {
    const result = PredicateSchema.safeParse(["foo.bar", 5]);
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof Predicate);
    assert.deepStrictEqual(parsed.data, {
      source: DotExpressionSchema.parse("foo.bar"),
      target: 5,
      compare: "==",
    });
  });

  it("parses DotExpression with explicit compare >", () => {
    const result = PredicateSchema.safeParse(["foo.bar>", 10]);
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof Predicate);
    assert.deepStrictEqual(parsed.data, {
      source: DotExpressionSchema.parse("foo.bar"),
      target: 10,
      compare: ">",
    });
  });

  it("parses DotExpression with explicit compare <=", () => {
    const result = PredicateSchema.safeParse(["foo.bar<=", 2]);
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof Predicate);
    assert.deepStrictEqual(parsed.data, {
      source: DotExpressionSchema.parse("foo.bar"),
      target: 2,
      compare: "<=",
    });
  });

  it("parses DotExpression with negation (!)", () => {
    const result = PredicateSchema.safeParse(["!foo.bar", 0]);
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof Predicate);
    assert.deepStrictEqual(parsed.data, {
      source: DotExpressionSchema.parse("foo.bar"),
      target: 0,
      compare: "!=",
    });
  });

  it("parses Arithmetic with f: prefix", () => {
    const result = PredicateSchema.safeParse(["f:a+b-c", 7]);
    assert(result.success);
    const parsed = result.data;
    assert(parsed instanceof Predicate);
    assert.deepStrictEqual(parsed.data, {
      source: ArithmeticSchema.parse("a+b-c"),
      target: 7,
      compare: "==",
    });
  });

  it("fails on invalid identifier in DotExpression", () => {
    const result = PredicateSchema.safeParse(["foo.b@r", 1]);
    assert(!result.success);
    assert.strictEqual(result.error.issues.length, 1);
    const issue = result.error.issues[0];
    assert.strictEqual(issue.code, "invalid_format");
    assert.deepStrictEqual(issue.path, [1]);
  });

  it("fails on using ! with explict compare", () => {
    const result = PredicateSchema.safeParse(["!foo.bar>", 1]);
    assert(!result.success);
    assert.strictEqual(result.error.issues.length, 1);
    const issue = result.error.issues[0];
    assert.strictEqual(issue.code, "custom");
    assert.match(issue.message, /Cannot use "!" in conjunction/);
  });

  it("fails on invalid arithmetic in f: expression", () => {
    const result = PredicateSchema.safeParse(["f:a+ b-c@", 3]);
    assert(!result.success);
    assert.equal(result.error.issues.length, 2);
    const [issue1, issue2] = result.error.issues;
    assert.strictEqual(issue1.code, "invalid_format");
    assert.deepStrictEqual(issue1.path, ["f:", 1, 0]);
    assert.strictEqual(issue2.code, "invalid_format");
    assert.deepStrictEqual(issue2.path, ["f:", 2, 0]);
  });

  it("fails with explicit equality comparing", () => {
    const result = PredicateSchema.safeParse(["foo.bar==", 42]);
    assert(!result.success);
    assert.strictEqual(result.error.issues.length, 1);
    const issue = result.error.issues[0];
    assert.strictEqual(issue.code, "invalid_value");
    assert.strictEqual(issue.message, "Cannot explictly set this comparing");
  });
});
