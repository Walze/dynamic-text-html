

import "@babel/polyfill"

import { ITriggerType } from "../src/types"

interface Iloop<A> {
  index: number;
  dimention: number;
  dimentionIndex: number;
  arr: A[] | A[][];
}

const multidimentionLoop = <A>(
  arr: A[] | A[][],
  func: (value: A, obj: Iloop<A>) => void,
  objRef?: Iloop<A>,
) => {

  const obj = objRef || {
    index: 0,
    dimention: 0,
    dimentionIndex: -1,
    arr,
  }

  obj.dimentionIndex = -1

  for (const item of arr) {
    obj.dimentionIndex++

    if (!Array.isArray(item)) {
      func(item as A, obj)
      obj.index++
      continue
    }

    const arr2 = item as A[] | A[][]


    multidimentionLoop(arr2, func, obj)
  }

  obj.dimention++
}

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

    const broken = ref
      .everyNthLineBreak(data, 3)
      .map((string) =>
        ref.everyNthLineBreak(string, 1)
          .map((item, i) =>
            i === 2
              ? ref.everyNthLineBreak(item, 0)
              : item,
          ),
      )

    console.log(broken)

    const models = Array.from(divs[0].querySelectorAll('[for-model]'))
    if (!models) return


    multidimentionLoop(broken, (_, obj) => {

      console.log(obj, obj.arr)

    })

  },

}
