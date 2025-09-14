import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccountsTable1757867477998 implements MigrationInterface {
    name = 'CreateAccountsTable1757867477998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NULL, \`provider\` enum ('local', 'google') NOT NULL DEFAULT 'local', \`providerId\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`IDX_ee66de6cdc53993296d1ceb8aa\` (\`email\`), UNIQUE INDEX \`REL_3000dad1da61b29953f0747632\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_3000dad1da61b29953f07476324\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_3000dad1da61b29953f07476324\``);
        await queryRunner.query(`DROP INDEX \`REL_3000dad1da61b29953f0747632\` ON \`accounts\``);
        await queryRunner.query(`DROP INDEX \`IDX_ee66de6cdc53993296d1ceb8aa\` ON \`accounts\``);
        await queryRunner.query(`DROP TABLE \`accounts\``);
    }

}
