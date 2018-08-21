
import Formatter from './js/Formatter'
import DynamicText from './js/DynamicText'

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


const fields = new DynamicText(
  new Formatter(/\[\[(.+)\]\]/, '[field]', triggers)
)

console.log(fields)
