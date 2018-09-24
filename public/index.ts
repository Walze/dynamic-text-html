

const triggers: triggerType = {
  default: (ref, file, divs) => console.warn('Default Triggered', [ref, file, divs]),

  list(ref, file, divs) {

    console.warn('"list" Triggered:', divs)

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



const requireAll = require.context('./textos', true, /\.md$/)
const files = requireAll
  .keys()
  .map((fileName: string): fileType =>
    ({
      name: fileName.replace(/^\.\//g, ''),
      data: requireAll(fileName),
    }),
  )


import(/* webpackChunkName: "FileRenderer" */ '../src/ts/FileRenderer')
  .then(({ FileRenderer }) => {

    const renderer = new FileRenderer({ triggers })
    files.map((file) => renderer.render(file))

  })


// import filesUrls from '../public/textos/**.md'
// renderParcelFiles(filesUrls, renderer)

