import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Loot } from "../loot";
import { Condition } from "../common";

const raw1 = {
  id: 6000020,
  name: "普通妓院loot-无石美人",
  repeat: 1,
  type: 2,
  item: [
    {
      num: "1",
      id: "5002004",
      type: "rite",
      weight: 60,
    },
    {
      num: "1",
      id: "5002005",
      type: "rite",
      weight: 60,
    },
  ],
};
const expect1 = {
  id: "6000020",
  name: "普通妓院loot-无石美人",
  repeat: 1,
  type: 2,
  item: [
    {
      num: 1,
      id: "5002004",
      type: "rite",
      weight: 60,
    },
    {
      num: 1,
      id: "5002005",
      type: "rite",
      weight: 60,
    },
  ],
};

const raw2 = {
  id: 6000114,
  name: "正教的干扰",
  repeat: 1,
  type: 2,
  item: [
    {
      condition: {},
      num: "1",
      id: "5004510",
      type: "rite",
      weight: 60,
    },
    {
      condition: {
        "hand_have.主角": 1,
        all: {
          test: 2,
        },
      },
      num: "1",
      id: "5004511",
      type: "rite",
      weight: 20,
    },
  ],
};
const expect2 = {
  id: "6000114",
  name: "正教的干扰",
  repeat: 1,
  type: 2,
  item: [
    {
      condition: Condition.asSchema().parse({}),
      num: 1,
      id: "5004510",
      type: "rite",
      weight: 60,
    },
    {
      condition: Condition.asSchema().parse({
        "hand_have.主角": 1,
        all: {
          test: 2,
        },
      }),
      num: 1,
      id: "5004511",
      type: "rite",
      weight: 20,
    },
  ],
};

describe("Test Loot model", () => {
  it("Parse data 1", () => {
    const loot = Loot.deserialize(raw1);
    assert.strictEqual(loot.key, "6000020");
    assert.deepStrictEqual(loot.data, expect1);
  });
  it("Parse data 2", () => {
    assert.deepStrictEqual(Loot.deserialize(raw2).data, expect2);
  });
});
