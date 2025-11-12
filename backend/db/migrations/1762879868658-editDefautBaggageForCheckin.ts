import { MigrationInterface, QueryRunner } from "typeorm";

export class EditDefautBaggageForCheckin1762879868658 implements MigrationInterface {
    name = 'EditDefautBaggageForCheckin1762879868658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`CheckIns\` CHANGE \`baggageCount\` \`baggageCount\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` CHANGE \`baggageWeight\` \`baggageWeight\` decimal(5,2) NOT NULL DEFAULT '7.00'`);
        await queryRunner.query(`ALTER TABLE \`Payments\` DROP COLUMN \`transactionId\``);
        await queryRunner.query(`ALTER TABLE \`Payments\` ADD \`transactionId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Payments\` DROP COLUMN \`transactionId\``);
        await queryRunner.query(`ALTER TABLE \`Payments\` ADD \`transactionId\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` CHANGE \`baggageWeight\` \`baggageWeight\` decimal(5,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`CheckIns\` CHANGE \`baggageCount\` \`baggageCount\` int NOT NULL DEFAULT '0'`);
    }

}
