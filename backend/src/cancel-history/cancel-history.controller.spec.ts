import { Test, TestingModule } from '@nestjs/testing';
import { CancelHistoryController } from './cancel-history.controller';
import { CancelHistoryService } from './cancel-history.service';

describe('CancelHistoryController', () => {
    let controller: CancelHistoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CancelHistoryController],
            providers: [
                {
                    provide: CancelHistoryService,
                    useValue: {
                        findAll: jest.fn(),
                        findByBooking: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<CancelHistoryController>(CancelHistoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
