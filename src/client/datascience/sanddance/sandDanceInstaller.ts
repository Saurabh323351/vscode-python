// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable, named } from 'inversify';
import { Uri } from 'vscode';
import { IApplicationShell, ICommandManager } from '../../common/application/types';
import { Octicons, STANDARD_OUTPUT_CHANNEL } from '../../common/constants';
import { vsixFileExtension } from '../../common/installer/extensionBuildInstaller';

import { IFileDownloader, IOutputChannel } from '../../common/types';
import { SandDanceExtension } from '../../common/utils/localize';
import { traceDecorators } from '../../logging';
import { IDataScienceFileSystem } from '../types';
import { SandDanceExtensionDownloadUri } from './constants';

@injectable()
export class SandDanceInstaller {
    private installed?: boolean;
    constructor(
        @inject(IOutputChannel) @named(STANDARD_OUTPUT_CHANNEL) private readonly output: IOutputChannel,
        @inject(IApplicationShell) private readonly appShell: IApplicationShell,
        @inject(ICommandManager) private readonly cmdManager: ICommandManager,
        @inject(IFileDownloader) private readonly fileDownloader: IFileDownloader,
        @inject(IDataScienceFileSystem) private readonly fs: IDataScienceFileSystem
    ) {}
    @traceDecorators.error('Installing SandDance extension failed')
    public async downloadAndInstall(): Promise<void> {
        if (this.installed) {
            return;
        }
        this.installed = true;
        const vsixFilePath = await this.download();
        try {
            this.output.append(SandDanceExtension.installingExtension());
            await this.appShell.withProgressCustomIcon(Octicons.Installing, async (progress) => {
                progress.report({ message: SandDanceExtension.installingExtension() });
                return this.cmdManager.executeCommand('workbench.extensions.installExtension', Uri.file(vsixFilePath));
            });
            this.output.appendLine(SandDanceExtension.installationCompleteMessage());
        } finally {
            await this.fs.deleteLocalFile(vsixFilePath);
        }
    }

    @traceDecorators.error('Downloading SandDance extension failed')
    private async download(): Promise<string> {
        this.output.appendLine(SandDanceExtension.startingDownloadOutputMessage());
        const downloadOptions = {
            extension: vsixFileExtension,
            outputChannel: this.output,
            progressMessagePrefix: SandDanceExtension.downloadingMessage()
        };
        return this.fileDownloader.downloadFile(SandDanceExtensionDownloadUri, downloadOptions).then((file) => {
            this.output.appendLine(SandDanceExtension.downloadCompletedOutputMessage());
            return file;
        });
    }
}
