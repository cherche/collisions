import Keyboard from './keyboard.js'

const getRandomInt = function getRandomInt (min, max) {
  // Should be inclusive
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

const getRandomRect = function getRandomRect () {
  const div = document.createElement('div')

  const width = getRandomInt(25, 75)
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
  x: innerWidth / 2 - 25,
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

const v = 300
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
      // Consider an opposite question: when is a block not below the player?
      // That happens with p.left >= b.right || p.right <= b.left
      // DeMorgan's laws allow us to flip that
      if (p.bottom <= b.top && (p.left < b.right && p.right > b.left)) {
        // It's unintuitive, but we do not use the ghost to determine collisions
        // This is because using the ghost represents where the player would be,
        // so our ghost would move beyond, we could not find the appropriate top
        divs[i].style.backgroundColor = '#1d63af'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const tops = below.map(block => block.top)
    // Find the top-most
    const top = Math.min.apply(null, tops)

    // If our ghost ever puts us below that bound,
    // our position gets pushed right back up
    if (g.bottom >= top) {
      player.y = top - 50
    } else {
      player.y = g.top
    }
  } else if (dy < 0) {
    const above = blocks.filter((b, i) => {
      if (p.top >= b.bottom && (p.left < b.right && p.right > b.left)) {
        divs[i].style.backgroundColor = '#1ba698'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const bottoms = above.map(block => block.bottom)
    const bottom = Math.max.apply(null, bottoms)

    if (g.top <= bottom) {
      player.y = bottom
    } else {
      player.y = g.top
    }
  }

  // And also check for horizontal collisions
  if (dx > 0) {
    const righter = blocks.filter((b, i) => {
      if (p.right <= b.left && (p.top < b.bottom && p.bottom > b.top)) {
        divs[i].style.backgroundColor = '#e87a00'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const lefts = righter.map(block => block.left)
    const left = Math.min.apply(null, lefts)

    if (g.right >= left) {
      player.x = left - 50
    } else {
      player.x = g.left
    }
  } else if (dx < 0) {
    const righter = blocks.filter((b, i) => {
      if (p.left >= b.right && (p.top < b.bottom && p.bottom > b.top)) {
        divs[i].style.backgroundColor = '#ffcc00'
        return true
      } else {
        divs[i].style.backgroundColor = 'black'
      }
    })
    const rights = righter.map(block => block.right)
    const right = Math.max.apply(null, rights)

    if (g.left <= right) {
      player.x = right
    } else {
      player.x = g.left
    }
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
