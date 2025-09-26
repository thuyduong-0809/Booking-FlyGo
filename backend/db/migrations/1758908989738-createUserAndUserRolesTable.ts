import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndUserRolesTable1758908989738 implements MigrationInterface {
    name = 'CreateUserAndUserRolesTable1758908989738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`UserRoles\` (\`RoleID\` int NOT NULL AUTO_INCREMENT, \`RoleName\` varchar(50) NOT NULL, \`Description\` text NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c3142f9df0510a6ac2d3ff7c48\` (\`RoleName\`), PRIMARY KEY (\`RoleID\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`UserID\` int NOT NULL AUTO_INCREMENT, \`Email\` varchar(100) NOT NULL, \`PasswordHash\` varchar(255) NOT NULL, \`FirstName\` varchar(50) NOT NULL, \`LastName\` varchar(50) NOT NULL, \`Phone\` varchar(20) NULL, \`DateOfBirth\` date NULL, \`PassportNumber\` varchar(50) NULL, \`PassportExpiry\` date NULL, \`RoleID\` int NOT NULL, \`LoyaltyPoints\` int NOT NULL DEFAULT '0', \`LoyaltyTier\` enum ('Standard', 'Silver', 'Gold', 'Platinum') NOT NULL DEFAULT 'Standard', \`IsActive\` tinyint NOT NULL DEFAULT 1, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`LastLogin\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_884fdf47515c24dbbf6d89c2d8\` (\`Email\`), PRIMARY KEY (\`UserID\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD CONSTRAINT \`FK_50820383c86bc3128f4b2e341c5\` FOREIGN KEY (\`RoleID\`) REFERENCES \`UserRoles\`(\`RoleID\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP FOREIGN KEY \`FK_50820383c86bc3128f4b2e341c5\``);
        await queryRunner.query(`DROP INDEX \`IDX_884fdf47515c24dbbf6d89c2d8\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP INDEX \`IDX_c3142f9df0510a6ac2d3ff7c48\` ON \`UserRoles\``);
        await queryRunner.query(`DROP TABLE \`UserRoles\``);
    }

}
