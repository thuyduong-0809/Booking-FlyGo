import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1757711832753 implements MigrationInterface {
    name = 'CreateUserTable1757711832753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NULL, \`email\` varchar(100) NOT NULL, \`phone\` varchar(25) NULL, \`cccd\` varchar(12) NULL, \`sex\` enum ('male', 'female') NULL, \`role\` enum ('admin', 'customer') NOT NULL DEFAULT 'customer', \`status_verify\` enum ('active', 'inactive') NOT NULL DEFAULT 'inactive', \`avatar\` varchar(255) NULL, \`refresh_token\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
