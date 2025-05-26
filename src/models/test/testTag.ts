import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Tag } from "../tag";

const tagData = [
  {
    id: 3000001,
    name: "体魄",
    code: "physique",
    type: "buff",
    text: "决定了角色的力量，敏捷与耐力，象征了身体的综合素质，也是形体健美的象征。",
    tips: "",
    resource: "tag_1",
    can_add: 1,
    can_visible: 1,
    can_inherit: 1,
    can_nagative_and_zero: 1,
    fail_tag: [],
    tag_vanishing: 0,
    tag_sfx: "",
    tag_rank: 99,
    attributes: {},
  },
  {
    id: 3020134,
    name: "火焰大王",
    code: "lock_51",
    type: "attribute",
    text: "玩家不可见",
    tips: "",
    resource: "tag_0",
    can_add: 0,
    can_visible: 0,
    can_inherit: 0,
    can_nagative_and_zero: 0,
    fail_tag: [],
    tag_vanishing: 0,
    tag_sfx: "",
    tag_rank: 10,
    attributes: {
      吸附指定: 1,
    },
  },
];

describe("Test Tag model", () => {
  it("Parse data", () => {
    for (const data of tagData) {
      const tag = Tag.deserialize(data);
      assert.deepStrictEqual(tag.data, data);
    }
  });
});
