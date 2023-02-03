import {join} from "node:path"
import {readdirSync, readFileSync, statSync, writeFileSync} from "node:fs"
import { platform } from 'node:os'

type Iboilerplate = {
  name: string
  category: string;
  description: string;
  version: string
  folder: string;
  lastUpdate: string;
}

function getAllFolderSubfiles(originalDir: string, ignoredFolders?: string[]) {

  function walk(dir: string): string[] {
    const subFiles = readdirSync(dir, {withFileTypes: true}).flatMap((file) => {
      if (!file.isDirectory()) {
        return join(dir, file.name);
      }
      const isIgnoredFolder = ignoredFolders
        ? ignoredFolders.find((item) => file.name.search(item) > -1)
        : false;
      return isIgnoredFolder ? "" : walk(join(dir, file.name));
    });
    return subFiles;
  }

  const files = walk(originalDir)
    .filter((item) => item !== "")
    .map((item) => item.replace(originalDir, ""));
  return files;
}


const foldersToIgnore = [
  ".git",
  ".github",
  ".husky",
  ".vscode",
  "ignore",
  "node_modules",
  "dist",
  "build"
];

const divider = platform() === 'win32' ? '\\' : '/'
const folderToSearch = join(__dirname, '..', 'boilerplates')
const allSubfiles = getAllFolderSubfiles(folderToSearch, foldersToIgnore);
const allBoilerpaltes = allSubfiles.filter((item: string) => item.split(divider).length === 4 && item.search("package.json") > -1)

const allUpdatedValues = allBoilerpaltes.reduce((acc, value) => {
  const curFile = join(folderToSearch, value)
  const curFolder = value.replace(`${divider}package.json`, '').replace(new RegExp(divider, "g"), '/')
  const curCategory = curFolder.split('/')[1]
  const fileInfo: any = statSync(curFile)
  const obj = JSON.parse(readFileSync(curFile, 'utf8'));
  const { version, description, name} = obj
  const curValue = {
    name: name,
    category: curCategory,
    folder: curFolder,
    version: version,
    description: description,
    lastUpdate: (fileInfo.mtime.toISOString().split("T")[0])
  }

  return [...acc, curValue]
}, [] as Iboilerplate[])

console.log("Updated boilerplates json content!")
writeFileSync('./boilerplates/boilerplates.json', JSON.stringify(allUpdatedValues, null, 2));