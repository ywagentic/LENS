/* Direct, drag-only flat-screen input. WebXR head tracking stays with A-Frame. */
(function (global) {
  'use strict';
  global.installLensDrag = function ({canvas, controls, enabled, sensitivity = 0.002, direction = 1}) {
    let active = null;
    function stop() {
      const previous = active;
      active = null;
      canvas.style.cursor = '';
      if (previous && canvas.hasPointerCapture(previous.id)) canvas.releasePointerCapture(previous.id);
    }
    function down(event) {
      if (!enabled() || (event.pointerType === 'mouse' && event.button !== 0)) return;
      if (active) { stop(); return; }
      active = {id:event.pointerId, x:event.clientX, y:event.clientY};
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
    function move(event) {
      if (!active || active.id !== event.pointerId) return;
      if (!enabled() || (event.pointerType === 'mouse' && !(event.buttons & 1))) { stop(); return; }
      const dx = event.clientX - active.x;
      const dy = event.clientY - active.y;
      active.x = event.clientX;
      active.y = event.clientY;
      const look = controls();
      if (!look?.yawObject || !look?.pitchObject) { stop(); return; }
      // Positive direction makes the image follow the hand in both axes.
      look.yawObject.rotation.y += dx * sensitivity * direction;
      look.pitchObject.rotation.x += dy * sensitivity * direction;
      const limit = 85 * Math.PI / 180;
      look.pitchObject.rotation.x = Math.max(-limit, Math.min(limit, look.pitchObject.rotation.x));
      event.preventDefault();
    }
    const visibility = () => { if (document.hidden) stop(); };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', stop);
    canvas.addEventListener('pointercancel', stop);
    canvas.addEventListener('lostpointercapture', stop);
    window.addEventListener('pointerup', stop, true);
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', visibility);
    return {stop, remove() {
      stop();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', stop);
      canvas.removeEventListener('pointercancel', stop);
      canvas.removeEventListener('lostpointercapture', stop);
      window.removeEventListener('pointerup', stop, true);
      window.removeEventListener('blur', stop);
      document.removeEventListener('visibilitychange', visibility);
    }};
  };
})(globalThis);
