import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndUserRoleTable1759004536555 implements MigrationInterface {
    name = 'CreateUserAndUserRoleTable1759004536555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`UserRoles\` (\`roleId\` int NOT NULL AUTO_INCREMENT, \`roleName\` varchar(50) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b99aceded41da7ff6504e77da3\` (\`roleName\`), PRIMARY KEY (\`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`userId\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(100) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`firstName\` varchar(50) NOT NULL, \`lastName\` varchar(50) NOT NULL, \`phone\` varchar(20) NULL, \`dateOfBirth\` date NULL, \`passportNumber\` varchar(50) NULL, \`passportExpiry\` date NULL, \`roleId\` int NOT NULL DEFAULT '1', \`loyaltyPoints\` int NOT NULL DEFAULT '0', \`loyaltyTier\` enum ('Standard', 'Silver', 'Gold', 'Platinum') NOT NULL DEFAULT 'Standard', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`lastLogin\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` (\`email\`), PRIMARY KEY (\`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD CONSTRAINT \`FK_65c56db5a9988b90b0d7245e0f0\` FOREIGN KEY (\`roleId\`) REFERENCES \`UserRoles\`(\`roleId\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP FOREIGN KEY \`FK_65c56db5a9988b90b0d7245e0f0\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP INDEX \`IDX_b99aceded41da7ff6504e77da3\` ON \`UserRoles\``);
        await queryRunner.query(`DROP TABLE \`UserRoles\``);
    }

}
