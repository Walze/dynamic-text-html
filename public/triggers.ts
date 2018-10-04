

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

  model(ref, { data }, divs) {

    const model = divs[0].querySelector('[for-model]')
    if (!model) return

    model.innerHTML = model.innerHTML
      .replace(
        /(<[^>]+>)([^<\/]+)?(<\/[^>]+>)/g,
        (_, open, text, close) => {

          console.warn(open, text, close)

          text = data

          return `${open}${text}${close}`

        })

    console.log([
      ref,
      data,
    ])

  },

}
