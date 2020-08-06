import { inject, injectable, named } from 'inversify';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { IDocumentManager } from '../../common/application/types';
import { Identifiers } from '../constants';
import { DataViewerDependencyService } from '../data-viewing/dataViewerDependencyService';
import { IJupyterVariable, IJupyterVariables, INotebook } from '../types';
import { SandDanceExtension } from './sandDanceExtension';

export const sandDanceLoader = Symbol('sandDanceLoader');

@injectable()
export class SandDanceOpener {
    constructor(
        @inject(SandDanceExtension) private readonly extension: SandDanceExtension,
        @inject(IJupyterVariables)
        @named(Identifiers.KERNEL_VARIABLES)
        private readonly variableProvider: IJupyterVariables,
        @inject(IDocumentManager) protected readonly documentManager: IDocumentManager,
        @inject(DataViewerDependencyService) private dependencyService: DataViewerDependencyService
    ) {}

    public async open(variable: IJupyterVariable, notebook: INotebook): Promise<void> {
        // Checks if extension is installed and installs it if it's not
        await this.extension.install();
        await this.dependencyService.checkAndInstallMissingDependencies(notebook.getMatchingInterpreter());
        if (this.variableProvider.makeCSVFileFromDataFrame) {
            const tempCSV = await this.variableProvider.makeCSVFileFromDataFrame(variable, notebook);
            vscode.commands.executeCommand('sanddance.view', Uri.file(tempCSV.filePath));
        }
    }
}
