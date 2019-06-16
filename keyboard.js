export default function Keyboard () {
  const states = {}

  const onkeydown = function onkeydown (e) {
    states[e.key] = true
  }
  const onkeyup = function onkeyup (e) {
    states[e.key] = false
  }

  const releaseStates = function releaseStates () {
    for (let key of Object.keys(states)) {
      states[key] = false
    }
  }

  const keyboard = {
    bind: function bind (el) {
      el.addEventListener('keydown', onkeydown)
      el.addEventListener('keyup', onkeyup)
      el.addEventListener('blur', function onblur () {
        releaseStates()
      })
    },
    unbind: function unbind (el) {
      el.removeEventListener('keydown', onkeydown)
      el.removeEventListener('keyup', onkeyup)
      releaseStates()
    },
    getStates: function getStates () {
      return states
    },
    getPressed: function getPressed () {
      const pressed = Object.keys(states).filter(key => states[key])
      return pressed
    }
  }

  return keyboard
}
