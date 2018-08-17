import { DynamicText, Formatter } from './js/DynamicText'

const formatter = new Formatter(
  /\[\[(.+)\]\]/,
  '[campo]',
  {
    LIST: (ref, texto) => {
      ref.formatFatherChild(
        ref.breakLines(texto),
        '[items]',
        '[item]'
      )
    },
  }
)

console.log(formatter)

const campos = new DynamicText(formatter)

console.log(campos)
