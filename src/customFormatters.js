
/**
 * @param { string[] } array
 * @param { string } fatherSelector
 * @param { string } childSelector
 */
export function formatFatherChild(array, fatherSelector, childSelector) {
  for (const father of document.querySelectorAll(fatherSelector)) {
    let index = 0

    for (const child of father.querySelectorAll(childSelector))
      child.innerHTML = array[index++]
  }

  return array
}
