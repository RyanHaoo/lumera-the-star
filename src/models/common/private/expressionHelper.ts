import { z } from "zod/v4";

const IDENTIFIER_CHARS_REG = /^[a-zA-Z0-9一-龟_]+$/;

export const IdentifierSchema = z
  .string()
  .nonempty()
  .regex(IDENTIFIER_CHARS_REG, {
    error: (ctx) => {
      const invalidChars = ctx.input
        .split("")
        .filter((char) => !IDENTIFIER_CHARS_REG.test(char));
      return `Identifier "${ctx.input}" contains invalid characters: ${invalidChars.join(", ")}`;
    },
  })
  .brand("identifier");

export type Identifier = z.output<typeof IdentifierSchema>;
