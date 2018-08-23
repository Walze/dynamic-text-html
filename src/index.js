
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'

const p1 = performance.now()

/**
 * @type { triggerParamType }
 */
const triggers = {

  list: (formatter, file, divs) => {

    const selectors = [
      '[head]',
      '[item]'
    ]

    const lines = formatter.everyNthLineBreak(file.data, 3)

    return formatter.formatFatherChildren(file, lines, divs, ...selectors)

  },

}


const files = require('./textos/**.txt')
const formatter = new Formatter({ triggers })
const fields = new DynamicText(formatter, files)

console.log(fields)


window.addEventListener('load', () => {

  const perf = performance.now() - p1
  console.warn(`Window loaded in ${Math.round(perf)}ms`)

})

window.addEventListener('DYNAMIC_LOADED', () => {

  const perf = performance.now() - p1
  console.warn(`Files loaded in ${Math.round(perf)}ms`)

})

