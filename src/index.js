
import Renderer from './js/Renderer'
import fetchFiles from './js/fetchFiles'


/**
 * @type { triggerParamType }
 */
const triggers = {
  default: fields => console.warn('Default fields:', fields),

  list(file, divs) {

    console.warn('"list" fields:', divs)

    const selectors = [
      '[head]',
      '[item]'
    ]

    const lists = this
      .everyNthLineBreak(file.data, 4)
      .map(list => this.everyNthLineBreak(list, 1))

    return this.renderFatherChildren(lists, divs, selectors)

  },
}

const renderer = new Renderer({ triggers })

const filesUrls = require('./textos/**.txt')
const promises = fetchFiles(filesUrls)

promises
  .map(promise => promise
    .then(file => renderer
      .renderFile(file)
    )
  )
