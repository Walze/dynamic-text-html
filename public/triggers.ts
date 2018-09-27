import { ITriggerType } from "../src/types"


export const triggers: ITriggerType = {
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
