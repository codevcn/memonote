import { Type } from 'class-transformer'
import { IsISO8601, IsOptional, ValidateNested } from 'class-validator'

export class LastNotificationDTO {
    @IsOptional()
    @IsISO8601()
    @Type(() => Date)
    createdAt?: Date
}

export class GetNotifsBodyDTO {
    @ValidateNested()
    @Type(() => LastNotificationDTO)
    lastNotif: LastNotificationDTO
}
