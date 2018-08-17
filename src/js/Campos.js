import marked from 'marked'


/**
 *
 *
 * @param {string} texto
 * @returns {string[]}
 */
function formatList(texto) {
  return texto
    .replace(/\[LIST\]/, '\n')
    .split(/\r\n|\r|\n/g)
    .filter(txt => !!txt)
}


export default class Campos {

  /**
   * @param {string} selector CSS Selector
   */
  constructor(selector) {
    this.campos = document.querySelectorAll(selector)
    this.files = require('../textos/**.txt')
    this.texts = []

    this._loadTexts().then(() => this._render())
  }

  /**
   * @param {Element} campo
   * @param {number} i
   * @memberof Campos
   */
  _setCampoNumToggle(campo, i) {
    const string = this.texts[i].file
    let active = false

    campo.addEventListener('click', e => {
      if (e.detail !== 4) return

      active = !active

      if (active) campo.innerHTML = string
      else campo.innerHTML = this.texts[i].marked
    })
  }

  _shouldPush(texto) {
    return !texto.includes('[LIST]')
  }

  async _loadTexts() {
    const txts = []

    for (const nome of Object.keys(this.files)) {
      const texto = await fetch(this.files[nome])
        .then(resp => resp.text())

      if (this._shouldPush(texto))
        txts.push({
          file: nome + '.txt',
          marked: marked(texto),
          raw: texto
        })
      else
        console.log([formatList(texto)])
    }

    this.texts = txts

    return txts
  }

  _render() {
    if (!this.texts.length)
      throw alert('Nenhum arquivo de texto foi encontrado na pasta')

    this.campos.forEach((campo, i) => {
      this._setCampoNumToggle(campo, i)
      campo.innerHTML = this.texts[i].marked
    })
  }
}
