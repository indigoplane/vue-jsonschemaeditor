
export default  {

    bind: function (el, binding, vnode) {
      //add grip element
      let startOffset = 0, dragging = false
      function resizing(e){
        if (dragging) {
          el.style.width = startOffset + e.pageX + 'px'
        }
      }

      function resizeEnd(e) {
        //console.log('resize end in grip')

        dragging = false
        document.removeEventListener('mousemove', resizing, true)
        document.removeEventListener('mouseup', resizeEnd, true)

      }
      function onmousedown(e) {
        dragging = true
        startOffset = el.offsetWidth - e.pageX
        document.addEventListener('mousemove', resizing, true)
        document.addEventListener('mouseup', resizeEnd, true)

      }

      let grip = document.createElement('div')
      el.appendChild(grip)
      el.style.position = 'relative'
      grip.classList.add('th-grip')

      grip.addEventListener('mousedown', onmousedown)
    },

    unbind: function (el, binding, vnode) {
      el.removeEventListener('mousedown', onmousedown)
    }

  }
