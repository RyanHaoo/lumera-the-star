import {
  parse as cParse,
  assign as cAssign,
  CommentArray,
  CommentSymbol,
  CommentObject,
  CommentJSONValue,
} from "comment-json";

const KEY_PATCH_SEP = "_$$";
/**
 * Unpatch an object key returned from `parseObject` or `parseObjectMap` with `patchDuplicateKey = True`
 *
 * @returns A 2-tuple of the real key and an optional pointer:
 * - key: the original key `string` as is in the json
 * - pointer: a unique `number` for duplicate keys, otherwise `null`
 */
export const unpatchKey = keyUnpatcherFactory(KEY_PATCH_SEP);

export function isNotSimpleJSONValue(
  value: CommentJSONValue,
): value is CommentArray<CommentJSONValue> | CommentObject {
  return !(
    value === null ||
    value instanceof Number ||
    value instanceof String ||
    value instanceof Boolean ||
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean"
  );
}

/**
 * @private
 */
export function keyUnpatcherFactory(
  patchSep: string,
): (key: string) => [key: string, pointer: number | null] {
  return (key: string) => {
    const parts = key.split(patchSep);
    if (parts.length === 1) {
      return [key, null];
    } else if (parts.length > 2) {
      throw new Error(
        `Expect 0 or 1 KEY_PATCH_SEP but found ${parts.length - 1} in "${key}".`,
      );
    }
    return [parts[0], Number(parts[1])];
  };
}

export interface RawJSONParseError extends SyntaxError {
  line: number;
  column: number;
}

type Position = {
  line?: number;
  column?: number;
};

/**
 * Error for trying to parse an invalid JSON.
 *
 * @extends Error
 * @property {object} position - Where the error occured
 * @property {number} position.line
 * @property {number} position.column
 */
export class JSONParseError extends Error {
  position: Position;

  constructor(position: Position, ...args: any[]) {
    super(...args);
    this.name = "JSONParseError";
    this.position = position;
  }
}

/**
 * Internal wrapper of `comment-json.parse`
 * @private
 */
export function parse(
  json: string,
  { patchDuplicateKey = false, removesComments = false } = {},
): CommentJSONValue {
  let parsed;
  try {
    parsed = cParse(
      json,
      null,
      removesComments,
      patchDuplicateKey ? KEY_PATCH_SEP : false,
    );
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      throw e;
    }

    // SyntaxError could only be throwed by comment-json as this
    const rawError = e as RawJSONParseError;
    throw new JSONParseError(
      {
        line: rawError.line,
        column: rawError.column,
      },
      e.message,
    );
  }

  if (patchDuplicateKey && isNotSimpleJSONValue(parsed)) {
    if (parsed instanceof CommentArray) {
      return unpatchArrayRecur(parsed);
    }
    return unpatchDistinctKeyRecur(parsed);
  }
  return parsed;
}

/**
 * @private
 */
export function copyCommentOfKey(
  source: CommentObject,
  sourceKey: string,
  target: CommentObject,
  targetKey: string,
): void {
  // copy value
  if (!Object.keys(source).includes(sourceKey)) {
    throw new Error(
      `Can not copy non-existed "${sourceKey}" from source: ${source}`,
    );
  }
  // target[targetKey] = source[sourceKey];

  // copy comments
  // https://github.com/kaelzhang/node-comment-json/blob/0f4f85a325222fc2ee42a9f35acf174deb27b74f/src/common.js#L45
  for (const prefix of ["before", "after"]) {
    const comments =
      source[Symbol.for(`${prefix}:${sourceKey}`) as CommentSymbol];
    if (comments !== undefined) {
      Object.defineProperty(
        target,
        Symbol.for(`${prefix}:${targetKey}`) as CommentSymbol,
        {
          value: comments,
          writable: true,
          configurable: true,
        },
      );
    }
  }
}

/**
 * Recursively remove patches on distinct object keys.
 *
 * @private
 * @returns A deep copy of input object.
 */
export function unpatchDistinctKeyRecur(obj: CommentObject): CommentObject {
  // build a key->keyCount map to find out distinct keys to unpatch
  const keyCounts: Map<string, number> = new Map();
  for (const key of Object.keys(obj)) {
    const name = unpatchKey(key)[0];
    const count = keyCounts.get(name);
    keyCounts.set(name, count === undefined ? 0 : count + 1);
  }

  const unpatched: any = {};
  // copy non-prop comments
  cAssign(unpatched, obj, []);
  // copy props
  for (const [key, value] of Object.entries(obj)) {
    let unpatchedValue;
    // 1. recusively unpatch value
    if (!isNotSimpleJSONValue(value)) {
      // simple value doesn't need to be unpatched
      unpatchedValue = value;
    } else if (value instanceof CommentArray) {
      unpatchedValue = unpatchArrayRecur(value);
    } else {
      // must be CommentObject here
      const valueCheck: CommentObject = value;
      unpatchedValue = unpatchDistinctKeyRecur(valueCheck);
    }

    // 2. copy value and comments
    const name = unpatchKey(key)[0];
    // remove patch for distinct keys
    const targetKey = keyCounts.get(name) === 0 ? name : key;
    unpatched[targetKey] = unpatchedValue;
    copyCommentOfKey(obj, key, unpatched, targetKey);
  }

  return unpatched as CommentObject;
}

function unpatchArrayRecur(
  array: CommentArray<CommentJSONValue>,
): CommentArray<CommentJSONValue> {
  const unpatched = array.slice() as CommentArray<CommentJSONValue>;
  for (const [index, value] of array.entries()) {
    if (value instanceof CommentArray) {
      unpatched[index] = unpatchArrayRecur(value);
    } else if (typeof value === "object" && value !== null) {
      unpatched[index] = unpatchDistinctKeyRecur(value);
    }
  }
  return unpatched;
}
