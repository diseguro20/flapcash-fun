/* ---------------------------------------------------------------------------
   Desbloqueio de áudio no iPhone (modo silencioso).
   No iOS, o botão de silencioso cala o Web Audio (o som sintetizado dos jogos).
   O truque: manter um <audio> tocando um clipe SILENCIOSO em loop, iniciado por
   um toque do usuário. Isso muda a "sessão de áudio" da página pro modo de
   reprodução (o mesmo que faz vídeo tocar no silencioso), e o som do jogo passa
   a sair mesmo com o telefone no silencioso.
   Não faz nada em Android/desktop além de um <audio> mudo tocando �?? inofensivo.
   --------------------------------------------------------------------------- */
(function () {
  var keep = document.createElement('audio');
  keep.setAttribute('playsinline', '');
  keep.setAttribute('webkit-playsinline', '');
  keep.loop = true;
  keep.preload = 'auto';
  keep.src = '/games/silence.mp3';
  keep.volume = 1;                                  // é silêncio de verdade; volume não importa
  keep.style.display = 'none';
  /* precisa estar no documento pra o iOS trocar a sessão de áudio de forma
     confiável (elemento solto às vezes não conta) */
  (document.body || document.documentElement).appendChild(keep);

  var armed = false;
  function unlock() {
    // segura a sessão de áudio "de reprodução"
    var p = keep.play();
    if (p && p.catch) p.catch(function () {});
    // retoma o AudioContext do jogo, se já existir (o SND expõe em window.__actx)
    try { if (window.__actx && window.__actx.state === 'suspended') window.__actx.resume(); } catch (e) {}
  }

  ['pointerdown', 'touchend', 'mousedown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, unlock, { passive: true });
  });

  /* Se a aba volta do segundo plano, o iOS costuma suspender o áudio �??
     retoma o loop pra não perder a sessão. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { var p = keep.play(); if (p && p.catch) p.catch(function () {}); }
  });
})();

