import { describe, it } from "node:test";
import assert from "node:assert";

import { AbstractModel, ModelSet } from "../baseModel.js";

type TestData = { name: string };
class TestModel extends AbstractModel<TestData> {
  constructor({ id, data }: { id: string; data: TestData }) {
    super({ id, data });
  }

  validate(obj: object) {
    return true;
  }

  getBrief() {
    return { id: "1", title: null, text: null, detail: null };
  }
}

class TestModelSet extends ModelSet<TestModel> {
  static readonly model = TestModel;
}

export const testModelSet = describe("ModelSet", () => {
  it("Construct & Get", () => {
    const data1 = { name: "test1" };
    const data2 = { name: "test2" };
    const modelSet = new TestModelSet([
      new TestModel({ id: "1", data: data1 }),
      new TestModel({ id: "2", data: data2 }),
    ]);
    assert.strictEqual(modelSet.get("1").data, data1);
    assert.strictEqual(modelSet.get("2").data, data2);
  });

  it("Add & Filter", () => {
    const model1 = new TestModel({ id: "1", data: { name: "test1" } });
    const model2 = new TestModel({ id: "2", data: { name: "test2" } });
    const modelSet = new TestModelSet();
    modelSet.add(model1);
    modelSet.add(model2);
    const filtered = modelSet.filter((entry) => entry.id === "1");
    assert.strictEqual(filtered[0], model1);
    assert.strictEqual(filtered.length, 1);
  });
});
