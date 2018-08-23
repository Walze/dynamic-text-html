
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'

const p1 = performance.now()

/**
 * @type { triggerParamType }
 */
const triggers = {

  default: (fields) => {

    console.warn('Default fields:', fields)

  },

  list: (formatter, file, divs) => {

    console.warn('"list" fields:', divs)

    const selectors = [
      '[head]',
      '[item]'
    ]

    const lines = formatter.everyNthLineBreak(file.data, 3)

    return formatter.formatFatherChildren(lines, divs, selectors, true)

  },

}


const files = require('./textos/**.txt')
const formatter = new Formatter({ triggers })
const fields = new DynamicText(formatter, files)


window.addEventListener('load', () => {

  const perf = performance.now() - p1
  console.log(`Window loaded in ${Math.round(perf)}ms`)
  console.log(fields)

})

window.addEventListener('DYNAMIC_LOADED', () => {

  const perf = performance.now() - p1
  console.log(`Files loaded in ${Math.round(perf)}ms`)

})

