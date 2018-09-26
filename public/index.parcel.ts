import { makeFile } from '../src/ts/helpers'
import { SF } from '../src/ts/StringFormatter'
import { triggerType, fileType } from '../typings';


const triggers: triggerType = {
  default: (ref, file, divs) => console.warn('Default Triggered', [ref, file, divs]),

  list(ref, { data }, divs) {

    console.warn('"list" Triggered:', divs)

    const selectors = [
      '[head]',
      '[item]',
    ]

    const lists = ref
      .everyNthLineBreak(data, 4)
      .map((list) => ref.everyNthLineBreak(list, 1))

    ref.renderFatherChildren(lists, divs, selectors)

  },
}

import filesUrls from '../public/textos/**.md'
renderParcelFiles(filesUrls, renderer)

