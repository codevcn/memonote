import { Type } from 'class-transformer'
import { IsISO8601, IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'

export class GetNotifsParamsDTO {
    @IsNotEmpty()
    @IsMongoId()
    n: string // noteId
}

export class LastNotificationDTO {
    @IsOptional()
    @IsISO8601()
    @Type(() => Date)
    createdAt?: Date
}

export class GetNotifsBodyDTO {
    @ValidateNested()
    lastNotif: LastNotificationDTO
}
