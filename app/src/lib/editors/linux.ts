import { pathExists } from 'fs-extra'

import { IFoundEditor } from './found-editor'
import { assertNever } from '../fatal-error'
import { parseEnumValue } from '../enum'

export enum ExternalEditor {
  Atom = 'Atom',
  VSCode = 'Visual Studio Code',
  VSCodeInsiders = 'Visual Studio Code (Insiders)',
  VSCodium = 'VSCodium',
  SublimeText = 'Sublime Text',
  Typora = 'Typora',
  SlickEdit = 'SlickEdit',
}

export function parse(label: string): ExternalEditor | null {
  return parseEnumValue(ExternalEditor, label) ?? null
}

async function getPathIfAvailable(path: string): Promise<string | null> {
  return (await pathExists(path)) ? path : null
}

async function getEditorPath(editor: ExternalEditor): Promise<string | null> {
  switch (editor) {
    case ExternalEditor.Atom:
      return getPathIfAvailable('/usr/bin/atom')
    case ExternalEditor.VSCode:
      return getPathIfAvailable('/usr/bin/code')
    case ExternalEditor.VSCodeInsiders:
      return getPathIfAvailable('/usr/bin/code-insiders')
    case ExternalEditor.VSCodium:
      return getPathIfAvailable('/usr/bin/codium')
    case ExternalEditor.SublimeText:
      return getPathIfAvailable('/usr/bin/subl')
    case ExternalEditor.Typora:
      return getPathIfAvailable('/usr/bin/typora')
    case ExternalEditor.SlickEdit:
      const possiblePaths = [
        '/opt/slickedit-pro2018/bin/vs',
        '/opt/slickedit-pro2017/bin/vs',
        '/opt/slickedit-pro2016/bin/vs',
        '/opt/slickedit-pro2015/bin/vs',
      ]
      for (const possiblePath of possiblePaths) {
        const slickeditPath = await getPathIfAvailable(possiblePath)
        if (slickeditPath) {
          return slickeditPath
        }
      }
      return null
    default:
      return assertNever(editor, `Unknown editor: ${editor}`)
  }
}

export async function getAvailableEditors(): Promise<
  ReadonlyArray<IFoundEditor<ExternalEditor>>
> {
  const results: Array<IFoundEditor<ExternalEditor>> = []

  const [
    atomPath,
    codePath,
    codeInsidersPath,
    codiumPath,
    sublimePath,
    typoraPath,
    slickeditPath,
  ] = await Promise.all([
    getEditorPath(ExternalEditor.Atom),
    getEditorPath(ExternalEditor.VSCode),
    getEditorPath(ExternalEditor.VSCodeInsiders),
    getEditorPath(ExternalEditor.VSCodium),
    getEditorPath(ExternalEditor.SublimeText),
    getEditorPath(ExternalEditor.Typora),
    getEditorPath(ExternalEditor.SlickEdit),
  ])

  if (atomPath) {
    results.push({ editor: ExternalEditor.Atom, path: atomPath })
  }

  if (codePath) {
    results.push({ editor: ExternalEditor.VSCode, path: codePath })
  }

  if (codeInsidersPath) {
    results.push({ editor: ExternalEditor.VSCode, path: codeInsidersPath })
  }

  if (codiumPath) {
    results.push({ editor: ExternalEditor.VSCodium, path: codiumPath })
  }

  if (sublimePath) {
    results.push({ editor: ExternalEditor.SublimeText, path: sublimePath })
  }

  if (typoraPath) {
    results.push({ editor: ExternalEditor.Typora, path: typoraPath })
  }

  if (slickeditPath) {
    results.push({ editor: ExternalEditor.SlickEdit, path: slickeditPath })
  }

  return results
}
