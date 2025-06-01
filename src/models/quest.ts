import { z } from "zod/v4";
import { AbstractModel, ModelSet } from "./baseModel";
import { Condition, IdToString, QuestKey } from "./common";

const QuestTargetSchema = z.strictObject({
  text: z.string(),
  show_counter: z.union([
    z.literal(""),
    z
      .string()
      .regex(/^(global_)?counter\.[0-9]+$/, { error: "Invalid counter id" }),
  ]),
  condition: Condition.asSchema(),
});

const QuestDataSchema = z.strictObject({
  id: IdToString.pipe(QuestKey),
  name: z.string(),
  text: z.string(),
  favour_text: z.string(),
  upgrade_point: z.int().positive(),
  pre: z.union([z.literal(0), IdToString.pipe(QuestKey)]),
  target: z.array(QuestTargetSchema),
  icon: z.string().nonempty(),
});

type QuestData = z.output<typeof QuestDataSchema>;

export class Quest extends AbstractModel {
  static readonly dataSchema = QuestDataSchema;
  declare data: QuestData;

  constructor({ key, data }: { key: string; data: QuestData }) {
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

export class QuestSet extends ModelSet<Quest> {
  static readonly model = Quest;
}
