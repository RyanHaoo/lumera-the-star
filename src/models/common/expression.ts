import { z } from "zod/v4";
import { EmbeddedModelInstance, EmbeddedModelStatics } from "../baseModel";
import { Identifier, IdentifierSchema } from "./private/expressionHelper";

// const ContextSchema = z.literal([
//   "rite",
//   "have",
//   "table_have",
//   "hand_have",
//   "counter",
//   "global_counter",
//   "difficulty",
// ]);
const OPERATORS = ["+", "-"] as const;
const ARITHMETIC_REG = new RegExp("(\\+|-)", "g");
const COMPARES = ["!=", "==", "<", "<=", ">", ">="] as const;
const EXPLICT_COMPARES = ["<", "<=", ">", ">="] as const;
type ComparesSign = (typeof COMPARES)[number];
type Operators = (typeof OPERATORS)[number];

// --------------------
// Parsing DotExpression
// --------------------
interface DotExpressionData {
  context: Identifier;
  dotChain: Identifier[];
}
// TODO: let subclass of 'DotExpression' to set own enum of 'context'
const DotExpressionSchema = z
  .string()
  .transform((str, ctx): DotExpressionData => {
    const identifiers: Identifier[] = [];
    const parts = str.split(".");
    for (const [index, part] of parts.entries()) {
      const result = IdentifierSchema.safeParse(part);
      if (result.success) {
        identifiers.push(result.data);
      } else {
        for (const issue of result.error.issues) {
          issue.path.splice(0, 0, index);
          ctx.issues.push(issue);
        }
      }
    }
    return {
      context: identifiers[0],
      dotChain: identifiers.slice(1),
    };
  });

export class DotExpression implements EmbeddedModelInstance {
  data;

  constructor(data: DotExpressionData) {
    this.data = data;
  }

  static asSchema(): z.ZodType<DotExpression, string> {
    return DotExpressionSchema.transform((data) => new this(data));
  }
}
void (DotExpression as EmbeddedModelStatics);

// --------------------
// Parsing arithmetic
// --------------------
type ArithmeticData = Array<[Operators, DotExpression]>;

const ArithmeticSchema = z
  .string()
  .nonempty()
  .transform((exp, ctx): ArithmeticData => {
    let expression = exp;
    // prepend '+' if not starts with an operator
    if (!OPERATORS.map((op) => exp.startsWith(op)).some(Boolean)) {
      expression = "+".concat(exp);
    }

    const parts = expression.split(ARITHMETIC_REG).slice(1);
    if (parts.length === 2) {
      ctx.issues.push({
        code: "invalid_format",
        input: exp,
        format: `Arthmetic expression "${exp}" contains no known operators: ${OPERATORS.join(", ")}`,
      });
    }

    const result: ArithmeticData = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (!OPERATORS.includes(parts[i] as Operators)) {
        throw new Error(`Expect an operator string but got "${parts[i]}"`);
      }
      const operator = parts[i] as Operators; // checked the occurancy already

      const idParse = DotExpression.asSchema().safeParse(parts[i + 1]);
      if (idParse.success) {
        result.push([operator, idParse.data]);
      } else {
        for (const issue of idParse.error.issues) {
          issue.path.splice(0, 0, Math.round(i / 2));
          ctx.issues.push(issue);
        }
      }
    }
    return result;
  });

export class Arithmetic implements EmbeddedModelInstance {
  data;

  constructor(data: ArithmeticData) {
    this.data = data;
  }

  static asSchema(): z.ZodType<Arithmetic, string> {
    return ArithmeticSchema.transform((data) => new this(data));
  }
}
void (Arithmetic as EmbeddedModelStatics);

// --------------------
// Parsing Predicate
// --------------------
interface PredicateData {
  source: DotExpression | Arithmetic;
  target: number;
  compare: ComparesSign;
}
const PredicateSchema = z
  .tuple([z.string().nonempty(), z.int()])
  .transform(([key, value], ctx): PredicateData => {
    let left = key;
    let compare: ComparesSign = "==";

    for (const operator of COMPARES) {
      if (left.endsWith(operator)) {
        if (!EXPLICT_COMPARES.includes(operator as unknown as typeof EXPLICT_COMPARES[number])) {
          ctx.issues.push({
            code: "invalid_value",
            input: operator,
            message: "Cannot explictly set this comparing",
            values: [...EXPLICT_COMPARES],
          });
        }
        compare = operator;
        left = left.slice(0, left.length - operator.length);
      }
    }

    if (left.startsWith("!")) {
      left = left.slice(1);
      if (compare === "==") {
        compare = "!=";
      } else {
        ctx.issues.push({
          code: "custom",
          input: key,
          message: `Cannot use "!" in conjunction with "${compare}".`,
        });
      }
    }

    let parsedLeft: Arithmetic | DotExpression;
    if (left.startsWith("f:")) {
      // parse expression
      const expressionResult = Arithmetic.asSchema().safeParse(left.slice(2));
      if (expressionResult.success) {
        parsedLeft = expressionResult.data;
      } else {
        for (const issue of expressionResult.error.issues) {
          issue.path.splice(0, 0, "f:");
          ctx.issues.push(issue);
        }
        return z.NEVER;
      }
    } else {
      // parse DotExpression
      const identifierResult = DotExpression.asSchema().safeParse(left);
      if (identifierResult.success) {
        parsedLeft = identifierResult.data;
      } else {
        ctx.issues.push(...identifierResult.error.issues);
        return z.NEVER;
      }
    }

    return {
      source: parsedLeft,
      target: value,
      compare: compare,
    };
  });

export class Predicate implements EmbeddedModelInstance {
  data;

  constructor(data: PredicateData) {
    this.data = data;
  }

  static asSchema(): z.ZodType<Predicate, [string, number]> {
    return PredicateSchema.transform((data) => new this(data));
  }
}
void (Predicate as EmbeddedModelStatics);
