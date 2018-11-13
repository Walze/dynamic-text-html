

export class FileFormatter {

  public flag: RegExp = /<<(.+)>>/u

  public matchFlag(text: string) {

    const matched = text.match(this.flag)

    return matched ? matched[1] : undefined

  }

  public replaceFlag(text: string, replaceWith: string = '\n') {

    return text.replace(this.flag, replaceWith)

  }

}
