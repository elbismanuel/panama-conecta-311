import Peer from 'peerjs';
import './control.css';

const $ = id => document.getElementById(id);
const keys = new URLSearchParams(location.hash.slice(1));
const room = keys.get('sala');
const token = keys.get('clave');
const buttons = ['play', 'pause', 'back', 'restart', 'forward'].map($);
let peer, connection, lastState = 0, state, timeout;
function disable(message) {
  buttons.forEach(button => { button.disabled = true; });
  $('status').textContent = message;
}
function connect() {
  clearTimeout(timeout);
  lastState = 0;
  state = null;
  connection?.close();
  connection = null;
  const previous = peer;
  peer = null;
  previous?.destroy();
  if (!/^pc311-[a-f0-9-]{36}$/.test(room || '') || !/^[a-f0-9-]{36}$/.test(token || '')) {
    disable('Abre el enlace o escanea el código desde «Control remoto» en la animación.');
    $('reconnect').hidden = true;
    return;
  }
  disable('Conectando con la pantalla…');
  $('playback').textContent = 'Esperando confirmación de la pantalla';
  const current = peer = new Peer();
  timeout = setTimeout(() => {
    if (peer !== current) return;
    disable('La pantalla no responde. Comprueba que la sesión siga abierta y vuelve a conectar.');
    current.destroy();
  }, 20000);
  current.on('open', () => {
    if (peer !== current) return;
    const channel = connection = current.connect(room, { reliable: true, metadata: { token } });
    channel.on('data', data => {
      if (connection !== channel || data?.type !== 'state' || !Number.isFinite(data.t) || typeof data.playing !== 'boolean') return;
      clearTimeout(timeout);
      lastState = Date.now();
      state = data;
      $('status').textContent = 'Conectado a la pantalla';
      $('time').textContent = String(Math.floor(data.t / 60)).padStart(2, '0') + ':' + String(Math.floor(data.t % 60)).padStart(2, '0');
      $('progress').value = data.t;
      $('playback').textContent = data.t >= 90 ? 'Animación finalizada' : data.playing ? 'Reproduciendo en la pantalla' : 'En pausa';
      buttons.forEach(button => { button.disabled = false; });
      $('play').disabled = data.playing;
      $('pause').disabled = !data.playing;
    });
    const lost = () => {
      if (connection !== channel) return;
      lastState = 0;
      disable('Se perdió la conexión. Pulsa «Volver a conectar».');
      $('playback').textContent = 'Estado de la pantalla desconocido';
    };
    channel.on('close', lost);
    channel.on('error', lost);
  });
  current.on('error', () => {
    if (peer !== current) return;
    clearTimeout(timeout);
    disable('No se pudo conectar. Revisa internet y el enlace de la sesión.');
  });
}
function command(action, value) {
  if (!connection?.open || !state || Date.now() - lastState > 4000) return;
  try { connection.send({ type: 'command', action, value }); }
  catch { disable('Se perdió la conexión. Vuelve a conectar.'); }
}
$('play').onclick = () => command('play');
$('pause').onclick = () => command('pause');
$('restart').onclick = () => command('restart');
$('back').onclick = () => command('seek', state.t - 5);
$('forward').onclick = () => command('seek', state.t + 5);
$('reconnect').onclick = connect;
setInterval(() => {
  if (lastState && Date.now() - lastState > 4000) {
    disable('Sin respuesta reciente. Vuelve a conectar si no se recupera.');
    $('playback').textContent = 'Estado de la pantalla desconocido';
  }
}, 1000);
window.addEventListener('pagehide', () => peer?.destroy());
connect();
