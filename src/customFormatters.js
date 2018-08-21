/**
 * @param { any[] } array
 * @param { string[] } selectors
 */
export function formatFatherChild(array, ...selectors) {

  const fathers = Array.from(document.querySelectorAll(selectors[0]))

  return fathers.map((father, fatherI) => {

    return selectors.map((selector, selectorI) => {
      if (selectorI === 0) return

      const children = Array.from(father.querySelectorAll(selector))

      return children.map((child, childI) => {

        // -1 because the first is the fathers selector
        const index = selectorI - 1 + (childI * (selectors.length - 1))

        if (array[0].constructor === Array)
          child.innerHTML = array[fatherI][index]
        else
          child.innerHTML = array[index]

        return {
          child,
          selector,
          text: array[index]
        }

      })

    }).filter(el => el)

  })

}
