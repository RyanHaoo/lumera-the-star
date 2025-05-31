import { z } from "zod/v4";
import { EmbeddedModelInstance, EmbeddedModelStatics } from "../baseModel";
import { Predicate } from "./expression";
import { unpatchKey } from "~/utils/json";

const ConditionDataSchemaRaw = z
  .strictObject({
    get all() {
      return z.lazy(() => Condition.asSchema().optional());
    },
    get any() {
      return z.lazy(() => Condition.asSchema().optional());
    },
    // event: 5300050, 5320004, 5320056, .etc
    type: z.literal("sudan").optional(),
  })
  .catchall(z.int());

type ConditionDataInput = {
  all?: ConditionDataInput;
  any?: ConditionDataInput;
  type?: "sudan";
} & Record<string, number>;

interface ConditionInternalData {
  allClause?: Condition;
  anyClause?: Condition;
  type?: "sudan";
  predicates: Array<Predicate>;
}

const ConditionDataSchema: z.ZodType<ConditionInternalData, any> =
  ConditionDataSchemaRaw.transform((obj, ctx): ConditionInternalData => {
    const result: ConditionInternalData = {
      ...(obj.all === undefined ? null : { allClause: obj.all }),
      ...(obj.any === undefined ? null : { anyClause: obj.any }),
      ...(obj.type === undefined ? null : { type: obj.type }),
      predicates: [],
    };
    for (const [key, value] of Object.entries(obj)) {
      if (isFixedKeys(key)) {
        continue;
      }
      const predicateResult = Predicate.asSchema().safeParse([
        unpatchKey(key)[0],
        value,
      ]);
      if (predicateResult.success) {
        result.predicates.push(predicateResult.data);
      } else {
        for (const issue of predicateResult.error.issues) {
          issue.path.splice(0, 0, key);
          ctx.issues.push(issue);
        }
      }
    }
    return result;
  });

const FixedKeysEnum = ConditionDataSchemaRaw.keyof().enum;
function isFixedKeys(key: string): key is keyof typeof FixedKeysEnum {
  return Object.keys(FixedKeysEnum).includes(key);
}

export class Condition implements EmbeddedModelInstance {
  data;

  constructor(data: ConditionInternalData) {
    this.data = data;
  }

  static asSchema(): z.ZodType<Condition, ConditionDataInput> {
    return ConditionDataSchema.transform((data) => new this(data));
  }
}
Condition as EmbeddedModelStatics;
