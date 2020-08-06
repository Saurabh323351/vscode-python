// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { IExtensions } from '../../common/types';
import { noop } from '../../common/utils/misc';
import { SandDanceExtensionID } from './constants';
import { SandDanceInstaller } from './sandDanceInstaller';

@injectable()
export class SandDanceExtension {
    constructor(
        @inject(SandDanceInstaller) private readonly downloader: SandDanceInstaller,
        @inject(IExtensions) private readonly extensions: IExtensions
    ) {}

    public async install(): Promise<void> {
        // Download and install the extension if not already found.
        if (!this.extensions.getExtension(SandDanceExtensionID)) {
            await this.downloader.downloadAndInstall().catch(noop);
        }
    }
}
