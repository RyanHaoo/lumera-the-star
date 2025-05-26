import { z } from "zod/v4";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  AbstractModel,
  ModelSet,
  IdExistsError,
  IdNotFoundError,
} from "../baseModel.js";

const TestSchema = z.strictObject({
  id: z.number(),
  name: z.string(),
});
type TestData = z.infer<typeof TestSchema>;

class TestModel extends AbstractModel {
  static readonly dataSchema = TestSchema;
  declare data: TestData;

  constructor({ id, data }: { id: string; data: TestData }) {
    super({ id, data });
  }

  getBrief() {
    return { id: "1", title: this.data.name, text: null, detail: null };
  }
}

class TestModelSet extends ModelSet<TestModel> {
  static readonly model = TestModel;
}

null; // Test cases will not be auto-found without this line

describe("Test Model", () => {
  it("Test deserialize pass", () => {
    const data = { id: 1, name: "test" };
    const model = TestModel.deserialize(data);
    assert.equal(model.id, "1");
    assert.deepStrictEqual(model.data, data);
  });
  it("Test deserialize for invalid data", () => {
    const data = { id: "invalid", name: "test", sus: "ඞ" };
    assert.throws(
      () => TestModel.deserialize(data),
      (err) => {
        assert(err instanceof z.ZodError);
        assert.deepStrictEqual(err.issues, [
          {
            expected: "number",
            code: "invalid_type",
            path: ["id"],
            message: "Invalid input: expected number, received string",
          },
          {
            code: "unrecognized_keys",
            keys: ["sus"],
            message: 'Unrecognized key: "sus"',
            path: [],
          },
        ]);
        return true;
      },
    );
  });
});

describe("Test ModelSet", () => {
  const data1 = { id: 0, name: "test1" };
  const data2 = { id: 1, name: "test2" };
  const model1 = new TestModel({ id: "1", data: data1 });
  const model2 = new TestModel({ id: "2", data: data2 });

  it("Test get", () => {
    const modelSet = new TestModelSet();
    modelSet.add(model1);
    modelSet.add(model2);
    assert.strictEqual(modelSet.get("1").data, data1);
    assert.strictEqual(modelSet.get("2").data, data2);
  });
  it("Test filter", () => {
    const modelSet = new TestModelSet();
    modelSet.add(model1);
    modelSet.add(model2);
    const filtered = modelSet.filter((entry) => entry.data.name === "test1");
    assert.strictEqual(filtered[0], model1);
    assert.strictEqual(filtered.length, 1);
  });
  it("Test add duplicate", () => {
    const modelSet = new TestModelSet();
    modelSet.add(model1);
    assert.throws(
      () => modelSet.add(model1),
      (err) => {
        assert(err instanceof IdExistsError);
        assert.equal(
          err.message,
          'TestModelSet: Fail to add entry with existed id "1".',
        );
        return true;
      },
    );
  });
  it("Test get non-existing id", () => {
    const modelSet = new TestModelSet();
    assert.throws(
      () => modelSet.get("void"),
      (err) => {
        assert(err instanceof IdNotFoundError);
        assert.equal(
          err.message,
          'TestModelSet: Entry with id "void" not found.',
        );
        return true;
      },
    );
  });
});
