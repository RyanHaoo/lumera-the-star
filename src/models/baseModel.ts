/**
 * Base model class for different types of game data (card, event, .etc)
 */
export abstract class AbstractModel<DataType extends object> {
  readonly id: string;
  data: DataType;

  constructor({ id, data }: { id: string; data: DataType }) {
    this.id = id;
    this.data = data;
  }

  abstract validate(obj: object): asserts obj is DataType;

  abstract getBrief(): {
    id: string;
    title: string | null;
    text: string | null;
  };
}

/**
 * Base entry manager for game data entries.
 * Mean to be extend for each game data class and initialized once for
 * holding all instances.
 */
export abstract class ModelSet<ModelType extends AbstractModel<object>> {
  private readonly entries: Map<string, ModelType>;

  constructor(entries?: Array<ModelType>) {
    if (entries) {
      this.entries = new Map(entries.map((entry) => [entry.id, entry]));
    } else {
      this.entries = new Map();
    }
  }

  add(entry: ModelType): void {
    if (this.entries.has(entry.id)) {
      throw new Error(`Entry with id ${entry.id} already exists`);
    }
    this.entries.set(entry.id, entry);
  }

  get(id: string): ModelType {
    const entry = this.entries.get(id);
    if (entry == null) {
      throw new Error(`Entry with id ${id} not found`);
    }
    return entry;
  }

  filter(filter: (entry: ModelType) => boolean): Array<ModelType> {
    return Array.from(this.entries.values()).filter(filter);
  }
}
