

import "@babel/polyfill"

import { ITriggerType } from "../src/types"

export const triggers: ITriggerType = {
  default: (...args) => console.info('Default Triggered', args),

  list(ref, { data }, divs) {

    console.info('"list" Triggered', divs)

    const selectors = [
      '[head]',
      '[item]',
    ]

    const lines = ref
      .everyNthLineBreak(data, 4)
      .map((list) =>
        ref.everyNthLineBreak(list, 1),
      )

    divs.map((parent, parentI) =>
      ref.renderMultipleLines(parent, lines[parentI], selectors),
    )

  },

}
