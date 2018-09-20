
import FileRenderer from '../src/js/FileRenderer'
import { fetchFiles } from '../src/js/helpers'


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

const renderer = new FileRenderer({ triggers })
const filesUrls = require('../public/textos/**.md')

fetchFiles(filesUrls).map(filePromise =>
  filePromise.then(file =>
    renderer.render(file)
  )
)
