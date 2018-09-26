import { FileRenderer } from "./FileRenderer"
import { fileType } from "../../typings";


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

export const makeFile = (fileName: string, fileData: string): fileType => (
  {
    name: fileName,
    data: fileData,
  }
)

const fetchMakeFile = (ext: string) =>
  async (path: string, name: string): Promise<fileType> => ({
    name: `${name}.${ext}`,
    data: await fetch(path)
      .then((response) => response.text()),
  })


export const fetchFiles = (
  urlsObj: { [key: string]: string },
  ext = 'md',
) =>
  mapObjToArray(urlsObj, fetchMakeFile(ext))


export const renderParcelFiles = (filesUrls: { [key: string]: string }, renderer: FileRenderer) =>
  fetchFiles(filesUrls)
    .map((filePromise) =>
      filePromise.then((file) =>
        renderer.render(file),
      ),
    );



