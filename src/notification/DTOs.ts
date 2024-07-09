import { IsInt, IsNotEmpty, Min } from 'class-validator'
import { ENotificationMessages } from './messages'
import { Type } from 'class-transformer'

export class GetNotificationsDTO {
    @IsNotEmpty()
    n: string // noteId

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    @Min(1, { message: ENotificationMessages.INVALID_PAGE_NUMBER })
    p: number // page
}
