
import Formatter from './js/Formatter'
import fetchFiles from './js/fetchFiles'
import StringFormatter from './js/StringFormatter'


const string = new StringFormatter('[red]**nice**')

console.log(string)


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

    return this.formatFatherChildren(lists, divs, selectors)

  },
}

const formatter = new Formatter({ triggers })

const filesUrls = require('./textos/**.txt')
const promises = fetchFiles(filesUrls)

promises
  .map(promise => promise
    .then(file => formatter
      .emitFile(file)))
