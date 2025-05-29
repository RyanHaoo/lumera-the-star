import { output } from "zod";
import { z } from "zod/v4";

const anySchema = z.object({}).catchall(z.unknown());
type ModelConstructor<Model extends AbstractModel> = new ({
  id,
  data,
}: {
  id: string;
  data: any;
}) => Model;
/**
 * Base model class for different types of game data (card, event, .etc)
 */
export abstract class AbstractModel {
  static readonly dataSchema: typeof anySchema;

  readonly id: string;
  data: object;

  constructor({ id, data }: { id: string; data: object }) {
    this.id = id;
    this.data = data;
  }

  abstract getBrief(): {
    id: string;
    title: string | null;
    text: string | null;
  };

  static deserialize<Model extends AbstractModel>(
    this: ModelConstructor<Model> & { dataSchema: typeof anySchema },
    data: object,
  ): Model {
    const parsed = this.dataSchema.parse(data);
    const instance = new this({ id: String(parsed.id), data: parsed });
    return instance;
  }
}

export class IdExistsError extends Error {
  constructor(id: string, from: string) {
    super(`${from}: Fail to add entry with existed id "${id}".`);
    this.name = "IdExistsError";
  }
}

export class IdNotFoundError extends Error {
  constructor(id: string, from: string) {
    super(`${from}: Entry with id "${id}" not found.`);
    this.name = "IdNotFoundError";
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
    if (this.entries.has(entry.id)) {
      throw new IdExistsError(entry.id, this.constructor.name);
    }
    this.entries.set(entry.id, entry);
  }

  get(id: string): ModelType {
    const entry = this.entries.get(id);
    if (entry == null) {
      throw new IdNotFoundError(id, this.constructor.name);
    }
    return entry;
  }

  filter(filter: (entry: ModelType) => boolean): Array<ModelType> {
    return Array.from(this.entries.values()).filter(filter);
  }
}

type EmbeddedConstructor<Embedded extends AbstractEmbeddedModel> = new (
  data: any,
) => Embedded;

/**
 * Base model class for parsing grouped data embedded in other primitive types
 */
export abstract class AbstractEmbeddedModel {
  static readonly dataSchema: z.ZodType;
  data: unknown;

  constructor(data: unknown) {
    this.data = data;
  }

  static asSchema<Model extends AbstractEmbeddedModel>(
    this: EmbeddedConstructor<Model> & { dataSchema: z.ZodType },
  ): z.ZodType<Model> {
    return this.dataSchema.transform((data) => new this(data));
  }
}
