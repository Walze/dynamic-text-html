

import '@babel/polyfill'
import './css/main.css'

import { fetchFilesPromise } from '../src/ts/helpers'
import { FileRenderer } from '../src/ts/FileRenderer'

import files from './textos/**.md'

const renderer = new FileRenderer()

fetchFilesPromise(files, renderer.ext)((file) => {
    renderer.render(file)
})

