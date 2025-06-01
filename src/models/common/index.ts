import { z } from "zod/v4";
export { Condition } from "./condition";

export const IntBoolean = z.literal([0, 1]);
export const IntString = z
  .string()
  .regex(/^[0-9]+$/, { error: "Must be an int in string form" });
export const IdToString = z.int().positive().transform(String);

export const AfterStoryKey = z.string().brand<"AfterStoryKey">();
export type AfterStoryKey = z.output<typeof AfterStoryKey>;

export const CardKey = z.string().brand<"CardKey">();
export type CardKey = z.output<typeof CardKey>;

export const EventKey = z.string().brand<"EventKey">();
export type EventKey = z.output<typeof EventKey>;

export const LootKey = z.string().brand<"LootKey">();
export type LootKey = z.output<typeof LootKey>;

export const RiteKey = z.string().brand<"RiteKey">();
export type RiteKey = z.output<typeof RiteKey>;

export const UpgradeKey = z.string().brand<"UpgradeKey">();
export type UpgradeKey = z.output<typeof UpgradeKey>;

export const TagKey = z.string().nonempty().brand<"TagKey">();
export type TagKey = z.output<typeof TagKey>;
