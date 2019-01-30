// tslint:disable:no-require-imports
// tslint:disable:no-implicit-dependencies

import { FileRenderer2 } from './../src/FileRenderer2'
import { FileRenderer } from './../src/FileRenderer'
import { makesFiles, handleBranches } from './../src/helpers'
// import '@babel/polyfill'
import './css/main.css'
import { IBranch } from '../src/types';


const branch_init: IBranch = {
    FILE_NAME: 'FILE_DATA',
    children: [
        {
            FILE_NAME2: 'FILE_DATA',
            children: [
                {
                    FILE_NAME3: 'FILE_DATA',
                },
            ],
        },
        {
            FILE_NAME4: 'FILE_DATA',
        },
    ],
}

console.log(handleBranches(branch_init))


/**
 * Branches are for UNIQUE nested files
 * Shared nested files should be on the bottom of the filesURLS
 */
const filesURLs: {
    [fileName: string]: string;
} = {
    importFile: require('./text-files/importFile.md'),
    loop: require('./text-files/loop.md'),
    model: require('./text-files/model.md'),
    field: require('./text-files/field.md'),
    list: require('./text-files/list.md'),
}

const files = makesFiles(filesURLs, 'md')
console.log(files)
// debugger

export const render2 = () => {
    const t0 = performance.now()

    const renderer = new FileRenderer2()
    console.log(renderer)
    files.map((file) => {
        // debugger
        renderer.render(file)
    })

    const diff = Math.ceil(performance.now() - t0)
    console.warn('\n FileRenderer 2 =>', `${diff}ms`)
}

export const render1 = () => {
    const t0 = performance.now()

    const renderer = new FileRenderer()
    files.map((file) => {

        renderer.render(file)
    })

    const diff = Math.ceil(performance.now() - t0)
    console.warn('\n FileRenderer 1 =>', `${diff}ms`)
}

// const saveDOM = document.body.innerHTML
// document.body.innerHTML = saveDOM

render2()




