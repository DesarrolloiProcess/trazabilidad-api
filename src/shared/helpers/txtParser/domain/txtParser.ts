export interface ITxtParserConfig {
  delimiter: string;
  expectedColumns: number;
  hasHeader?: boolean;
}

export interface ITxtParserRow {
  lineNumber: number;
  fields: string[];
}

export interface ITxtParserRepository {
  parse(content: string, config: ITxtParserConfig): ITxtParserRow[];
}
