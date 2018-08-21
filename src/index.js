
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
      ref.everyNthLineBreak(texto, selectors.length),
      ...selectors
    )
  },

}


const fields = new DynamicText(
  new Formatter(/\[\[(.+)\]\]/, '[field]', triggers)
)

console.log(fields)
