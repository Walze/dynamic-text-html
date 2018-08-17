import DynamicText, { Formatter } from './js/DynamicText'

const formatter = new Formatter(/\[\[.+\]\]/, '[campo]', {
  LIST: (ref, texto) => {
    console.warn(ref, texto)
  },
})

console.log(formatter)

const campos = new DynamicText(formatter)

console.log(campos)