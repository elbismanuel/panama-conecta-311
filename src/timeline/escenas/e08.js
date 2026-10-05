// 08 · 62–72 s · Del reporte al registro
// Gráfica editorial: Describir → Ubicar → Adjuntar → Registrar (guion, TOMA 08). Nodos 3D,
// iconos y etiquetas en DOM. Sin ✓, sin número de caso, sin mensaje de éxito.
// El rótulo «Representación del flujo» sigue a la opacidad de los nodos (director.js).
export function registrar(P, C) {
  const { M } = C;
  for (let i = 0; i < 4; i++) {
    const ti = 62.6 + 0.5 * i;
    const salida = i < 3 ? [[71.2, 1], [71.9, 0, 'power2.in']] : [[71.2, 1], [72.1, 0, 'power2.inOut']];
    P.k(`nodo${i}.op`, [[ti, 0], [ti + 0.6, 1, 'power2.out'], ...salida]);
    P.k(`nodo${i}.s`, [[ti, 0.9], [ti + 0.6, 1, 'power3.out']]);
    if (i < 3) {
      P.k(`nodo${i}.z`, [[ti, -80 * M], [ti + 0.6, 0, 'power3.out'], [71.2, 0], [72.6, -200 * M, 'power2.in']]);
    } else {
      P.k(`nodo${i}.z`, [
        [ti, -80 * M],
        [ti + 0.6, 0, 'power3.out'],
        [66.9, 0],
        [67.6, 40 * M, 'power3.out'],
        [70.4, 40 * M],
        [71.2, 0, 'power2.inOut'],
      ]);
    }
    P.k(`etq${i}.op`, [[ti + 0.2, 0], [ti + 0.8, 1, 'power2.out'], [71.2, 1], [71.6, 0, 'power2.in']]);
  }
  for (let j = 0; j < 3; j++) P.k(`con${j}.p`, [[63.0 + 0.5 * j, 0], [63.5 + 0.5 * j, 1, 'power2.inOut']]);
  P.k('con.op', [[71.2, 1], [71.6, 0, 'power2.in']]);
  P.k('nodos.dim', [[66.9, 1], [67.6, 0.7, 'power2.inOut'], [71.2, 0.7]]);

  // La luz sigue al anillo de nodo en nodo.
  const luz = (x) => [x, 540, 600, 0.4];
  P.k('fondo.luz', [
    [64.8, luz(360)],
    [65.4, luz(760), 'expo.inOut'],
    [66.0, luz(1160), 'expo.inOut'],
    [66.6, luz(1560), 'expo.inOut'],
    [71.2, luz(1560)],
  ]);
  C.objetivo(64.8, 0.6, { tipo: 'nodo', i: 1, sep: 6 });
  C.objetivo(65.4, 0.6, { tipo: 'nodo', i: 2, sep: 6 });
  C.objetivo(66.0, 0.6, { tipo: 'nodo', i: 3, sep: 6 });
}
