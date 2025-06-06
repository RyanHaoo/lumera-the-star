import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel.js";
import { Condition, AfterStoryKey, IdToString } from "./common/index.js";

const AfterStoryExtraSchema = z.strictObject({
  key: z.string(),
  condition: Condition.asSchema(),
  sort: z.int().positive().optional(),
  pic: z.string().optional(),
  result_text: z.string(),
});

const AfterStoryDataSchema = z.strictObject({
  id: IdToString.pipe(AfterStoryKey),
  name: z.string(),
  prior: z.array(z.never()), // all empty at present
  extra: z.array(AfterStoryExtraSchema),
});

type AfterStoryData = z.output<typeof AfterStoryDataSchema>;

export class AfterStory extends AbstractModel {
  static readonly dataSchema = AfterStoryDataSchema;
  declare data: AfterStoryData;

  constructor({ key, data }: { key: string; data: AfterStoryData }) {
    super({ key, data });
  }

  getBrief() {
    return {
      key: this.key,
      title: this.data.name,
      text: null,
    };
  }
}

export class AfterStorySet extends ModelSet<AfterStory> {
  static readonly model = AfterStory;
}
