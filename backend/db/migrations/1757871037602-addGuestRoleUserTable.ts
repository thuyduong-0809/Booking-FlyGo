import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGuestRoleUserTable1757871037602 implements MigrationInterface {
    name = 'AddGuestRoleUserTable1757871037602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('guest', 'customer', 'admin') NOT NULL DEFAULT 'guest'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('admin', 'customer') NOT NULL DEFAULT 'customer'`);
    }

}
