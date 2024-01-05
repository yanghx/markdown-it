// Parse link destination
//

import { unescapeAll } from '../common/utils.mjs'

//diff with parseLinkDestination
//add 转义字符 支持
//Add raw source support 
export default function parseLinkDestination (str, start, max) {
  let code
  let pos = start

  const result = {
    ok: false,
    pos: 0,
    lines: 0,
    str: ''
  }

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++
    while (pos < max) {
      code = str.charCodeAt(pos)
      if (code === 0x0A /* \n */) { return result }
      if (code === 0x3C /* < */) { return result }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1
        result.raw= str.slice(start+1, pos);
        result.str = unescapeAll(result.raw)
        result.ok = true
        return result
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        if ((str.charCodeAt(pos + 1) === 0x27)||(str.charCodeAt(pos + 1) === 0x22)) { 
          pos--;
          break; 
        }
        pos += 2
        continue
      }

      pos++
    }

    // no closing '>'
    return result
  }

  // this should be ... } else { ... branch

  let level = 0
  while (pos < max) {
    code = str.charCodeAt(pos)

    //if (code === 0x20) { break }
    // " '
    if ((code === 0x27)||(code===0x22)) { 
      pos--;
      break; 
    }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      if (str.charCodeAt(pos + 1) === 0x20) { break }
      pos += 2
      continue
    }

    if (code === 0x28 /* ( */) {
      level++
      if (level > 32) { return result }
    }

    if (code === 0x29 /* ) */) {
      if (level === 0) { break }
      level--
    }

    pos++
  }

  if (start === pos) { return result }
  if (level !== 0) { return result }

  result.raw= str.slice(start, pos);
  result.str = unescapeAll(result.raw)
  result.pos = pos
  result.ok = true
  return result
}
