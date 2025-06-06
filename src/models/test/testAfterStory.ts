import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AfterStory } from "../afterStory.js";
import { Condition } from "../common/index.js";

const raw1 = {
  id: 2000123,
  name: "鲁梅拉",
  prior: [],
  extra: [
    {
      key: "2000123_extra_2",
      condition: {
        "table_have.2000123": 1,
        "table_have.打包的财物>=": 5,
        "table_have.打包的财物<": 10,
        "table_have.2000366.目的地": 1,
        "!table_have.2000123.被献祭": 1,
        "!table_have.2000123.被牺牲": 1,
        "!table_have.2000123.被驱逐": 1,
      },
      result_text:
        "与你一起航海的旅途中，鲁梅拉很快就觉醒了听风的魔力。她引导天气与海潮的能力成为了七海水手之间的传奇。后来，她与一群鲸鱼建立了超自然的友谊，并且最后因此离开了你的舰队——不过她和她的朋友们此后经常在风暴中突然出现，为你的旗舰指引道路。",
    },
    {
      key: "2000123_extra_12",
      condition: {
        "counter.7000550>=": 1,
        "have.2000123": 1,
      },
      result_text:
        "鲁梅拉失去了你的庇护，但是不用担心她。她成了这个世界上最渊博的智者，历史上所有关于你的客观详实的记载，都出自她的笔下。",
    },
  ],
};
const expect1 = {
  id: "2000123",
  name: "鲁梅拉",
  prior: [],
  extra: [
    {
      key: "2000123_extra_2",
      condition: Condition.asSchema().parse({
        "table_have.2000123": 1,
        "table_have.打包的财物>=": 5,
        "table_have.打包的财物<": 10,
        "table_have.2000366.目的地": 1,
        "!table_have.2000123.被献祭": 1,
        "!table_have.2000123.被牺牲": 1,
        "!table_have.2000123.被驱逐": 1,
      }),
      result_text:
        "与你一起航海的旅途中，鲁梅拉很快就觉醒了听风的魔力。她引导天气与海潮的能力成为了七海水手之间的传奇。后来，她与一群鲸鱼建立了超自然的友谊，并且最后因此离开了你的舰队——不过她和她的朋友们此后经常在风暴中突然出现，为你的旗舰指引道路。",
    },
    {
      key: "2000123_extra_12",
      condition: Condition.asSchema().parse({
        "counter.7000550>=": 1,
        "have.2000123": 1,
      }),
      result_text:
        "鲁梅拉失去了你的庇护，但是不用担心她。她成了这个世界上最渊博的智者，历史上所有关于你的客观详实的记载，都出自她的笔下。",
    },
  ],
};

const raw2 = {
  id: 2000545,
  name: "星灵",
  prior: [],
  extra: [
    {
      key: "2000545_extra_6",
      sort: 2,
      condition: {
        "counter.7000551>=": 1,
        "have.2000545": 1,
      },
      result_text:
        "这之后，天幕上多了两颗挨在一起的星星，它们总是同时升起、同时落下、总以同等的光辉，永恒照耀着你们所爱的土地。\n后来者为这两颗星星附会了无数缠绵悱恻的爱情故事和神话传说，其中最令人动容的一篇，主角的名字正是[player.name]和梅姬。\n是巧合吗？改天得去找鲁梅拉问问。",
    },
  ],
};
const expect2 = {
  id: "2000545",
  name: "星灵",
  prior: [],
  extra: [
    {
      key: "2000545_extra_6",
      sort: 2,
      condition: Condition.asSchema().parse({
        "counter.7000551>=": 1,
        "have.2000545": 1,
      }),
      result_text:
        "这之后，天幕上多了两颗挨在一起的星星，它们总是同时升起、同时落下、总以同等的光辉，永恒照耀着你们所爱的土地。\n后来者为这两颗星星附会了无数缠绵悱恻的爱情故事和神话传说，其中最令人动容的一篇，主角的名字正是[player.name]和梅姬。\n是巧合吗？改天得去找鲁梅拉问问。",
    },
  ],
};

describe("Test Loot model", () => {
  it("Parse data 1", () => {
    const after = AfterStory.deserialize(raw1);
    assert.deepStrictEqual(after.data, expect1);
    // @ts-expect-error: assert key type is branded
    after.key = "1";
  });
  it("Parse data 2", () => {
    assert.deepStrictEqual(AfterStory.deserialize(raw2).data, expect2);
  });
});
