import { IsUUID, IsString, IsNotEmpty, IsLatitude, IsLongitude } from 'class-validator';
import { AuthenticatedCommand } from '#src/shared/commands/authenticatedCommand.js';

export class DeliveryEvidenceCommand extends AuthenticatedCommand {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  signatureUrl!: string;

  @IsString()
  @IsNotEmpty()
  photoUrl!: string;

  @IsString()
  @IsNotEmpty()
  receiverName!: string;

  @IsString()
  @IsNotEmpty()
  receiverIdNumber!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;
}
