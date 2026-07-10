import type { UserDto } from '#src/modules/user/app/dto/user.dto.js';

export interface LoginResultDto {
  token: string;
  user: UserDto;
}
