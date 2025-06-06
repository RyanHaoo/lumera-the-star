import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel.js";
import {
  IdToString,
  IntString,
  Condition,
  LootKey,
  CardKey,
  RiteKey,
  EventKey,
} from "./common/index.js";

const LootItemBaseSchema = z.strictObject({
  num: IntString.transform(Number),
  weight: z.int().positive(),
  condition: Condition.asSchema().optional(),
});
const LootItemSchema = z.discriminatedUnion("type", [
  LootItemBaseSchema.extend({ type: z.literal("card"), id: CardKey }),
  LootItemBaseSchema.extend({ type: z.literal("loot"), id: LootKey }),
  LootItemBaseSchema.extend({ type: z.literal("rite"), id: RiteKey }),
  LootItemBaseSchema.extend({ type: z.literal("event"), id: EventKey }),
]);

const LootDataSchema = z.strictObject({
  id: IdToString.pipe(LootKey),
  name: z.string(),
  repeat: z.int().positive(),
  type: z.literal([2, 3, 99]), // 2-普通, 3-维新, 99-全部掉落
  item: z.array(LootItemSchema),
});

type LootData = z.output<typeof LootDataSchema>;

export class Loot extends AbstractModel {
  static readonly dataSchema = LootDataSchema;
  declare data: LootData;

  constructor({ key, data }: { key: string; data: LootData }) {
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

export class LootSet extends ModelSet<Loot> {
  static readonly model = Loot;
}
