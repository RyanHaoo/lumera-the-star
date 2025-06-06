import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Quest } from "../quest";
import { Condition } from "../common";

const raw1 = {
  id: 3300114,
  name: "熟悉的星星",
  text: "讲述了一名爱读书的少女在古卷中得到启示，被星星所呼唤的故事。",
  favour_text: "无穷无尽的星海之中，我在看你。",
  upgrade_point: 1,
  pre: 0,
  target: [
    {
      text: "使鲁梅拉飞升为星灵",
      show_counter: "",
      condition: {
        "global_counter.7200233>=": 1,
      },
    },
  ],
  icon: "cards/2000545",
};
const expect1 = {
  id: "3300114",
  name: "熟悉的星星",
  text: "讲述了一名爱读书的少女在古卷中得到启示，被星星所呼唤的故事。",
  favour_text: "无穷无尽的星海之中，我在看你。",
  upgrade_point: 1,
  pre: 0,
  target: [
    {
      text: "使鲁梅拉飞升为星灵",
      show_counter: "",
      condition: Condition.asSchema().parse({
        "global_counter.7200233>=": 1,
      }),
    },
  ],
  icon: "cards/2000545",
};

const raw2 = {
  id: 3300136,
  name: "爱书如狂·一",
  text: "讲述了一个爱书的少女如痴如醉地在书海中徜徉的故事。",
  favour_text: "“那个好命的书呆子！以前跟我们一起讨过饭呢！”",
  upgrade_point: 1,
  pre: 0,
  target: [
    {
      text: "一局游戏内让鲁梅拉读3本书",
      show_counter: "counter.7000100",
      condition: {
        "global_counter.7200181>=": 1,
      },
    },
  ],
  icon: "cards/2000123",
};
const expect2 = {
  id: "3300136",
  name: "爱书如狂·一",
  text: "讲述了一个爱书的少女如痴如醉地在书海中徜徉的故事。",
  favour_text: "“那个好命的书呆子！以前跟我们一起讨过饭呢！”",
  upgrade_point: 1,
  pre: 0,
  target: [
    {
      text: "一局游戏内让鲁梅拉读3本书",
      show_counter: "counter.7000100",
      condition: Condition.asSchema().parse({
        "global_counter.7200181>=": 1,
      }),
    },
  ],
  icon: "cards/2000123",
};

const raw3 = {
  id: 3300003,
  name: "轮回之人",
  text: "讲述了一名臣子终结了20场苏丹的游戏的故事。",
  favour_text: "你已经乐在其中了吗？……你可还记得自己原本是谁？",
  upgrade_point: 1,
  pre: 3200003,
  target: [
    {
      text: "完成20局苏丹的游戏",
      show_counter: "global_counter.7220001",
      condition: {
        "global_counter.7220001>=": 20,
      },
    },
  ],
  icon: "cards/2000001",
};
const expect3 = {
  id: "3300003",
  name: "轮回之人",
  text: "讲述了一名臣子终结了20场苏丹的游戏的故事。",
  favour_text: "你已经乐在其中了吗？……你可还记得自己原本是谁？",
  upgrade_point: 1,
  pre: "3200003",
  target: [
    {
      text: "完成20局苏丹的游戏",
      show_counter: "global_counter.7220001",
      condition: Condition.asSchema().parse({
        "global_counter.7220001>=": 20,
      }),
    },
  ],
  icon: "cards/2000001",
};

describe("Test Quest model", () => {
  it("Parse data 1", () => {
    const quest = Quest.deserialize(raw1);
    assert.deepStrictEqual(quest.data, expect1);
    // @ts-expect-error: assert key type is branded
    quest.key = "1";
  });
  it("Parse data 2 (counter)", () => {
    assert.deepStrictEqual(Quest.deserialize(raw2).data, expect2);
  });
  it("Parse data 3 (global_counter)", () => {
    assert.deepStrictEqual(Quest.deserialize(raw3).data, expect3);
  });
});
