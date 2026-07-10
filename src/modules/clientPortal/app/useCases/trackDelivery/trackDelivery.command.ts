import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { BaseCommand } from '#src/shared/commands/baseCommand.js';

export class TrackDeliveryCommand extends BaseCommand {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  trackingNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  verificationValue!: string;
}
