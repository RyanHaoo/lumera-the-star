import { z } from "zod/v4";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  AbstractModel,
  ModelSet,
  KeyExistsError,
  KeyNotFoundError,
} from "../baseModel.js";

const TestSchema = z.strictObject({
  id: z.int().transform(String),
  name: z.string(),
});
type TestData = z.infer<typeof TestSchema>;

class TestModel extends AbstractModel {
  static readonly dataSchema = TestSchema;
  declare data: TestData;

  constructor({ key, data }: { key: string; data: TestData }) {
    super({ key, data });
  }

  getBrief() {
    return { key: "1", title: this.data.name, text: null, detail: null };
  }
}

class TestModelSet extends ModelSet<TestModel> {
  static readonly model = TestModel;
}

void 0; // Test cases will not be auto-found without this line

describe("Test Model", () => {
  it("Test deserialize pass", () => {
    const data = { id: 1, name: "test" };
    const model = TestModel.deserialize(data);
    assert.equal(model.key, "1");
    assert.deepStrictEqual(model.data, { id: "1", name: "test" });
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
  const data1 = { id: "0", name: "test1" };
  const data2 = { id: "1", name: "test2" };
  const model1 = new TestModel({ key: "1", data: data1 });
  const model2 = new TestModel({ key: "2", data: data2 });

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
        assert(err instanceof KeyExistsError);
        assert.equal(
          err.message,
          'TestModelSet: Fail to add entry with existed key "1".',
        );
        return true;
      },
    );
  });
  it("Test get non-existing key", () => {
    const modelSet = new TestModelSet();
    assert.throws(
      () => modelSet.get("void"),
      (err) => {
        assert(err instanceof KeyNotFoundError);
        assert.equal(
          err.message,
          'TestModelSet: Entry with key "void" not found.',
        );
        return true;
      },
    );
  });
});

/**
const EmbeddedSchema = z.array(z.int().positive());
type EmbeddedData = z.infer<typeof EmbeddedSchema>;

class EmbeddedModel extends AbstractEmbeddedModel {
  static readonly dataSchema = EmbeddedSchema;
  declare data: EmbeddedData;

  format(): string {
    return this.data.map(String).join(", ");
  }
}

const ContainerSchema = z.strictObject({
  id: z.int().positive(),
  value: EmbeddedModel.asSchema(),
});
type ContainerData = z.infer<typeof ContainerSchema>;

class ContainerModel extends AbstractModel {
  static readonly dataSchema = ContainerSchema;
  declare data: ContainerData;

  constructor({ id, data }: { id: string; data: ContainerData }) {
    super({ id, data });
  }

  getBrief() {
    return {
      id: this.id,
      title: this.data.value.format(),
      text: null,
      detail: null,
    };
  }
}

describe("Test AbstractEmbeddedModel", () => {
  it("Test validation pass", () => {
    const parsed = ContainerModel.deserialize({
      id: 1,
      value: [1, 2],
    });
    assert(parsed.data.value instanceof EmbeddedModel);
    assert.equal(parsed.data.value.format(), "1, 2");
  });
  it("Test validation fail", () => {
    const data = { id: 1, value: [1, null] };
    assert.throws(
      () => ContainerModel.deserialize(data),
      (err) => {
        assert(err instanceof z.ZodError);
        assert.deepEqual(err.issues, [
          {
            expected: "number",
            code: "invalid_type",
            path: ["value", 1],
            message: "Invalid input: expected number, received null",
          },
        ]);
        return true;
      },
    );
  });
});
*/
