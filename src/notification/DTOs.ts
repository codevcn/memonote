import { IsNotEmpty } from 'class-validator'

export class GetNotificationsDTO {
    @IsNotEmpty()
    noteId: string
}
