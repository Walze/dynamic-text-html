

export const mapObj = <T>(
  object: { [key: string]: T },
  cb: (value: T, prop: string, index: number) => T,
) => {

  const newObj: { [key: string]: T } = {}
  let index = 0

  for (const prop in object)
    newObj[prop] = cb(object[prop], prop, index++)

  return newObj

}


export const mapObjToArray = <T>(
  object: { [key: string]: T },
  cb: (value: T, prop: string, index: number) => T
) => {

  const arr = []
  let index = 0

  for (const prop in object)
    arr.push(cb(object[prop], prop, index++))

  return arr

}


const fetchMakeFile = (ext: string) =>
  async (path: string, name: string): Promise<fileType> => ({
    name: `${name}.${ext}`,
    data: await fetch(path)
      .then((response) => response.text()),
  })


export const fetchFiles = (urlsObj, ext = 'md'): Promise<fileType>[] =>
  mapObjToArray(urlsObj, fetchMakeFile(ext))


