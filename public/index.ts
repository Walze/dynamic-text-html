

import './css/main.css'

import { makeFile } from '../src/ts/helpers'
import { SF } from '../src/ts/StringFormatter'
import { IFileType } from '../src/types'
import { triggers } from './triggers'


const requireAll = require.context('./textos', true, /\.md$/)
const files = requireAll
  .keys()
  .map((fileName: string): IFileType => makeFile(
    SF(fileName)
      .removeDotSlash()
      .string(),
    requireAll(fileName),
  ))


import(/* webpackChunkName: "FileRenderer" */ '../src/ts/FileRenderer')
  .then(({ FileRenderer }) => {

    const renderer = new FileRenderer({ triggers })
    files.map((file) => renderer.render(file))

  })


// import filesUrls from '../public/textos/**.md'
// renderParcelFiles(filesUrls, renderer)

