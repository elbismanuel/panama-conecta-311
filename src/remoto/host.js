import Peer from 'peerjs';
import QRCode from 'qrcode';
import estilos from './remoto.css?inline';

// `control` adapta la animación: { getT, reproduciendo, reproducir, pausar, ir }.
// Así sirve desde el código fuente y también inyectado en el HTML ya compilado (window.pc311).
export function crearRemoto({ control }) {
  if (!/^https?:$/.test(location.protocol)) return;
  const style = document.createElement('style');
  style.textContent = estilos;
  document.head.append(style);
  const button = document.createElement('button');
  button.id = 'abrir-remoto';
  button.textContent = 'Control remoto';
  button.title = 'Vincular teléfono';
  const params = new URLSearchParams(location.search);
  if (params.get('ui') !== '0') document.body.append(button);
  const dialog = document.createElement('dialog');
  dialog.className = 'remoto-dialog';
  dialog.innerHTML = `<h2>Control desde tu teléfono</h2>
    <p>Abre este enlace en tu teléfono o escanea el código. Ambos equipos necesitan internet.</p>
    <p class="remote-status" role="status">Control remoto desactivado</p>
    <canvas aria-label="Código de vinculación"></canvas>
    <input class="remote-link" aria-label="Enlace privado del control" readonly hidden>
    <p class="remote-note">El enlace permite controlar esta pantalla. Compártelo solo con quien vaya a presentar. Al recargar la animación cambia la sesión.</p>
    <div class="remote-actions"><button data-start>Activar control</button><button data-copy hidden>Copiar enlace</button><button data-stop hidden>Desconectar teléfono</button><button data-close>Cerrar</button></div>`;
  document.body.append(dialog);
  // Los atajos de la presentación no deben interceptar el diálogo.
  dialog.addEventListener('keydown', e => e.stopPropagation());
  const status = dialog.querySelector('.remote-status');
  const link = dialog.querySelector('input');
  const canvas = dialog.querySelector('canvas');
  const start = dialog.querySelector('[data-start]');
  const stop = dialog.querySelector('[data-stop]');
  const copy = dialog.querySelector('[data-copy]');
  canvas.hidden = true;
  let peer, connection, timer, timeout, token;
  function reset() {
    clearInterval(timer);
    clearTimeout(timeout);
    connection?.close();
    connection = null;
    const previous = peer;
    peer = null;
    previous?.destroy();
    token = null;
    canvas.hidden = link.hidden = copy.hidden = stop.hidden = true;
    link.value = '';
    start.hidden = false;
    start.disabled = false;
    start.textContent = 'Activar control';
    status.textContent = 'Control remoto desactivado';
  }
  function snapshot() {
    return { type: 'state', t: control.getT(), playing: control.reproduciendo(), duration: 90 };
  }
  function send() {
    if (connection?.open) {
      try { connection.send(snapshot()); } catch { /* El cierre actualiza el estado. */ }
    }
  }
  function activate() {
    reset();
    start.disabled = true;
    status.textContent = 'Conectando…';
    token = crypto.randomUUID();
    const current = peer = new Peer('pc311-' + crypto.randomUUID());
    timeout = setTimeout(() => {
      if (peer !== current) return;
      reset();
      status.textContent = 'No se pudo conectar. Comprueba internet y vuelve a activar el control.';
    }, 20000);
    current.on('open', async id => {
      if (peer !== current) return;
      clearTimeout(timeout);
      const url = new URL('./control.html', location.href);
      url.hash = new URLSearchParams({ sala: id, clave: token }).toString();
      link.value = url.href;
      link.hidden = copy.hidden = stop.hidden = false;
      start.hidden = true;
      status.textContent = 'Sesión lista. Abre el enlace en tu teléfono.';
      try {
        await QRCode.toCanvas(canvas, url.href, { width: 240, margin: 2, errorCorrectionLevel: 'M' });
        if (peer === current) canvas.hidden = false;
      } catch { status.textContent = 'Sesión lista. Copia el enlace para vincular el teléfono.'; }
      timer = setInterval(send, 500);
    });
    current.on('connection', incoming => {
      if (peer !== current || incoming.metadata?.token !== token || connection) {
        incoming.on('open', () => incoming.close());
        setTimeout(() => incoming.close(), 1500);
        return;
      }
      connection = incoming;
      const pending = setTimeout(() => {
        if (!incoming.open) {
          incoming.close();
          if (connection === incoming) connection = null;
        }
      }, 15000);
      incoming.on('open', () => {
        clearTimeout(pending);
        status.textContent = 'Teléfono conectado. Ya puedes cerrar este panel.';
        send();
      });
      incoming.on('data', async data => {
        if (connection !== incoming || !data || data.type !== 'command') return;
        switch (data.action) {
          case 'play': control.reproducir(); break;
          case 'pause': control.pausar(); break;
          case 'restart': await control.ir(0); break; // ir() deja la animación en pausa
          case 'seek': {
            if (typeof data.value !== 'number' || !Number.isFinite(data.value)) return;
            const seguir = control.reproduciendo();
            const t = Math.min(90, Math.max(0, data.value));
            await control.ir(t);
            if (seguir && t < 90) control.reproducir();
            break;
          }
          default: return;
        }
        send();
      });
      const disconnected = () => {
        clearTimeout(pending);
        if (connection === incoming) {
          connection = null;
          status.textContent = 'Teléfono desconectado. Puedes volver a abrir el enlace.';
        }
      };
      incoming.on('close', disconnected);
      incoming.on('error', () => { disconnected(); incoming.close(); });
    });
    current.on('disconnected', () => {
      if (peer === current && !current.destroyed) {
        status.textContent = 'Se perdió la conexión de enlace. Intentando reconectar…';
        current.reconnect();
      }
    });
    current.on('error', error => {
      if (peer !== current) return;
      reset();
      status.textContent = 'No se pudo mantener la sesión (' + error.type + '). Vuelve a activar el control.';
    });
  }
  button.onclick = () => dialog.showModal();
  start.onclick = activate;
  stop.onclick = reset;
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(link.value); status.textContent = 'Enlace copiado.'; }
    catch { link.focus(); link.select(); status.textContent = 'Selecciona y copia el enlace.'; }
  };
  window.addEventListener('pagehide', reset);
  if (params.get('remoto') === '1') dialog.showModal();
}
