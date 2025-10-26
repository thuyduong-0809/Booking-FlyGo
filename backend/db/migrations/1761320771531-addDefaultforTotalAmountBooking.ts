import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultforTotalAmountBooking1761320771531 implements MigrationInterface {
    name = 'AddDefaultforTotalAmountBooking1761320771531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Bookings\` CHANGE \`totalAmount\` \`totalAmount\` decimal(12,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Bookings\` CHANGE \`totalAmount\` \`totalAmount\` decimal(12,2) NOT NULL`);
    }

}
