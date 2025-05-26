import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel";
import { TagId, IntBoolean } from "./common";

const TagDataSchema = z.strictObject({
  id: TagId,
  name: z.string(),
  code: z.string(),
  type: z.enum(["buff", "attribute", "debuff"]),
  text: z.string(),
  tips: z.literal(""), // all empty at present
  resource: z.string(),
  can_add: IntBoolean,
  can_visible: IntBoolean,
  can_inherit: IntBoolean,
  can_nagative_and_zero: IntBoolean,
  fail_tag: z.array(z.never()), // all empty at present
  tag_vanishing: z.literal(0), // all 0 at present
  tag_sfx: z.enum([
    "",
    "hurt",
    "cursed",
    "sacrifice",
    "ithink",
    "incapacitate",
  ]),
  tag_rank: z.number(),
  attributes: z.object({
    吸附指定: z.optional(z.literal(1)),
  }),
});

type TagData = z.infer<typeof TagDataSchema>;

export class Tag extends AbstractModel {
  static readonly dataSchema = TagDataSchema;
  declare data: TagData;

  constructor({ id, data }: { id: string; data: TagData }) {
    super({ id, data });
  }

  getBrief() {
    return {
      id: this.id,
      title: this.data.name,
      text: `[${this.data.type}] ${this.data.text}`,
    };
  }
}

export class TagSet extends ModelSet<Tag> {
  static readonly model = Tag;
}
