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

for (let i = 0; i < 25; i++) {
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

/*
const mouse = {
  x: 100,
  y: 500
}

document.body.addEventListener('mousemove', function onmousemove (e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
*/

const v = 200

const update = function update (dt) {
  const pRect = player.getBoundingRect()
  const potY = player.y + v * dt

  // Find all the blocks that are below the player
  const below = blocks.filter(({ top, left, right }, i) => {
    if (pRect.bottom <= top && (pRect.left < right && pRect.right > left)) {
      divs[i].style.backgroundColor = '#1d63af'
      return true
    } else {
      divs[i].style.backgroundColor = 'black'
    }
    /*
    // Obvious, it has to be below us
    return pRect.bottom < top &&
      // This is a tricky condition
      // Consider an opposite question: when is a block not below the player?
      // That happens with pRect.left >= right || pRect.right <= left
      // DeMorgan's laws allow us to flip that
      (pRect.left < right && pRect.right > left)
    */
  })
  const tops = below.map(block => block.top)
  // Find the top-most
  const top = Math.min.apply(null, tops)

  // If our potY ever puts us below that bound,
  // our position gets pushed right back up
  if (potY + 50 >= top) {
    player.y = top - 50
  } else {
    player.y = potY
  }
  /*
  const dx = mouse.x - player.x
  const dy = mouse.y - player.y
  if (dx === 0 && dy === 0) return

  const playerRect = player.getBoundingRect()
  if (dx < 0) {
    console.log('moving left')
    const rights = blocks.map(block => block.right)
    const risks = rights.filter(right => right > playerRect.left)
    const max = Math.min.apply(null, risks)
    console.log('max', max)
    console.log('mouse.x:', mouse.x)
    if (mouse.x < max) {
      console.log(' made it')
      player.x = max
    } else {
      player.x = mouse.x
    }
  }

  player.x = mouse.x
  player.y = mouse.y
  */

  /*
  const vx = mouse.x - player.x
  const vy = mouse.y - player.y
  console.log(vx, vy)
  // Normalization factor for our vector (but actually with length 25)
  const n = Math.sqrt(vx * vx + vy * vy)
  if (n === 0) return
  player.x += Math.round(350 * vx * dt / n)
  player.y += Math.round(350 * vy * dt / n)
  console.log(player.x, player.y)
  */
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
window.main = main

window.player = player
//window.mouse = mouse
