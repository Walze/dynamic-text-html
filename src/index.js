
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'

/**
 * @type { triggerParamType }
 */
const triggers = {
  LIST: (ref, texto) => {

    const selectors = [
      '[items]',
      '[head]',
      '[item]'
    ]

    return ref.formatFatherChildren(
      ref.breakLines(texto, selectors.length),
      ...selectors
    )
  },
}


const formatter = new Formatter(/\[\[(.+)\]\]/, '[field]', triggers)

const fields = new DynamicText(formatter)

console.log(fields)
