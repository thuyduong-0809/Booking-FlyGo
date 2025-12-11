import { Test, TestingModule } from '@nestjs/testing';
import { CancelHistoryService } from './cancel-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CancelHistory } from './entities/cancel-history.entity';

describe('CancelHistoryService', () => {
    let service: CancelHistoryService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelHistoryService,
                {
                    provide: getRepositoryToken(CancelHistory),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CancelHistoryService>(CancelHistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
