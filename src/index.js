
import Formatter from './js/Formatter'
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

    return this.formatFatherChildren(lists, divs, selectors, true)

  },
}

const formatter = new Formatter({ triggers })

const filesUrls = require('./textos/**.txt')
const filesPromises = fetchFiles(filesUrls)

filesPromises.then(files => formatter.fireFiles(files))


/*
 * const el = makeElement('h4', 'AAAA', [
 *   'linhas',
 *   'crete',
 *   'center-align'
 * ])
 */
