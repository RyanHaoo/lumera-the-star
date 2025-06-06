import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { JSONParseError, stringify, parseObject } from "../json.js";
import {
  parse,
  RawJSONParseError,
  unpatchDistinctKeyRecur,
} from "../private/jsonHelpers.js";
import { CommentObject, parse as cParse, CommentArray } from "comment-json";

function toCArray<T>(array: Array<T>): CommentArray<T> {
  return new CommentArray(...array);
}

describe("Test basic function of patched `comment-json.parse`", () => {
  it("Should throw on duplicate keys if not patching", () => {
    assert.throws(
      () => cParse('{"a": 1, "a": 2}'),
      (err: RawJSONParseError) => {
        assert(err instanceof SyntaxError);
        assert.match(err.message, /Duplicate/);
        assert.equal(err.line, 1);
        assert.equal(err.column, 9);
        return true;
      },
    );
  });
  it("Same key on different levels should not be considered duplicate", () => {
    assert.deepStrictEqual(cParse('{"a": {"a": 0}}'), { a: { a: 0 } });
  });
  it("Should handle comments properly", () => {
    const raw = `{
  // before:a
  "a": 0, // after:a
  "b": null
}`;
    assert.equal(stringify(cParse(raw), null, 2), raw);
    assert.equal(
      stringify(cParse(raw, null, true), null, 0),
      '{"a":0,"b":null}',
    );
  });
});

describe("Test recursively unpatch distinct keys", () => {
  it("Should not unpatch duplicate keys", () => {
    const data = {
      a_$$0: 0,
      a_$$1: "a",
      a_$$2: { a_$$0: true, a_$$1: null },
    } as unknown as CommentObject;
    assert.deepStrictEqual(unpatchDistinctKeyRecur(data), data);
  });
  it("Should recursively patch objects", () => {
    assert.deepStrictEqual(
      unpatchDistinctKeyRecur({
        a_$$0: 0,
        a_$$1: {
          a_$$0: {
            a_$$0: "1",
            a_$$1: true,
          },
          b_$$0: {
            b_$$0: 1,
          },
        },
      } as unknown as CommentObject),
      {
        a_$$0: 0,
        a_$$1: {
          a: {
            a_$$0: "1",
            a_$$1: true,
          },
          b: {
            b: 1,
          },
        },
      },
    );
  });
  it("Should recursively patch arrays", () => {
    assert.deepStrictEqual(
      unpatchDistinctKeyRecur({
        a_$$0: 0,
        a_$$1: toCArray([
          {
            a_$$0: "1",
            a_$$1: true,
          },
          {
            b_$$0: toCArray([0, toCArray([{ c_$$0: 1, b_$$0: 2, c_$$1: 3 }])]),
          },
        ]),
      } as unknown as CommentObject),
      {
        a_$$0: 0,
        a_$$1: toCArray([
          {
            a_$$0: "1",
            a_$$1: true,
          },
          {
            b: toCArray([0, toCArray([{ c_$$0: 1, b: 2, c_$$1: 3 }])]),
          },
        ]),
      },
    );
  });
});

describe("Test wrapped parse", () => {
  it("Should throw on duplicate keys if not patching", () => {
    assert.throws(
      () => parse('{"a": 1, "a": 2}'),
      (err) => {
        assert(err instanceof JSONParseError);
        assert.match(err.message, /Duplicate/);
        assert.equal(err.position.line, 1);
        assert.equal(err.position.column, 9);
        return true;
      },
    );
  });
  it("Should patch duplicate keys", () => {
    const raw = '{"a": 0, "a": {"b": "1", "b": true, "a": null}, "b": []}';
    const expect =
      '{"a_$$0":0,"a_$$1":{"b_$$0":"1","b_$$1":true,"a":null},"b":[]}';
    assert.equal(
      stringify(parse(raw, { patchDuplicateKey: true }), null, 0),
      expect,
    );
  });
  it("Should patch normally with array", () => {
    const raw =
      '{"a": [{"a": 0, "a": null}, [{"a": 1, "a": "a"}], "a", {"b": [{"b": true, "b": []}]}]}';
    const expect =
      '{"a":[{"a_$$0":0,"a_$$1":null},[{"a_$$0":1,"a_$$1":"a"}],"a",{"b":[{"b_$$0":true,"b_$$1":[]}]}]}';
    assert.equal(
      stringify(parse(raw, { patchDuplicateKey: true }), null, 0),
      expect,
    );
  });
  it("Should handle comments properly when patching", () => {
    const raw = `// before-all
{ // before:a
  // before:a
  "a": 1, // after:a
  // a3
  "a": 2, // a4
  "b": { // before
    // before
  }, // after:b
  "b": [
    // before:0
    null, // after:0
    {
      "c": [], // after:c
      "c": 1,
      "d": 5
      // after:d
    },
    {
      // before
    }
  ]
  // after:b
}
// after-all`;
    const expect = `// before-all
{ // before:a
  // before:a
  "a_$$0": 1, // after:a
  // a3
  "a_$$1": 2, // a4
  "b_$$0": { // before
    // before
  }, // after:b
  "b_$$1": [
    // before:0
    null, // after:0
    {
      "c_$$0": [], // after:c
      "c_$$1": 1,
      "d": 5
      // after:d
    },
    {
      // before
    }
  ]
  // after:b
}
// after-all`;
    assert.equal(
      stringify(parse(raw, { patchDuplicateKey: true }), null, 2),
      expect,
    );
  });
});

describe("Test objecte parser", () => {
  it("Should throw on non-object", () => {
    const bads = ["1", '"a"', "true", "null", '[{"a": 1}]'];
    for (const bad of bads) {
      assert.throws(
        () => parseObject(bad),
        /TypeError: JSON: expect an object/,
      );
    }
  });
  it("Should work on object", () => {
    assert.deepStrictEqual(parseObject('{"a": 0}'), { a: 0 });
  });
});
