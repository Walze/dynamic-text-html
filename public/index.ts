
import { FileRenderer } from '../src/js/FileRenderer'
import { fetchFiles } from '../src/js/helpers'


const triggers: triggerType = {
  default: (...args) => console.warn('Default fields:', args),

  list(ref, file, divs) {

    console.warn('"list" fields:', divs)

    const selectors = [
      '[head]',
      '[item]',
    ]

    const lists = ref
      .everyNthLineBreak(file.data, 4)
      .map((list) => ref.everyNthLineBreak(list, 1))

    ref.renderFatherChildren(lists, divs, selectors)

  },
}

// import filesUrls from '../public/textos/**.md'

const context = require.context('./textos', true, /\.md$/)

context.keys()
  .map((fileName: string) => {
    console.warn(fileName, context(fileName))

  })

const renderer = new FileRenderer({ triggers })


// fetchFiles(filesUrls)
//   .map((filePromise) =>
//     filePromise.then((file) =>
//       renderer.render(file),
//     ),
//   )
