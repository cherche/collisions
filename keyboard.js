export default function Keyboard () {
  const states = {}

  const onkeydown = function onkeydown (e) {
    states[e.key] = true
  }
  const onkeyup = function onkeyup (e) {
    states[e.key] = false
  }

  const keyboard = {
    bind: function bind (el) {
      el.addEventListener('keydown', onkeydown)
      el.addEventListener('keyup', onkeyup)
    },
    unbind: function unbind (el) {
      el.removeEventListener('keydown', onkeydown)
      el.removeEventListener('keyup', onkeyup)

      for (let key of Object.keys(states)) {
        states[key] = false
      }
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
