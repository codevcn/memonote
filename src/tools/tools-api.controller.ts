import { Controller } from '@nestjs/common'
import { APIRoutes } from '../utils/routes.js'

@Controller(APIRoutes.tools)
export class ToolsController {
    constructor(private trans) {}
}
