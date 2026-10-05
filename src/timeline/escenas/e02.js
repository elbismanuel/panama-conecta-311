// 02 · 8–16 s · Panamá Conecta en tu mano
// Fundido TL → TR dentro de la placa; el teléfono nace APAGADO sobre el de la foto,
// vuela a su sitio y solo entonces se enciende con la captura real.
export const POSE_02 = [1400, 470, 0, 1, 1, -4, 0]; // x, y, z, escala, rotX°, rotY°, rotZ°

export function registrar(P, C) {
  const { M } = C;
  // Fundido corto (0,25 s) dentro del deslizamiento: no quedan dos personas superpuestas.
  P.k('placaA.mix', [[7.95, 0], [8.2, 1, 'sine.inOut']]);
  P.k('placaA.slideTL', [[7.6, 0], [8.4, 8, 'sine.inOut']]);
  P.k('placaA.slideTR', [[7.6, 0], [8.4, 14, 'sine.inOut'], [11.4, 22]]);
  P.k('placaA.blur', [[9.8, 0], [10.6, 0.6, 'power2.inOut']]);
  P.k('placaA.dim', [[9.8, 1], [10.6, 0.55, 'power2.inOut']]);
  P.k('placaA.z', [[9.8, 0], [10.6, -120 * M, 'power2.inOut']]);
  P.k('placaA.op', [[10.4, 1], [11.4, 0, 'power2.inOut']]);

  P.k('tel.op', [[9.9, 0], [10.2, 1, 'power2.out']]);
  P.k('tel.enc', [[11.2, 0], [11.7, 1, 'power2.out']]);
  // De 9,9 a 11,6 la pose se deriva del calce con la foto (director.js).
  P.k('tel.pose', [[11.6, POSE_02], [15.4, POSE_02]]);

  P.k('fondo.luz', [
    [9.8, [1420, 460, 700, 0.35]],
    [11.6, [1400, 470, 650, 0.5], 'power3.inOut'],
    [15.4, [1400, 470, 650, 0.5]],
  ]);
  P.k('fondo.vineta', [[9.8, 0], [10.6, 1, 'power2.inOut']]);
}
