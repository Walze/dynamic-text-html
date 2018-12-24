import { FileRenderer2 } from './../src/FileRenderer2'
import { FileRenderer } from './../src/FileRenderer'
import { makesFiles } from './../src/helpers'

// tslint:disable-next-line:no-implicit-dependencies
// import '@babel/polyfill'
import './css/main.css'


// tslint:disable:no-require-imports
const filesURLs = {
    importFile: require('./text-files/importFile.md'),
    loop: require('./text-files/loop.md'),
    // model at wrong order just to show warning, it should be last or after list.md
    model: require('./text-files/model.md'),
    field1: require('./text-files/field1.md'),
    field2: require('./text-files/field2.md'),
    field3: require('./text-files/field3.md'),
    list: require('./text-files/list.md'),
}

const files = makesFiles(filesURLs, 'md')

export const render2 = () => {
    const t0 = performance.now()

    const renderer = new FileRenderer2()
    files.map((file) => renderer.render(file))

    console.warn('\n FileRenderer 2:', performance.now() - t0, 'ms')
}

export const render1 = () => {
    const t0 = performance.now()

    const renderer = new FileRenderer()
    files.map((file) => renderer.render(file))

    console.warn('\n FileRenderer 1:', performance.now() - t0, 'ms')
}

// const saveDOM = document.body.innerHTML
// document.body.innerHTML = saveDOM

render2()




