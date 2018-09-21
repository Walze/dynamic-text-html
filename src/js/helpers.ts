

/**
 * @param { {} } object
 * @param { (value: any, prop: string, index: number) => any } cb
 */
export const mapObj = (object, cb) => {

  const newObj = {}
  let index = 0

  for (const prop in object)
    newObj[prop] = cb(object[prop], prop, index++)

  return newObj

}


/**
 * @param { {} } object
 * @param { (value: any, prop: string, index: number) => any } cb
 */
export const mapObjToArray = (object, cb) => {

  const arr = []
  let index = 0

  for (const prop in object)
    arr.push(cb(object[prop], prop, index++))

  return arr

}


/**
 * @param { string } ext
 * @returns { (path: string, name: string) => Promise<fileType> }
 */
const fetchMakeFile = ext =>
  async (path, name) => ({
    name: `${name}.${ext}`,
    data: await fetch(path).then(response => response.text()),
  })


/**
 * @returns { Promise<fileType>[] }
 */
export const fetchFiles = (urlsObj, ext = 'md') =>
  mapObjToArray(urlsObj, fetchMakeFile(ext))


