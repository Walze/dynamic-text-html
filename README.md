# dynamic-text-html

Uses markdown in .txt files to write HTML.

## Syntax
* all syntax from marked.js are available
* <<TRIGGER_NAME>>
* {CSS_CLASS_NAME1, CSS_CLASSNAME2}
* {{ MULTILINE_COMMENT }}

## Examples
#### Text file
```markdown
<<list>>

{{
    Comments go here
}}

**Title**

! used for block !{red}*block* 
Inline example {red}inline  
lorem ipsum 
```

#### HTML result after
```html
<ul list="" class="collection dynamic">
    <div class="show-file-name">list.txt</div>
    <li class="collection-item">
        <div head="">
            <strong>Title</strong>
        </div>
        <div item="">
            ! used for block 
            <div id="" class="red"><em>block</em></div>
            Inline example <span id="" class="red">inline</span>
            <br>lorem ipsum 
        </div>
    </li>
</ul>
```


```javascript

const triggers = {
  default: fields => console.warn('Default fields:', fields),

  list(file, divs) {

    console.warn('"list" fields:', divs)

    const selectors = [
      '[head]',
      '[item]'
    ]

    const lists = this
      .everyNthLineBreak(file.data, 4)
      .map(list => this.everyNthLineBreak(list, 1))

    return this.renderFatherChildren(lists, divs, selectors)

  },
}

const renderer = new FileRenderer({ triggers })
const filesUrls = require('../public/textos/**.txt')

fetchFiles(filesUrls).map(filePromise =>
  filePromise.then(file =>
    renderer.render(file)
  )
)

```