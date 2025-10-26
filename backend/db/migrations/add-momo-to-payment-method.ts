import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoMoToPaymentMethod1761000000000 implements MigrationInterface {
    name = 'AddMoMoToPaymentMethod1761000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add MoMo to payment method enum
        await queryRunner.query(`
            ALTER TABLE \`Payments\` 
            MODIFY COLUMN \`paymentMethod\` enum('CreditCard', 'DebitCard', 'PayPal', 'BankTransfer', 'MoMo') NOT NULL
        `);

        // Check if createdAt column doesn't exist before adding
        const columns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Payments' AND COLUMN_NAME = 'createdAt'
        `);

        if (columns.length === 0) {
            await queryRunner.query(`
                ALTER TABLE \`Payments\` 
                ADD COLUMN \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
            `);
        }

        // Check if updatedAt column doesn't exist before adding
        const updatedAtColumns = await queryRunner.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Payments' AND COLUMN_NAME = 'updatedAt'
        `);

        if (updatedAtColumns.length === 0) {
            await queryRunner.query(`
                ALTER TABLE \`Payments\` 
                ADD COLUMN \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove updatedAt column if it exists
        await queryRunner.query(`
            ALTER TABLE \`Payments\` 
            DROP COLUMN IF EXISTS \`updatedAt\`
        `);

        // Remove createdAt column if it exists
        await queryRunner.query(`
            ALTER TABLE \`Payments\` 
            DROP COLUMN IF EXISTS \`createdAt\`
        `);

        // Revert MoMo from payment method enum
        await queryRunner.query(`
            ALTER TABLE \`Payments\` 
            MODIFY COLUMN \`paymentMethod\` enum('CreditCard', 'DebitCard', 'PayPal', 'BankTransfer') NOT NULL
        `);
    }
}

