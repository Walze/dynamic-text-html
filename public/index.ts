

import '@babel/polyfill'
import './css/main.css'

import { fetchFilesPromise } from '../src/ts/helpers'
import { FileRenderer } from '../src/ts/FileRenderer'

// @ts-ignore
import files from './textos/**.md'

const renderer = new FileRenderer()

console.log(renderer)

fetchFilesPromise(files, renderer.ext)((file) => {
    try {
        renderer.render(file)
    } catch (error) {
        console.trace(error)
    }
})

