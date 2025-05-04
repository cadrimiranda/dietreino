import { Test, TestingModule } from '@nestjs/testing';
import { XlsxService } from './xlsx.service';

describe('XlsxService', () => {
  let service: XlsxService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [XlsxService],
    }).compile();

    service = moduleRef.get<XlsxService>(XlsxService);
  });

  it('should test private method', () => {
    const parseRestIntervals = (service as any).parseRestIntervals.bind(
      service,
    );
    expect(parseRestIntervals('90S')).toStrictEqual(['90']);
    expect(parseRestIntervals('1min.')).toStrictEqual(['60']);
    expect(parseRestIntervals('60-90S')).toStrictEqual(['60', '90']);
    expect(parseRestIntervals('1-2min.')).toStrictEqual(['60', '120']);
  });
});
