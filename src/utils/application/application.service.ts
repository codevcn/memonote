import { Injectable } from '@nestjs/common'
import * as yaml from 'js-yaml'
import { readFile } from 'fs/promises'
import { TApplication, TApplicationInfo } from './types'

@Injectable()
export class ApplicationService {
    private applicationFileName: string = 'application.yml'

    async getApplicationInfo(): Promise<TApplicationInfo> {
        const file = await readFile(`src/utils/application/${this.applicationFileName}`, 'utf8')
        const appInfo = yaml.load(file) as TApplication
        return appInfo.info
    }
}
