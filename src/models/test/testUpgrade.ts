import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Upgrade } from "../upgrade";

const raw1 = {
  id: 3300042,
  name: "神之侧身像",
  text: "现在，你能看见神了——这是升华的阶梯，也是通向无限疯狂的诅咒。（解锁游戏与神明相关的隐藏故事与额外结局，开启后，游戏会变得更复杂，更困难，可以根据需要自主开关。）",
  cost: 40,
  condition: {},
  icon: "gain",
  link_card: 2000022,
  effect: {
    "counter+7000658": 1,
  },
  incompatible: 0,
};
const expect1 = {
  id: "3300042",
  name: "神之侧身像",
  text: "现在，你能看见神了——这是升华的阶梯，也是通向无限疯狂的诅咒。（解锁游戏与神明相关的隐藏故事与额外结局，开启后，游戏会变得更复杂，更困难，可以根据需要自主开关。）",
  cost: 40,
  condition: {},
  icon: "gain",
  link_card: "2000022",
  effect: {
    "counter+7000658": 1,
  },
  incompatible: 0,
};

const raw2 = {
  id: 3300017,
  name: "贵血传承",
  text: "据说，妻子的家族祖上曾经与皇室联姻。时过境迁，这早已成为了一句虚荣的玩笑，但现在，你们连夜研究族谱，要把一切优势都握在手中。",
  cost: 20,
  condition: {
    unlock_upgrade: 3300016,
  },
  icon: "buff",
  link_card: 2000458,
  effect: {
    "g.change": [2000006, 2000458],
    "global_counter=7200177": 1,
  },
  incompatible: 3300016,
};
const expect2 = {
  id: "3300017",
  name: "贵血传承",
  text: "据说，妻子的家族祖上曾经与皇室联姻。时过境迁，这早已成为了一句虚荣的玩笑，但现在，你们连夜研究族谱，要把一切优势都握在手中。",
  cost: 20,
  condition: {
    unlock_upgrade: "3300016",
  },
  icon: "buff",
  link_card: "2000458",
  effect: {
    "g.change": [2000006, 2000458],
    "global_counter=7200177": 1,
  },
  incompatible: "3300016",
};

describe("Test Upgrade model", () => {
  it("Parse data 1", () => {
    const upgrade = Upgrade.deserialize(raw1);
    assert.deepStrictEqual(upgrade.data, expect1);
    // @ts-expect-error
    upgrade.key = "1";
  });
  it("Parse data 2", () => {
    assert.deepStrictEqual(Upgrade.deserialize(raw2).data, expect2);
  });
});
