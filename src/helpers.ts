import { IFileObject, IFile } from './types'
import {
  h, VNode,
} from 'virtual-dom'

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


export const countOccur = (str: string, match: string | RegExp) => (str.match(match) || []).length


export const replaceHTMLCodes = (str: string) =>
  str.replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, '\'')



export const createVTree = (el: HTMLElement): VNode => {
  const tag = el.tagName
  const attributes = getAttrs(el)
  const children = getChildren(el)

  return h(tag, { attributes }, children)
}

const getChildren = (el: HTMLElement) =>
  Array.from(el.childNodes)
    .map((child) => {
      if (child.nodeName === '#text') return child.textContent || ''

      return createVTree(child as HTMLElement)
    })

const getAttrs = (el: HTMLElement) => {
  const { attributes } = el


  const obj: VirtualDOM.createProperties = {}

  if (attributes)
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < attributes.length; i += 1) {
      const { nodeName, nodeValue } = attributes[i]
      obj[nodeName] = nodeValue
    }

  return obj
}

export const replaceBetween = (
  initialString: string,
  start: number,
  end: number,
  replace: string,
) => {
  const arr = initialString.split('')
  arr.splice(start, end + 1 - start, replace) // arr is modified
  const newStr = arr.join('')

  return newStr
}

export const closestN = (array: number[], num: number, index = false) => {
  let minDiff = 1000
  let ans
  let i = 0
  // tslint:disable-next-line:forin
  for (const i2 in array) {
    const m = Math.abs(num - array[i2])
    if (m < minDiff) {
      minDiff = m
      ans = array[i2]
      i = Number(i2)
    }
  }

  if (index)
    return i

  return ans
}
