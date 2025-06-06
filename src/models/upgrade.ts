import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel.js";
import { CardKey, IdToString, UpgradeKey } from "./common/index.js";

const UpgradeIdToKey = IdToString.pipe(UpgradeKey);

const UpgradeDataSchema = z.strictObject({
  id: UpgradeIdToKey,
  name: z.string(),
  text: z.string(),
  cost: z.int().positive(),
  condition: z.object({
    unlock_upgrade: z.optional(UpgradeIdToKey),
  }),
  icon: z.enum(["gain", "buff"]),
  link_card: IdToString.pipe(CardKey),
  effect: z.record(z.string(), z.unknown()), // TODO
  incompatible: z.union([z.literal(0), UpgradeIdToKey]),
});

type UpgradeData = z.output<typeof UpgradeDataSchema>;

export class Upgrade extends AbstractModel {
  static readonly dataSchema = UpgradeDataSchema;
  declare key: UpgradeKey;
  declare data: UpgradeData;

  constructor({ key, data }: { key: string; data: UpgradeData }) {
    super({ key, data });
  }

  getBrief() {
    return {
      key: this.key,
      title: this.data.name,
      text: this.data.text,
    };
  }
}

export class UpgradeSet extends ModelSet<Upgrade> {
  static readonly model = Upgrade;
}
