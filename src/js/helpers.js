

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
