import { z } from "zod/v4";

export const UpgradeId = z.int().positive().brand<"UpgradeId">();
export const CardId = z.int().positive().brand<"CardId">();
export const TagId = z.int().positive().brand<"TagId">();

export const IntBoolean = z.literal([0, 1]);
