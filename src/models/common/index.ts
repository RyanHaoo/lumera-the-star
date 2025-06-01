import { z } from "zod/v4";
export { Condition } from "./condition";

export const IntBoolean = z.literal([0, 1]);
export const IntString = z
  .string()
  .regex(/^[0-9]+$/, { error: "Must be an int in string form" });
export const IdToString = z.int().positive().transform(String);

export function OneOrMore<ZodT extends z.ZodType>(
  Inner: ZodT,
): z.ZodType<
  Array<z.output<typeof Inner>>,
  z.input<typeof Inner> | Array<z.input<typeof Inner>>
> {
  const Wrapped = z.union([
    Inner.transform((inner) => [inner]),
    z.array(Inner),
  ]);
  return Wrapped;
}

export const AfterStoryKey = z.string().brand<"AfterStoryKey">();
export type AfterStoryKey = z.output<typeof AfterStoryKey>;

export const CardKey = z.string().brand<"CardKey">();
export type CardKey = z.output<typeof CardKey>;

export const EventKey = z.string().brand<"EventKey">();
export type EventKey = z.output<typeof EventKey>;

export const LootKey = z.string().brand<"LootKey">();
export type LootKey = z.output<typeof LootKey>;

export const OverKey = z.string().brand<"OverKey">();
export type OverKey = z.output<typeof OverKey>;

export const QuestKey = z.string().brand<"QuestKey">();
export type QuestKey = z.output<typeof QuestKey>;

export const RiteKey = z.string().brand<"RiteKey">();
export type RiteKey = z.output<typeof RiteKey>;

export const UpgradeKey = z.string().brand<"UpgradeKey">();
export type UpgradeKey = z.output<typeof UpgradeKey>;

export const TagName = z.string().nonempty().brand<"TagName">();
export type TagName = z.output<typeof TagName>;
