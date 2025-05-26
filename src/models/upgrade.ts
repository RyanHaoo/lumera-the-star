import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel";
import { UpgradeId, CardId } from "./common";

const UpgradeDataSchema = z.strictObject({
  id: UpgradeId,
  name: z.string(),
  text: z.string(),
  cost: z.int().positive(),
  condition: z.object({
    unlock_upgrade: z.optional(UpgradeId),
  }),
  icon: z.enum(["gain", "buff"]),
  link_card: CardId,
  effect: z.record(z.string(), z.unknown()), // TODO
  incompatible: z.union([z.literal(0), UpgradeId]),
});

type UpgradeData = z.infer<typeof UpgradeDataSchema>;

export class Upgrade extends AbstractModel {
  static readonly dataSchema = UpgradeDataSchema;
  declare data: UpgradeData;

  constructor({ id, data }: { id: string; data: UpgradeData }) {
    super({ id, data });
  }

  getBrief() {
    return {
      id: this.id,
      title: this.data.name,
      text: this.data.text,
    };
  }
}

export class UpgradeSet extends ModelSet<Upgrade> {
  static readonly model = Upgrade;
}
