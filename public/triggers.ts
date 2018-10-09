

import "@babel/polyfill"

import { ITriggerType } from "../src/types"
import { SF } from "../src/ts/StringFormatter";
import { renderer } from ".";

// triggers are triggered per file, not per tag
export const triggers: ITriggerType = {
  default: (...args) => console.info('Default Triggered', args),

  list({ data }, div) {

    console.info('"list" Triggered', div)

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

    // fix this, 0
    renderer.renderMultipleLines(div, lines[0], selectors)

  },

}
