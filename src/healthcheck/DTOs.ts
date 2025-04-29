import { IsOptional, IsString } from 'class-validator'

export class CheckAliveQueryDTO {
    @IsOptional()
    @IsString()
    holder?: string
}
