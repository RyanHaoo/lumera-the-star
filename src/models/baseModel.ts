import { z } from "zod/v4";

const anySchema = z.object({}).catchall(z.unknown());
type ModelConstructor<Model extends AbstractModel> = new ({
  key,
  data,
}: {
  key: string;
  data: any;
}) => Model;
/**
 * Base model class for different types of game data (card, event, .etc)
 */
export abstract class AbstractModel {
  static readonly dataSchema: typeof anySchema;
  static readonly keyField: string = "id";

  readonly key: string;
  data: object;

  constructor({ key, data }: { key: string; data: object }) {
    this.key = key;
    this.data = data;
  }

  abstract getBrief(): {
    key: string;
    title: string | null;
    text: string | null;
  };

  static deserialize<Model extends AbstractModel>(
    this: ModelConstructor<Model> & {
      dataSchema: typeof anySchema;
      keyField: string;
    },
    data: object,
  ): Model {
    const parsed = this.dataSchema.parse(data);
    const key = parsed[this.keyField];
    if (typeof key !== "string") {
      throw new Error(`Key must be a string but got "${key}".`);
    }
    const instance = new this({
      key: key,
      data: parsed,
    });
    return instance;
  }
}

export class KeyExistsError extends Error {
  constructor(key: string, from: string) {
    super(`${from}: Fail to add entry with existed key "${key}".`);
    this.name = "KeyExistsError";
  }
}

export class KeyNotFoundError extends Error {
  constructor(key: string, from: string) {
    super(`${from}: Entry with key "${key}" not found.`);
    this.name = "KeyNotFoundError";
  }
}

/**
 * Base entry manager for game data entries.
 * Mean to be extend for each game data class and initialized once for
 * holding all instances.
 */
export abstract class ModelSet<ModelType extends AbstractModel> {
  private readonly entries: Map<string, ModelType>;

  constructor() {
    this.entries = new Map();
  }

  add(entry: ModelType): void {
    if (this.entries.has(entry.key)) {
      throw new KeyExistsError(entry.key, this.constructor.name);
    }
    this.entries.set(entry.key, entry);
  }

  get(key: string): ModelType {
    const entry = this.entries.get(key);
    if (entry == null) {
      throw new KeyNotFoundError(key, this.constructor.name);
    }
    return entry;
  }

  filter(filter: (entry: ModelType) => boolean): Array<ModelType> {
    return Array.from(this.entries.values()).filter(filter);
  }
}

/**
 * Base interface for parsing grouped data embedded in other primitive types
 */
export interface EmbeddedModelInstance {
  data: any;
}

export interface EmbeddedModelStatics {
  new (data: any): EmbeddedModelInstance;
  asSchema(): z.ZodType;
}
