
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'

const p1 = performance.now()

/**
 * @type { triggerParamType }
 */
const triggers = {

  LIST: (ref, file) => {

    const selectors = [
      '[items]',
      '[head]',
      '[item]'
    ]
    return ref.formatFatherChildren(
      file,
      ref.everyNthLineBreak(file.data, selectors.length),
      ...selectors
    )
  },

}

const files = require('./textos/**.txt')
const formatter = new Formatter(/\[\[(.+)\]\]/, '[field]', triggers)
const fields = new DynamicText(formatter, files)

console.log(fields)


window.addEventListener('load', () => {
  const perf = performance.now() - p1
  console.warn(`${Math.round(perf)}ms`)
})