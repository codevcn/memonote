import { Injectable } from '@nestjs/common'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import { TApplication, TApplicationInfo } from './types'

@Injectable()
export class ApplicationService {
    private applicationFileName: string = 'application.yml'
    private application: TApplication = yaml.load(
        fs.readFileSync(this.applicationFileName, 'utf8'),
    ) as TApplication

    getApplicationInfo(): TApplicationInfo {
        return this.application.info
    }
}
