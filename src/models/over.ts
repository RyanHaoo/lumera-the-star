import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel.js";
import { Condition, IntBoolean, OverKey } from "./common/index.js";

const OverTextExtraSchema = z.strictObject({
  condition: Condition.asSchema(),
  result_text: z.string(),
});

const OverDataSchema = z.strictObject({
  _id: OverKey, // 'id' is absent in the official json so this is lib-internal
  name: z.string().optional(),
  sub_name: z.string().optional(),
  text: z.string(),
  text_extra: z.array(OverTextExtraSchema).optional(),
  open_after_story: IntBoolean.optional(),
  bg: z.string(),
  icon: z.string(),
  title: z.string().optional(), // just a nearly all-same resource path
  success: z.literal([0, 1, 2]).optional(),
  manual_prompt: z.boolean().optional(),
});

type OverData = z.output<typeof OverDataSchema>;

export class Over extends AbstractModel {
  static readonly dataSchema = OverDataSchema;
  static readonly keyField = "_id";
  declare data: OverData;

  constructor({ key, data }: { key: string; data: OverData }) {
    super({ key, data });
  }

  getBrief() {
    return {
      key: this.key,
      title: (this.data.name || "未命名").concat(
        this.data.sub_name || "无描述",
      ),
      text: this.data.text,
    };
  }
}

export class OverSet extends ModelSet<Over> {
  static readonly model = Over;
}
