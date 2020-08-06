import { inject, injectable } from 'inversify';
import * as path from 'path';
import { SandDanceExtension } from './sandDanceExtension';

export const sandDanceLoader = Symbol('sandDanceLoader');

@injectable()
export class SandDanceLoader {
    constructor(@inject(SandDanceExtension) private readonly extension: SandDanceExtension) {}

    public async load(): Promise<void> {
        await this.extension.install();
    }
}
