

import '@babel/polyfill'
import './css/main.css'

import { fetchFilesPromise } from '../src/ts/helpers'
import { FileRenderer } from '../src/ts/FileRenderer'

// tslint:disable:no-require-imports
const files = {
    field1: require('./text-files/field1.md'),
    field2: require('./text-files/field2.md'),
    field3: require('./text-files/field3.md'),
    list: require('./text-files/list.md'),
    model: require('./text-files/model.md'),
}

const renderer = new FileRenderer()

console.log(renderer)

fetchFilesPromise(files, renderer.ext)((file) => {
    try {
        renderer.render(file)
    } catch (error) {
        console.trace(error)
    }
})

