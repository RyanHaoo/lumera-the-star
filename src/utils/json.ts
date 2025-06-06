import {
  CommentArray,
  CommentObject,
  CommentJSONValue,
  stringify,
} from "comment-json";
import {
  unpatchKey,
  parse,
  JSONParseError,
  isNotSimpleJSONValue,
} from "./private/jsonHelpers.js";

export { JSONParseError, unpatchKey, stringify };

function assertIsCommentObject(
  value: CommentJSONValue,
): asserts value is CommentObject {
  if (!isNotSimpleJSONValue(value)) {
    throw new TypeError(`JSON: expect an object, got "${value}" instead.`);
  }

  if (value instanceof CommentArray) {
    throw new TypeError(
      `JSON: expect an object, got an array instead: ${value}`,
    );
  }
}

/**
 * Parses a JSON string of an object, with comments and duplicate keys supported.
 *
 * @see https://github.com/kaelzhang/node-comment-json on how the comments are handled as `CommentObject`.
 *
 * @param options.patchDuplicateKey - Duplicate keys will be patched with unique tokens if set to `True`
 * , otherwise trigger a `SyntaxError`, recursively. Defaults to `false`.
 * @param options.removesComments - If `true`, ignore all comments when parsing. Defaults to `false`.
 * @throws `JSONParseError` on invalid JSON syntax.
 * @throws `JSONParseError` on duplicate keys if `options.patchDuplicateKey = false`.
 * @throws `TypeError` if the given `json` is not parsed to an object (array, string, .etc).
 */
export function parseObject(
  json: string,
  { patchDuplicateKey = false, removesComments = false } = {},
): CommentObject {
  const parsed = parse(json, { patchDuplicateKey, removesComments });
  assertIsCommentObject(parsed);

  return parsed;
}

/**
 * Same as `parseObject`, but also ensures the parsed object has the form of `{ string: object }`.
 * Useful for parsing json which is a container for `id -> object` pairs.
 *
 * @see {@link parseObject}
 */
export function parseObjectMap(
  json: string,
  { patchDuplicateKey = false, removesComments = false } = {},
): CommentObject {
  const parsed = parseObject(json, { patchDuplicateKey, removesComments });
  for (const obj of Object.values(parsed)) {
    assertIsCommentObject(obj);
  }
  return parsed;
}
