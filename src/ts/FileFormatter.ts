

export class FileFormatter {

  protected constructor(
    public flag: RegExp = /<<(.+)>>/u,
    public defaultCssSelector: string = '[field]',
  ) {

  }

  public matchFlag(text: string) {

    const matched = text.match(this.flag)

    return matched ? matched[1] : undefined

  }

  public replaceFlag(text: string, replaceWith: string = '\n') {

    return text.replace(this.flag, replaceWith)

  }

  /**
   * Splits on every line break
   */
  public splitOnN = (text: string, trim: boolean = false) => {

    const t1 = trim ? text.trim() : text

    return t1
      .split('\n')
      .filter((t) => t.match(/[^\s]/))

  }

  public everyNthLineBreak = (text: string, everyN: number) => {

    const regex = /\r\n|\r|\n/ug

    const lines = text
      .trim()
      .split(regex)


    if (everyN <= 0)
      return lines


    const groups: string[] = []

    /** Blocks consecutive breaks */
    let blocked = false

    let groupsIndex = 0
    let breakCounter = 0

    lines.map((line) => {

      let goToNextGroup = false
      const isEmpty = line === ''

      if (!groups[groupsIndex])
        groups[groupsIndex] = ''

      if (isEmpty) breakCounter++
      else breakCounter = 0

      // if breakcounter matches param
      goToNextGroup = breakCounter === everyN && everyN !== 0

      groups[groupsIndex] += `${line}\r\n`

      if (!goToNextGroup)
        blocked = false

      if (goToNextGroup && !blocked) {

        groupsIndex++
        blocked = true

      }

    })

    return groups

  }

}
