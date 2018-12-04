### UNDER CONSTRUCTION

# dynamic-text-html

Uses markdown in .md files to write HTML. You can also change the file extension.

## Syntax
* all syntax from [marked](https://www.npmjs.com/package/marked) are available
* under construction

## Examples
#### Text file model.md
```markdown
{[
    Comments go here
]}

apogmdpaomdgpomaasdgpomasasodpmgmasopdg
apm
pdoggmaogmdapomdgpoam
pdgopdmg

[[cards]]
```

#### HTML result before
```html
<div field="model">
  <div external="cards">
      <h1>cards external</h1>
      <p>
        nice1
      </p>
  </div>
</div>
```

#### HTML result after
```html
<div field="model">
  <p>
    apogmdpaomdgpomaasdgpomasasodpmgmasopdg
    apm
    pdoggmaogmdapomdgpoam
    pdgopdmg
  </p>
  <div external="cards">
      <h1>cards external</h1>
      <p>
        nice1
      </p>
  </div>
</div>
```
