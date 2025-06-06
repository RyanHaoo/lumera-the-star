import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Over } from "../over";
import { Condition } from "../common";

const raw1 = {
  _id: "2",
  name: "永恒之梦",
  sub_name: "最爱你的人杀了你",
  text: "在梅姬的怀抱中，你陷入永远无法醒来的睡梦，其名为死亡。",
  text_extra: [
    {
      condition: {},
      result_text: "",
    },
  ],
  bg: "over_cg/over_cg_1",
  icon: "over_icon/over_icon_1",
  title: "over_icon/over_title",
};
const expect1 = {
  _id: "2",
  name: "永恒之梦",
  sub_name: "最爱你的人杀了你",
  text: "在梅姬的怀抱中，你陷入永远无法醒来的睡梦，其名为死亡。",
  text_extra: [
    {
      condition: Condition.asSchema().parse({}),
      result_text: "",
    },
  ],
  bg: "over_cg/over_cg_1",
  icon: "over_icon/over_icon_1",
  title: "over_icon/over_title",
};

const raw2 = {
  _id: "204",
  name: "新的国",
  sub_name: "难以置信！\n你竟然做到了！",
  success: 2,
  text: "全新的国家（还在施工中）",
  text_extra: [
    {
      condition: {
        "counter.7000458>=": 1,
      },
      result_text: "光明王（还在施工中）",
    },
    {
      condition: {
        "counter.7000458<": 1,
        "counter.7000459<": 1,
      },
      result_text: "未变之国（还在施工中）",
    },
  ],
  open_after_story: 0,
  bg: "over_cg/over_cg_100",
  icon: "over_icon/over_icon_1",
  title: "over_icon/over_title",
  manual_prompt: true,
};
const expect2 = {
  _id: "204",
  name: "新的国",
  sub_name: "难以置信！\n你竟然做到了！",
  success: 2,
  text: "全新的国家（还在施工中）",
  text_extra: [
    {
      condition: Condition.asSchema().parse({
        "counter.7000458>=": 1,
      }),
      result_text: "光明王（还在施工中）",
    },
    {
      condition: Condition.asSchema().parse({
        "counter.7000458<": 1,
        "counter.7000459<": 1,
      }),
      result_text: "未变之国（还在施工中）",
    },
  ],
  open_after_story: 0,
  bg: "over_cg/over_cg_100",
  icon: "over_icon/over_icon_1",
  title: "over_icon/over_title",
  manual_prompt: true,
};

describe("Test Loot model", () => {
  it("Parse data 1", () => {
    const over = Over.deserialize(raw1);
    assert.deepStrictEqual(over.data, expect1);
    // @ts-expect-error: assert key type is branded
    over.key = "1";
  });
  it("Parse data 2", () => {
    assert.deepStrictEqual(Over.deserialize(raw2).data, expect2);
  });
});
