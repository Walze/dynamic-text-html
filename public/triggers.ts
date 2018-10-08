

import "@babel/polyfill"

import { ITriggerType } from "../src/types"
import { SF } from "../src/ts/StringFormatter";

export const triggers: ITriggerType = {
  default: (...args) => console.info('Default Triggered', args),

  list(ref, { data }, divs) {

    console.info('"list" Triggered', divs)

    const selectors = [
      '[head]',
      '[item]',
    ]

    const lines = SF(data)
      .everyNthLineBreak(4)
      .map((list) =>
        SF(list)
          .everyNthLineBreak(1),
      )

    divs.map((parent, parentI) =>
      ref.renderMultipleLines(parent, lines[parentI], selectors),
    )

  },

}
