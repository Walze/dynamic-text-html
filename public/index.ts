import { FileRenderer, fetchFiles } from '../src/barrel'

// tslint:disable-next-line:no-implicit-dependencies
import '@babel/polyfill'
import './css/main.css'


// tslint:disable:no-require-imports
const filesURLs = {
    loop: require('./text-files/loop.md'),
    // model at wrong order just to show warning, it should be last or after list.md
    model: require('./text-files/model.md'),
    field1: require('./text-files/field1.md'),
    field2: require('./text-files/field2.md'),
    importFile: require('./text-files/importFile.md'),
    field3: require('./text-files/field3.md'),
    list: require('./text-files/list.md'),
}

const renderer = new FileRenderer()

console.log(renderer)

fetchFiles(filesURLs, renderer.ext)
    .map(async (filePromise) => {
        renderer.render(await filePromise)
    })

