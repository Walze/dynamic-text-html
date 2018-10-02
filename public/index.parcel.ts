

import './css/main.css'

import { renderParcelFiles } from '../src/ts/helpers'
import { FileRenderer } from '../src/ts/FileRenderer'
import { triggers } from './triggers'


import files from './textos/**.md'

renderParcelFiles(files, new FileRenderer({ triggers }))


