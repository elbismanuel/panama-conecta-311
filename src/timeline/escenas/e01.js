// 01 · 0–8 s · Una necesidad cotidiana
// Placa TL en la ranura PLACA, titular a la derecha, deriva lenta hacia la ciudadana y las bolsas.
export function registrar(P, C) {
  const { M } = C;
  P.k('fondo.luz', [
    [0, [1420, 460, 700, 0.12]],
    [0.8, [1420, 460, 700, 0.35], 'power2.out'],
  ]);
  P.k('placaA.op', [[0.4, 0], [1.6, 1, 'expo.out']]);
  P.k('placaA.z', [[0.4, -200 * M], [1.6, 0, 'expo.out']]);
  P.k('placaA.ry', [[0.4, -3 * M], [1.6, 0, 'expo.out']]);
  // Deriva interna por UV: como máximo 1,035 (nunca a pantalla completa).
  P.k('placaA.zoomTL', [[0, 1.0], [8.4, 1.035]]);
}
