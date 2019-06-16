import Keyboard from './keyboard.js'

const getRandomInt = function getRandomInt (min, max) {
  // Should be inclusive
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

const getRandomRect = function getRandomRect () {
  const div = document.createElement('div')

  const width = getRandomInt(25, 150)
  const height = getRandomInt(25, 75)
  const innerW = window.innerWidth
  const innerH = window.innerHeight
  const x = getRandomInt(0, innerW - width)
  const y = getRandomInt(0, innerH - height)

  const s = div.style
  s.width = width + 'px'
  s.height = height + 'px'
  s.left = x + 'px'
  s.top = y + 'px'

  return {
    width,
    height,
    x,
    y,
    boundingRect: {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height
    },
    el: div
  }
}

// This array is just for debugging
// Only the blocks array is really necessary for collision detection
const divs = []
const blocks = []

const addRandomRect = function addRandomRect () {
  const rect = getRandomRect()
  blocks.push(rect.boundingRect)
  divs.push(rect.el)
  document.body.appendChild(rect.el)
}

for (let i = 0; i < 15; i++) {
  addRandomRect()
}

const player = {
  x: window.innerWidth / 2 - 25,
  y: 0,
  width: 50,
  height: 50,
  getBoundingRect: function getBoundingRect () {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    }
  },
  setBoundingRect: function setBoundingRect ({
    left,
    right,
    top,
    bottom
  }) {
    if (typeof left === 'number') {
      this.x = left
    } else if (typeof right === 'number') {
      this.x = right - this.width
    }

    if (typeof top === 'number') {
      this.y = top
    } else if (typeof bottom === 'number') {
      this.y = bottom - this.height
    }
  }
}
const $player = document.createElement('div')
$player.className = 'player'
document.body.appendChild($player)

const render = function render () {
  const s = $player.style
  const p = player
  s.left = p.x + 'px'
  s.top = p.y + 'px'
  s.width = p.width + 'px'
  s.height = p.height + 'px'
}

const keyboard = new Keyboard()
keyboard.bind(window)

const v = 400
const update = function update (dt) {
  const p = player.getBoundingRect()
  let dx = 0
  let dy = 0

  const states = keyboard.getStates()

  if (states.w) {
    dy--
  }
  if (states.a) {
    dx--
  }
  if (states.s) {
    dy++
  }
  if (states.d) {
    dx++
  }

  // This is a normalization factor (actually just the length of our vector)
  // Consider [dx, dy] = [1, 1]
  // ds = sqrt2
  const ds = Math.sqrt(dx * dx + dy * dy)
  if (ds === 0) return
  dx *= v * dt / ds
  dy *= v * dt / ds

  const g = {
    left: p.left + dx,
    right: p.right + dx,
    top: p.top + dy,
    bottom: p.bottom + dy
  }

  // We'll check for vertical collisions
  if (dy > 0) {
    // Find all the blocks that are below the player
    const below = blocks.filter((b, i) => {
      // This is a tricky condition
      // Consider an opposite question: when is a block in line with the player?
      // That happens when g.left >= b.right || g.right <= b.left
      // (when the player is to the right or left of the block)
      // DeMorgan's laws allow us to flip that
      if (p.bottom <= b.top && (g.left < b.right && g.right > b.left)) {
        // It's unintuitive, but we do not use the ghost to determine collisions
        // This is because using the ghost represents where the player would be,
        // so our ghost would move beyond, we could not find the appropriate top
        // We use it to determine what's in line with the player to avoid
        // noclip if a block is approached at a corner
        divs[i].style.backgroundColor = '#1d63af'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const tops = below.map(block => block.top)
    // Find the top-most
    const bottom = Math.min(g.bottom, ...tops)

    // If our ghost ever puts us below that bound,
    // our position gets pushed right back up
    player.setBoundingRect({ bottom })
  } else if (dy < 0) {
    const above = blocks.filter((b, i) => {
      if (p.top >= b.bottom && (g.left < b.right && g.right > b.left)) {
        divs[i].style.backgroundColor = '#1ba698'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const bottoms = above.map(block => block.bottom)
    const top = Math.max(g.top, ...bottoms)

    player.setBoundingRect({ top })
  }

  // And also check for horizontal collisions
  if (dx > 0) {
    const righter = blocks.filter((b, i) => {
      if (p.right <= b.left && (g.top < b.bottom && g.bottom > b.top)) {
        divs[i].style.backgroundColor = '#e87a00'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const lefts = righter.map(block => block.left)
    // Out of the lefts and our ghost-right, we take the minimum
    const right = Math.min(g.right, ...lefts)
    //       |     We can go to the right because our right is still before
    // [   ] |     the left of that block, so our right bound is our right
    //
    //       |     We can't go to the right because of the left of that block
    //     [ | ]   Our right bound must therefore be the left of that block

    player.setBoundingRect({ right })
  } else if (dx < 0) {
    const righter = blocks.filter((b, i) => {
      if (p.left >= b.right && (g.top < b.bottom && g.bottom > b.top)) {
        divs[i].style.backgroundColor = '#ffcc00'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const rights = righter.map(block => block.right)
    const left = Math.max(g.left, ...rights)

    player.setBoundingRect({ left })
  }
}

let then = Date.now()
const main = function main () {
  const now = Date.now()
  const dt = (now - then) / 1000

  // Pass change in time in seconds
  update(dt)
  render()

  then = now
  requestAnimationFrame(main)
}
main()

window.player = player
