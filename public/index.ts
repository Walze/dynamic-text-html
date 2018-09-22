
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

const renderer = new FileRenderer({ triggers })

const context = require.context('./textos', true, /\.md$/)

const files = context.keys()
  .map((fileName: string): fileType =>
    ({
      name: fileName,
      data: context(fileName),
    }),
  )


files.map((file) => renderer.render(file))


// import filesUrls from '../public/textos/**.md'
// renderParcelFiles(filesUrls, renderer)


