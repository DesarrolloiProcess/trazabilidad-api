import type { ITxtParserConfig, ITxtParserRepository, ITxtParserRow } from '#src/shared/helpers/txtParser/domain/txtParser.js';

export class TxtParserImpl implements ITxtParserRepository {
  parse(content: string, config: ITxtParserConfig): ITxtParserRow[] {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const dataLines = config.hasHeader ? lines.slice(1) : lines;
    const headerOffset = config.hasHeader ? 2 : 1;

    return dataLines.map((line, index) => ({
      lineNumber: index + headerOffset,
      fields: line.split(config.delimiter).map((field) => field.trim()),
    }));
  }
}
