import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod/v4";
import { OneOrMore } from "../index.js";

const StringSchema = z.string();
const OneOrMoreString = OneOrMore(StringSchema);

describe("OneOrMore", () => {
  it("should return array for single value input", () => {
    const result = OneOrMoreString.parse("foo");
    assert.deepEqual(result, ["foo"]);
  });
  it("should return array for array input", () => {
    const result = OneOrMoreString.parse(["foo", "bar"]);
    assert.deepEqual(result, ["foo", "bar"]);
  });
  it("should throw for invalid input", () => {
    assert.throws(() => OneOrMoreString.parse(123));
  });
  it("should throw for invalid array", () => {
    assert.throws(() => OneOrMoreString.parse(["foo", 123]));
  });
  it("should accept single or array input types and output array", () => {
    type Input = z.input<typeof OneOrMoreString>;
    type Output = z.output<typeof OneOrMoreString>;
    const input1: Input = "foo";
    const input2: Input = ["foo", "bar"];
    const output1: Output = ["foo"];
    const output2: Output = ["foo", "bar"];
    assert.deepEqual(OneOrMoreString.parse(input1), output1);
    assert.deepEqual(OneOrMoreString.parse(input2), output2);
  });
});
