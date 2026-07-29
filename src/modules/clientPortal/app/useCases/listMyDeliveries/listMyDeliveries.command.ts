import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';

export class ListMyDeliveriesCommand extends BaseCommand {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  trackingNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  verificationValue!: string;
}
