import { IFileObject, IFile } from './types'


export const mapObj = <A, B>(
  object: { [key: string]: A },
  cb: (value: A, prop: string, index: number) => B,
) => {

  const newObj: { [key: string]: B } = {}
  let index = 0

  for (const prop in object)
    newObj[prop] = cb(object[prop], prop, index += 1)

  return newObj

}


export const mapObjToArray = <A, B>(
  object: { [key: string]: A },
  cb: (value: A, prop: string, index: number) => B,
) => {

  const arr: B[] = []
  let index = 0

  for (const prop in object)
    arr.push(
      cb(object[prop], prop, index += 1),
    )

  return arr

}

export const makeFile = (name: string, data: string, ext: string): IFile => ({
  name,
  data,
  nameWExt: `${name}.${ext}`,
})


export const makesFiles = (obj: IFileObject, ext: string) =>
  mapObjToArray(obj, (text, name) => makeFile(name, text, ext))


export const fetchMakeFile = (ext: string) =>
  (path: string, name: string) =>
    fetch(path)
      .then((response) => response.text())
      .then((text) => makeFile(name, text, ext))


export const fetchFiles = (
  urlsObj: IFileObject,
  ext: string,
) => mapObjToArray(urlsObj, fetchMakeFile(ext))


export const fetchFilesPromise = (filesUrls: IFileObject, ext: string) => {
  const promises = fetchFiles(filesUrls, ext)

  return (callback: (file: IFile) => void) =>
    promises.map((promise) => promise.then(callback))

}

export const globalMatch = (regex: RegExp, string: string) => {

  const matches = []

  let value
  // tslint:disable-next-line:no-conditional-assignment
  while (value = regex.exec(string) as RegExpExecArray)
    matches.push(value)

  return !matches.length
    ? undefined
    : matches
}

export const regexIndexOf = (text: string, re: RegExp, i = 0) => {
  const indexInSuffix = text.slice(i)
    .search(re)

  return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i
}

