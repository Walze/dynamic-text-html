// tslint:disable
// @ts-ignore
function ReplaceWithPolyfill() {
  'use-strict'; // For safari, and IE > 10
// @ts-ignore
  var parent = this.parentNode, i = arguments.length, currentNode;
  if (!parent) return;
  if (!i) // if there are no arguments
// @ts-ignore
    parent.removeChild(this);
  while (i--) { // i-- decrements i and returns the value of i before the decrement
    currentNode = arguments[i];
    if (typeof currentNode !== 'object') {
// @ts-ignore
      currentNode = this.ownerDocument.createTextNode(currentNode);
    } else if (currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
    }
    // the value of "i" below is after the decrement
    if (!i) // if currentNode is the first argument (currentNode === arguments[0])
// @ts-ignore
      parent.replaceChild(currentNode, this);
    else // if currentNode isn't the first
// @ts-ignore
      parent.insertBefore(this.previousSibling, currentNode);
  }
}
if (!Element.prototype.replaceWith)
  Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
  CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith)
  DocumentType.prototype.replaceWith = ReplaceWithPolyfill;
