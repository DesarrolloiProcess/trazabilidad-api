import { ValidationError } from '#src/shared/Errors/validationError.js';
import type { ITxtParserConfig, ITxtParserRepository, ITxtParserRow } from '#src/shared/helpers/txtParser/domain/txtParser.js';

export class TxtParserService {
  constructor(private readonly repository: ITxtParserRepository) {}

  parseAndValidate(content: string, config: ITxtParserConfig): ITxtParserRow[] {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('El archivo TXT está vacío');
    }

    const rows = this.repository.parse(content, config);

    if (rows.length === 0) {
      throw new ValidationError('El archivo TXT no contiene registros de entrega');
    }

    const invalidRows = rows.filter((row) => row.fields.length !== config.expectedColumns);

    if (invalidRows.length > 0) {
      const lines = invalidRows.map((row) => row.lineNumber).join(', ');
      throw new ValidationError(
        `Estructura del TXT inválida en la(s) línea(s): ${lines}. Se esperaban ${config.expectedColumns} columnas.`,
      );
    }

    return rows;
  }
}
