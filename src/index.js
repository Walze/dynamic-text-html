
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'
import './styles/dynamic-files.css'

const p1 = performance.now()

/**
 * @type { triggerParamType }
 */
const triggers = {

  LIST: (formatter, file) => {

    const selectors = [
      '[items]',
      '[head]',
      '[item]'
    ]

    const lines = formatter.everyNthLineBreak(file.data, selectors.length)

    return formatter.formatFatherChildren(file, lines, ...selectors)

  },

}


const files = require('./textos/**.txt')
const formatter = new Formatter(/\[\[(.+)\]\]/u, '[field]', triggers)
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

