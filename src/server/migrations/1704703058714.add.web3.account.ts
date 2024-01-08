import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeb3Account1704703058714 implements MigrationInterface {
  name = 'AddWeb3Account1704703058714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "web3_account" (
        "id" BIGSERIAL NOT NULL,
        "privateKey" text NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3491f82c516dfc792f0e1a015e6" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      ALTER TABLE "web3_contract"
      ADD "writeAccountId" bigint
      `);
    await queryRunner.query(`
      ALTER TABLE "web3_contract"
      ADD CONSTRAINT "FK_10cffd4c81ba6575bc8f27de88e" FOREIGN KEY ("writeAccountId") REFERENCES "web3_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "web3_contract" DROP CONSTRAINT "FK_10cffd4c81ba6575bc8f27de88e"
      `);
    await queryRunner.query(`
      ALTER TABLE "web3_contract" DROP COLUMN "writeAccountId"
      `);
    await queryRunner.query(`
      DROP TABLE "web3_account"
      `);
  }
}
