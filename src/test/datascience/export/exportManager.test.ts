// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { anything, instance, mock, verify, when } from 'ts-mockito';
import { Mocker } from 'ts-mockito/lib/Mock'; // Must be below import 'ts-mockito'
import { TextEditor, Uri } from 'vscode';
import { IFileSystem, TemporaryFile } from '../../../client/common/platform/types';
import { IDisposable } from '../../../client/common/types';
import { ExportManager } from '../../../client/datascience/export/exportManager';
import { ExportUtil } from '../../../client/datascience/export/exportUtil';
import { ExportFormat, IExport, IExportManagerFilePicker } from '../../../client/datascience/export/types';
import { ProgressReporter } from '../../../client/datascience/progress/progressReporter';
import { INotebookModel, INotebookStorage } from '../../../client/datascience/types';

function betterMock(clazz) {
    const mocker = new Mocker(clazz);
    // tslint:disable-next-line: no-string-literal
    mocker['excludedPropertyNames'] = ['hasOwnProperty', 'then'];
    return mocker.getMock();
}

suite('Data Science - Export Manager', () => {
    let exporter: ExportManager;
    let exportPython: IExport;
    let exportHtml: IExport;
    let exportPdf: IExport;
    let fileSystem: IFileSystem;
    let exportUtil: ExportUtil;
    let filePicker: IExportManagerFilePicker;
    const model = mock<INotebookModel>();
    const tempFile = mock<TemporaryFile>();
    setup(async () => {
        exportUtil = mock<ExportUtil>();
        const reporter = mock(ProgressReporter);
        const editor = mock<TextEditor>();
        filePicker = mock<IExportManagerFilePicker>();
        fileSystem = mock<IFileSystem>();
        exportPython = mock<IExport>();
        exportHtml = mock<IExport>();
        exportPdf = mock<IExport>();
        // tslint:disable-next-line: no-any
        (instance(editor) as any).then = undefined;
        // tslint:disable-next-line: no-any
        (instance(model) as any).then = undefined;
        // tslint:disable-next-line: no-any
        (instance(tempFile) as any).then = undefined;

        // tslint:disable-next-line: no-any
        when(filePicker.getExportFileLocation(anything(), anything())).thenReturn(
            Promise.resolve(Uri.file('test.pdf'))
        );
        // tslint:disable-next-line: no-empty
        when(exportUtil.generateTempDir()).thenResolve({ path: 'test', dispose: () => {} });
        when(exportUtil.makeFileInDirectory(anything(), anything(), anything())).thenResolve('foo');
        when(fileSystem.createTemporaryFile(anything())).thenResolve(instance(tempFile));
        when(exportPdf.export(anything(), anything())).thenResolve();
        when(filePicker.getExportFileLocation(anything(), anything())).thenResolve(Uri.file('foo'));
        // tslint:disable-next-line: no-any
        when(reporter.createProgressIndicator(anything())).thenReturn(instance(mock<IDisposable>()) as any);
        exporter = new ExportManager(
            instance(exportPdf),
            instance(exportHtml),
            instance(exportPython),
            instance(fileSystem),
            instance(filePicker),
            instance(reporter),
            instance(exportUtil)
        );
    });

    test('Remove svg is called when exporting to PDF', async () => {
        await exporter.export(ExportFormat.pdf, model);
        verify(exportUtil.removeSvgs(anything())).once();
    });
});
