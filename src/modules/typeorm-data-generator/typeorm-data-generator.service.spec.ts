import { Test, TestingModule } from '@nestjs/testing';
import { TypeormDataGeneratorService } from './typeorm-data-generator.service';

describe('TypeormDataGeneratorService', () => {
  let service: TypeormDataGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeormDataGeneratorService],
    }).compile();

    service = module.get<TypeormDataGeneratorService>(
      TypeormDataGeneratorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
