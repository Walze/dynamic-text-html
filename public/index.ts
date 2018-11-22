

import '@babel/polyfill'

import { fetchFiles } from '../src/ts/helpers'
import { FileRenderer } from '../src/ts/FileRenderer'

// tslint:disable:no-require-imports
const filesURLs = {
    model: require('./text-files/model.md'),
    field1: require('./text-files/field1.md'),
    field2: require('./text-files/field2.md'),
    field3: require('./text-files/field3.md'),
    list: require('./text-files/list.md'),
}

const renderer = new FileRenderer()

console.log(renderer)

fetchFiles(filesURLs, renderer.ext)
    .map(async (filePromise) => {
        renderer.render(await filePromise)
    })

