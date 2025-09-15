import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoteColumnRefreshTokenForAccount1757967683721 implements MigrationInterface {
    name = 'RemoteColumnRefreshTokenForAccount1757967683721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`refresh_token\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD \`refresh_token\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP COLUMN \`refresh_token\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`refresh_token\` varchar(255) NULL`);
    }

}
