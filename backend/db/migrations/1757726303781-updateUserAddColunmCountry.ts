import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAddColunmCountry1757726303781 implements MigrationInterface {
    name = 'UpdateUserAddColunmCountry1757726303781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`country\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`country\``);
    }

}
