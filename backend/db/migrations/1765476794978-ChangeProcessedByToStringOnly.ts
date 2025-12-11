import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeProcessedByToStringOnly1765476794978 implements MigrationInterface {
    name = 'ChangeProcessedByToStringOnly1765476794978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` DROP FOREIGN KEY \`FK_cf3691f749e05210f150d7d1187\``);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` DROP COLUMN \`processedBy\``);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` ADD \`processedBy\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` DROP COLUMN \`processedBy\``);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` ADD \`processedBy\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`RefundHistory\` ADD CONSTRAINT \`FK_cf3691f749e05210f150d7d1187\` FOREIGN KEY (\`processedBy\`) REFERENCES \`Users\`(\`userId\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
