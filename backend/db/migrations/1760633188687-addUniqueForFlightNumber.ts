import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueForFlightNumber1760633188687 implements MigrationInterface {
    name = 'AddUniqueForFlightNumber1760633188687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Flights\` ADD UNIQUE INDEX \`IDX_e5d26e05976b9471f9b303fd72\` (\`flightNumber\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Flights\` DROP INDEX \`IDX_e5d26e05976b9471f9b303fd72\``);
    }

}
