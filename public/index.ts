import { makeFile } from '../src/ts/helpers'
import { SF } from '../src/ts/StringFormatter'


const triggers: triggerType = {
  default: (ref, file, divs) => console.warn('Default Triggered', [ref, file, divs]),

  list(ref, { data }, divs) {

    console.warn('"list" Triggered:', divs)

    const selectors = [
      '[head]',
      '[item]',
    ]

    const lists = ref
      .everyNthLineBreak(data, 4)
      .map((list) => ref.everyNthLineBreak(list, 1))

    ref.renderFatherChildren(lists, divs, selectors)

  },
}


const requireAll = require.context('./textos', true, /\.md$/)
const files = requireAll
  .keys()
  .map((fileName: string): fileType => makeFile(
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

