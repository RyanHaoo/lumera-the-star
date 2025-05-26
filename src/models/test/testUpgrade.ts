import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Upgrade } from "../upgrade";

const upgradeData = [
  {
    id: 3300042,
    name: "神之侧身像",
    text: "现在，你能看见神了——这是升华的阶梯，也是通向无限疯狂的诅咒。（解锁游戏与神明相关的隐藏故事与额外结局，开启后，游戏会变得更复杂，更困难，可以根据需要自主开关。）",
    cost: 40,
    condition: {},
    icon: "gain", //图标
    link_card: 2000022, //用恶的本质这张卡作为商品封面
    effect: {
      //"global_counter=7230002":1
      "counter+7000658": 1,
    },
    incompatible: 0,
  },
  {
    id: 3300017,
    name: "贵血传承",
    text: "据说，妻子的家族祖上曾经与皇室联姻。时过境迁，这早已成为了一句虚荣的玩笑，但现在，你们连夜研究族谱，要把一切优势都握在手中。",
    cost: 20,
    condition: {
      unlock_upgrade: 3300016, //购买了3100002这个成长项目
    },
    icon: "buff", //图标
    link_card: 2000458, //关联卡牌，点击图标弹出对应卡牌的详情界面
    effect: {
      "g.change": [2000006, 2000458],
      "global_counter=7200177": 1, //成就
      //"g.2000458+追随者":1
    },
    incompatible: 3300016,
  },
];

describe("Test Tag model", () => {
  it("Parse data", () => {
    for (const data of upgradeData) {
      const upgrade = Upgrade.deserialize(data);
      assert.deepStrictEqual(upgrade.data, data);
    }
  });
});
