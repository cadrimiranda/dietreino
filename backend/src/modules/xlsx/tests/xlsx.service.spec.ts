import { Test, TestingModule } from '@nestjs/testing';
import { XlsxService } from '../xlsx.service';

import * as fs from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload-minimal';
import { RepRange } from '../dto/sheet.type';

// Helper function para criar um mock de FileUpload a partir de um arquivo real
function createFileUploadFromFile(
  filePath: string,
  filename: string,
): FileUpload {
  return {
    filename,
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: '7bit',
    fieldName: 'file',
    createReadStream: () => fs.createReadStream(filePath),
  };
}

describe('XlsxService', () => {
  let service: XlsxService;
  const testFilesDir = join(process.cwd(), 'test', 'files');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XlsxService],
    }).compile();

    service = module.get<XlsxService>(XlsxService);

    // Garantir que o diretório temporário existe
    const tempDir = join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Garantir que o diretório de arquivos de teste existe
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  describe('extractWorkoutSheet', () => {
    // Este teste requer que você coloque um arquivo XLSX real no diretório test/files
    it('should extract exercises from a real XLSX file', async () => {
      // Caminho para o arquivo XLSX de teste
      const testFilePath = join(testFilesDir, 'workout-test.xlsx');
      // Verifique se o arquivo de teste existe
      expect(fs.existsSync(testFilePath)).toBeTruthy();

      // Crie um mock de FileUpload a partir do arquivo real
      const fileUpload = createFileUploadFromFile(
        testFilePath,
        'workout-test.xlsx',
      );

      // Execute o método sendo testado
      const result = await service.extractWorkoutSheet(fileUpload);

      // Aqui você pode ajustar os expects com base no conteúdo real do seu arquivo
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();

      expect(result[0].sheetName).toBe('Segunda - Base.2 (Costas)');
      expect(result[1].sheetName).toBe('Terça - Base.2 (Ombros)');
      expect(result[2].sheetName).toBe('Quarta - Base.2 (Inferiores)');
      expect(result[3].sheetName).toBe('Quinta - Base.2 (Peitoral)');
      expect(result[4].sheetName).toBe('Sexta - Base.2 (Braços)');

      const {
        exercises: [remadaCurvada, remadaBaixa, puxadorFrente, posteriorOmbro],
      } = result[0];
      expect(remadaCurvada.name).toBe('Remada curvada barra pronada');
      expect(remadaCurvada.rawReps).toBe('3');
      expect(remadaCurvada.restIntervals.length).toBe(2);
      expect(remadaCurvada.restIntervals[0]).toBe('120');
      expect(remadaCurvada.restIntervals[1]).toBe('180');

      expect(remadaCurvada.repSchemes.length).toBe(2);
      expect(remadaCurvada.repSchemes[0].sets).toBe(1);
      expect(remadaCurvada.repSchemes[0].minReps).toBe(10);
      expect(remadaCurvada.repSchemes[0].maxReps).toBe(12);
      expect(remadaCurvada.repSchemes[1].sets).toBe(2);
      expect(remadaCurvada.repSchemes[1].minReps).toBe(8);
      expect(remadaCurvada.repSchemes[1].maxReps).toBe(10);

      expect(remadaBaixa.name).toBe('Remada baixa barra romana');
      expect(remadaBaixa.restIntervals.length).toBe(1);
      expect(remadaBaixa.restIntervals[0]).toBe('120');

      expect(remadaCurvada.repSchemes.length).toBe(2);
      expect(remadaBaixa.repSchemes[0].sets).toBe(2);
      expect(remadaBaixa.repSchemes[0].minReps).toBe(8);
      expect(remadaBaixa.repSchemes[0].maxReps).toBe(10);
      expect(remadaBaixa.repSchemes[1].sets).toBe(2);
      expect(remadaBaixa.repSchemes[1].minReps).toBe(6);
      expect(remadaBaixa.repSchemes[1].maxReps).toBe(8);

      expect(puxadorFrente.name).toBe('Puxador frente triângulo');
      expect(puxadorFrente.repSchemes.length).toBe(1);
      expect(puxadorFrente.repSchemes[0].sets).toBe(3);
      expect(puxadorFrente.repSchemes[0].minReps).toBe(8);
      expect(puxadorFrente.repSchemes[0].maxReps).toBe(10);

      expect(posteriorOmbro.restIntervals.length).toBe(2);
      expect(posteriorOmbro.restIntervals[0]).toBe('60');
      expect(posteriorOmbro.restIntervals[1]).toBe('90');
    });
  });

  describe('parseRepetitions', () => {
    // Acessa o método privado para teste
    let parseRepetitions: (repsString: string) => RepRange[];

    beforeEach(() => {
      // @ts-ignore Acessando método privado para teste
      parseRepetitions = service['parseRepetitions'].bind(service);
    });

    it('should parse single repetition value', () => {
      const result = parseRepetitions('10');
      expect(result.length).toBe(1);
      expect(result[0].sets).toBe(1);
      expect(result[0].minReps).toBe(10);
      expect(result[0].maxReps).toBe(10);
    });

    it('should parse repetition range', () => {
      const result = parseRepetitions('8 a 12');
      expect(result.length).toBe(1);
      expect(result[0].sets).toBe(1);
      expect(result[0].minReps).toBe(8);
      expect(result[0].maxReps).toBe(12);
    });

    it('should parse sets and repetition range', () => {
      const result = parseRepetitions('3x 8 a 12');
      expect(result.length).toBe(1);
      expect(result[0].sets).toBe(3);
      expect(result[0].minReps).toBe(8);
      expect(result[0].maxReps).toBe(12);
    });

    it('should parse sets and repetition range without space', () => {
      const result = parseRepetitions('3x8 a 12');
      expect(result.length).toBe(1);
      expect(result[0].sets).toBe(3);
      expect(result[0].minReps).toBe(8);
      expect(result[0].maxReps).toBe(12);
    });

    it('should parse multiple repetition schemes', () => {
      const result = parseRepetitions('3x 10 a 12/ 2x 8 a 10');
      expect(result.length).toBe(2);
      expect(result[0].sets).toBe(3);
      expect(result[0].minReps).toBe(10);
      expect(result[0].maxReps).toBe(12);
      expect(result[1].sets).toBe(2);
      expect(result[1].minReps).toBe(8);
      expect(result[1].maxReps).toBe(10);
    });

    it('should handle empty strings', () => {
      const result = parseRepetitions('');
      expect(result.length).toBe(0);
    });

    it('should handle invalid formats', () => {
      const result = parseRepetitions('invalid format');
      expect(result.length).toBe(0);
    });
  });

  describe('parseRestIntervals', () => {
    // Acessa o método privado para teste
    let parseRestIntervals: (restString: string) => string[];

    beforeEach(() => {
      // @ts-ignore Acessando método privado para teste
      parseRestIntervals = service['parseRestIntervals'].bind(service);
    });

    it('should parse seconds format', () => {
      const result = parseRestIntervals('60s');
      expect(result).toEqual(['60']);
    });

    it('should parse minutes format', () => {
      const result = parseRestIntervals('2min');
      expect(result).toEqual(['120']);
    });

    it('should parse minutes with dot format', () => {
      const result = parseRestIntervals('2min.');
      expect(result).toEqual(['120']);
    });

    it('should parse time format (min:sec)', () => {
      const result = parseRestIntervals('1:30');
      expect(result).toEqual(['90']);
    });

    it('should parse range in seconds', () => {
      const result = parseRestIntervals('60-90s');
      expect(result).toEqual(['60', '90']);
    });

    it('should parse range in minutes', () => {
      const result = parseRestIntervals('1-2min');
      expect(result).toEqual(['60', '120']);
    });

    it('should handle empty strings', () => {
      const result = parseRestIntervals('');
      expect(result).toEqual(['0']);
    });
  });

  describe('isExerciseRow', () => {
    // Acessa o método privado para teste
    let isExerciseRow: (row: string[]) => boolean;

    beforeEach(() => {
      // @ts-ignore Acessando método privado para teste
      isExerciseRow = service['isExerciseRow'].bind(service);
    });

    it('should identify valid exercise rows', () => {
      expect(isExerciseRow(['Supino Reto', '3', '8 a 12', '60s'])).toBeTruthy();
      expect(isExerciseRow(['Agachamento', '4', '10', '90s'])).toBeTruthy();
    });

    it('should reject invalid exercise rows', () => {
      expect(isExerciseRow(['', '', '', ''])).toBeFalsy();
      expect(isExerciseRow(['Nome do Exercício', '', '', ''])).toBeFalsy();
      expect(
        isExerciseRow(['Título', 'Séries', 'Repetições', 'Descanso']),
      ).toBeFalsy();
      expect(isExerciseRow([])).toBeFalsy();
      expect(isExerciseRow(['Supino Reto'])).toBeFalsy();
    });
  });

  describe('convertToSeconds', () => {
    // Acessa o método privado para teste
    let convertToSeconds: (timeString: string) => number;

    beforeEach(() => {
      // @ts-ignore Acessando método privado para teste
      convertToSeconds = service['convertToSeconds'].bind(service);
    });

    it('should convert seconds format', () => {
      expect(convertToSeconds('45s')).toBe(45);
    });

    it('should convert minutes format', () => {
      expect(convertToSeconds('3min')).toBe(180);
    });

    it('should convert minutes with dot format', () => {
      expect(convertToSeconds('3min.')).toBe(180);
    });

    it('should convert time format (min:sec)', () => {
      expect(convertToSeconds('2:30')).toBe(150);
    });

    it('should handle plain numbers as seconds', () => {
      expect(convertToSeconds('75')).toBe(75);
    });

    it('should handle empty or invalid strings', () => {
      expect(convertToSeconds('')).toBe(0);
      expect(convertToSeconds('invalid')).toBe(0);
    });
  });
});
