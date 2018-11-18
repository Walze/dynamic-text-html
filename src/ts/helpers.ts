import { IParcelGlob } from './../types'
import { IFileType } from "../types"


export const mapObj = <A, B>(
  object: { [key: string]: A },
  cb: (value: A, prop: string, index: number) => B,
) => {

  const newObj: { [key: string]: B } = {}
  let index = 0

  for (const prop in object)
    newObj[prop] = cb(object[prop], prop, index++)

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
      cb(object[prop], prop, index++),
    )

  return arr

}

export const makeFile = (name: string, data: string): IFileType => ({ name, data })

export const fetchMakeFile = (ext: string) =>
  (path: string, name: string) =>
    fetch(path)
      .then((response) => response.text())
      .then((text) => makeFile(`${name}.${ext}`, text))


export const fetchFiles = (
  urlsObj: IParcelGlob,
  ext: string,
) => mapObjToArray(urlsObj, fetchMakeFile(ext))


export const fetchFilesPromise = (filesUrls: IParcelGlob, ext: string) => {
  const promises = fetchFiles(filesUrls, ext)

  return (callback: (file: IFileType) => void) =>
    promises.map((promise) => promise.then(callback))

}



