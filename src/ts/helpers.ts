import { FileRenderer } from "./FileRenderer"
import { IFileType, IparcelGlob } from "../types";


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


export const renderParcelFiles = (filesUrls: IparcelGlob, renderer: FileRenderer) => {

  const newObj = filesUrls as { [key: string]: string }
  delete newObj.default

  return fetchFiles(newObj, renderer.ext)
    .map((filePromise) =>
      filePromise.then((file) =>
        renderer.render(file),
      ),
    );
}



