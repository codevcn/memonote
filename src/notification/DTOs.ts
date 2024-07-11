import { Type } from 'class-transformer'
import { IsISO8601, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'

export class GetNotifsParamsDTO {
    @IsNotEmpty()
    n: string // noteId
}

export class LastNotificationDTO {
    @IsOptional()
    @IsISO8601()
    @Type(() => LastNotificationDTO)
    createdAt?: Date
}

export class GetNotifsBodyDTO {
    @ValidateNested()
    lastNotif: LastNotificationDTO
}
