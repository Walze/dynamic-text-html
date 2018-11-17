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

export const makeFile = (fileName: string, fileData: string): IFileType => (
  {
    name: fileName,
    data: fileData,
  }
)

// const fetchMakeFile = (ext: string) =>
//   async (path: string, name: string): Promise<IFileType> => ({
//     name: `${name}.${ext}`,
//     data: await fetch(path)
//       .then((response) => response.text()),
//   })

export const fetchMakeFile = (ext: string) =>
  async (path: string, name: string): Promise<IFileType> =>
    makeFile(
      `${name}.${ext}`,
      await fetch(path)
        .then((response) => response.text()),
    )


export const fetchFiles = (
  urlsObj: { [key: string]: string },
  ext: string,
) =>
  mapObjToArray(urlsObj, fetchMakeFile(ext))


export const fetchFilesPromise = (filesUrls: IParcelGlob, ext: string) => {

  const newObj = filesUrls as { [key: string]: string }
  delete newObj.default

  const promises = fetchFiles(newObj, ext)

  return (callback: (file: IFileType) => void) =>
    promises.map((promise) => promise.then(callback))

}



