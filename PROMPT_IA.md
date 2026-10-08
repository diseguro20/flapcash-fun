# 🚀 PROMPT DE EXECUÇÃO PARA CODING AGENT (Antigravity / Cursor / Codex)

> **ATENÇÃO IA:** Você está trabalhando diretamente na pasta onde os arquivos da plataforma clonada foram baixados e extraídos.

### 📁 Estrutura de Arquivos no seu Workspace:
- **`./index.html`**: Landing page / visualizador principal 100% renderizável offline.
- **`./paginas/`**: Páginas individuais do sistema (`painel.html`, `jogar.html`, `categoria.html`, etc.).
- **`./imagens/`**: Todas as imagens, banners, logos e ícones originais em formato `.webp` leve.
- **`./catalogo_produtos.json`**: Dados estruturados de produtos, apostas ou itens mapeados.
- **`./sitemap.txt`**: Todas as rotas do projeto.

## 🎯 SUA TAREFA:
Construa a aplicação completa em **Next.js / React + Tailwind CSS (Full-Stack Pixel Perfect)** com **100% de fidelidade visual, estrutural e funcional**:

1. **🔗 Use os Assets Locais**: Carregue as logos, banners e ícones diretamente de `./imagens/*.webp`.
2. **📐 Design System e Temas**: Preserve a paleta escura (cyber dark / navy neon), glassmorphism, sombras brilhantes e fontes.
3. **📱 Navegação & Modais**: Implemente todas as rotas e sheets deslizantes (`Depositar`, `Sacar`, `Indicar`, `Perfil`, `Instalar App`).

### 🎮 Arquitetura da Plataforma Interativa:
- **Landing Page (`/`)**: Hero com título em gradiente, banner flutuante, botão CTA ("Jogar agora" / "Já tenho conta"), contador online dinâmico, estatísticas em tempo real, mini-tabuleiro animado e carrossel de como jogar.
- **Painel do Usuário (`/painel`)**: Topbar com saldo (real vs bônus + barra de rollover), card de aposta com chips de entrada rápida, seletor de recompensa e barra de navegação inferior com sheets modais (PIX Copia e Cola, chave PIX para saque, links de afiliados N1/N2/N3).
- **Motor do Jogo (`/jogar`)**: Tabuleiro 8×8, bandeja de 3 peças aleatórias, mecânica de arrastar/encaixar blocos, detecção de linhas e colunas completas com explosão de partículas, multiplicador de pontuação e botão de resgate (Cashout).

| Métrica da Plataforma | Valor |
|---|---|
| **URL de Origem** | https://flapcash.fun |
| **Páginas Capturadas** | 12 páginas em `./paginas/` |
| **Assets e Imagens** | 7 arquivos em `./imagens/` |
| **Framework Recomendado** | Next.js / React + Tailwind CSS (Full-Stack Pixel Perfect) |

## 📐 Design System Global Extraído

### Paleta de Cores da Interface
rgb(234, 245, 238), rgba(6, 18, 10, 0.525), rgb(4, 22, 11), rgb(34, 197, 94), rgb(5, 13, 8), rgb(247, 201, 72), rgb(207, 230, 216), rgb(185, 212, 198), rgb(205, 191, 230), rgb(143, 174, 158), rgb(220, 239, 228), rgb(220, 236, 227), rgb(4, 10, 6), rgb(203, 224, 212), rgb(207, 227, 215), rgba(0, 0, 0, 0.28), rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.055), rgba(6, 18, 10, 0.69), rgba(6, 18, 10, 0.627)

### Tipografia Global
Montserrat, system-ui, sans-serif, Arial, Montserrat, sans-serif

---

## 🗺️ Rotas e Abas Capturadas
- https://flapcash.fun/
- https://flapcash.fun/painel
- https://flapcash.fun/jogar
- https://flapcash.fun/?p=entrar&tab=cadastro
- https://flapcash.fun/?p=entrar
- https://flapcash.fun/?p=demo
- https://flapcash.fun/?p=responsavel
- https://flapcash.fun/?p=privacidade
- https://flapcash.fun/?p=termos
- https://flapcash.fun/?p=faq
- https://flapcash.fun/?p=suporte
- https://flapcash.fun/?p=esqueci

---

## 🏗️ Código HTML da Página Principal

```html
<html lang="pt-BR" class=" js"><head><style>body {transition: opacity ease-in 0.2s; } 
body[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } 
</style>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>flapcash — jogue e ganhe via PIX</title>
<meta name="description" content="flapcash: jogue Flappy Bird, bata a meta e saque via PIX na hora.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,600&amp;display=swap" rel="stylesheet">
<script>document.documentElement.className+=" js"</script>
<style>
 *{margin:0;padding:0;box-sizing:border-box;touch-action:manipulation}
 /* --green/--bg/--panel/--txt são sobrescritos pelo tenant_theme_head — não renomear.
    --s1/--s2 são as "superfícies": substituem as bordas na separação dos blocos. */
 :root{--green:#22c55e;--greenD:#16a34a;--greenRGB:34,197,94;--yellow:#f7c948;--bg:#050d08;--panel:#0b1a11;--txt:#eaf5ee;--mut:#8fae9e;--line:rgba(var(--greenRGB),.16);
   --s1:rgba(255,255,255,.035);--s2:rgba(255,255,255,.06);--sh:0 20px 48px -20px rgba(0,0,0,.9)}
 html{scroll-behavior:smooth}
 body{font-family:'Montserrat',system-ui,sans-serif;background:var(--bg);color:var(--txt);-webkit-font-smoothing:antialiased;overflow-x:hidden}
 a{text-decoration:none;color:inherit}
 img{max-width:100%;display:block}
 ::selection{background:var(--green);color:#04160b}
 :focus-visible{outline:2px solid var(--green);outline-offset:3px}
 .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
 .eyebrow{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--mut)}
 .btn{display:inline-flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;border-radius:999px;cursor:pointer;border:0;
   transition:background-color .18s,transform .18s,box-shadow .18s,color .18s}
 .btn-g{background:linear-gradient(180deg,var(--green),var(--greenD));color:#04160b;padding:12px 26px;font-size:14px;
   box-shadow:0 8px 22px -10px rgba(var(--greenRGB),.9),inset 0 1px 0 rgba(255,255,255,.35)}
 .btn-g:hover{background:linear-gradient(180deg,var(--green),var(--greenD));transform:translateY(-1px);box-shadow:0 14px 30px -10px rgba(var(--greenRGB),1)}
 /* "Entrar" = contorno verde (igual o do concorrente), não caixa cinza */
 .btn-o{background:transparent;color:var(--green);border:1.6px solid rgba(var(--greenRGB),.55);padding:11px 24px;font-size:14px}
 .btn-o:hover{background:rgba(var(--greenRGB),.12);border-color:var(--green);color:#eafff1;transform:translateY(-1px)}

 /* ---------- topo (sem traço: só o blur separa) ---------- */
 /* barra do topo: efeito de vidro SEMPRE. Pra isso o herói é puxado pra cima
    (--navh) e o cenário desfocado passa por trás dela — sem isso o vidro
    borraria o preto da página e a barra ficaria chapada no topo. */
 :root{--navh:66px}
 .nav{position:sticky;top:0;z-index:50;background:rgba(6,18,10,.14);
   backdrop-filter:blur(12px) saturate(1.25);-webkit-backdrop-filter:blur(12px) saturate(1.25);
   transition:background-color .25s}
 .nav.solid{background:rgba(6,18,10,.8)}
 .nav .in{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}
 /* espaço da logo à esquerda: some se o site não subiu logo (fica só o vazio) */
 .nav .brand{display:flex;align-items:center;min-height:38px;min-width:40px}
 .nav .brand img{max-height:38px;width:auto;object-fit:contain}
 .nav .actions{display:flex;gap:10px;flex-shrink:0}

 /* ---------- herói ---------- */
 /* sobe atrás da barra (margem negativa) e devolve o espaço no padding, pro
    cenário desfocado chegar até o topo da tela e a barra ter o que borrar */
 .hero{position:relative;text-align:center;margin-top:calc(var(--navh) * -1);
   padding:calc(var(--navh) + 18px) 20px 76px;overflow:hidden;background:var(--bg)}
 /* fundo = o próprio cenário do jogo, desfocado. A escala evita a borda
    transparente que o blur cria nas beiradas. */
 /* especificidade maior que a do `.hero>*` lá embaixo — senão ele vira
    position:relative e o fundo colapsa pra altura 0 */
 .hero>.heroBg{position:absolute;inset:0;z-index:0;overflow:hidden}
 .heroBg svg,.heroBg img{position:absolute;top:-8%;left:-8%;width:116%;height:116%;filter:blur(26px) saturate(1.15)}
 .heroBg img{object-fit:cover}
 /* véu por cima: escurece o suficiente pro texto ler, mas deixa o cenário aparecer.
    A camada verde puxa o fundo pra identidade da marca. */
 .heroBg::after{content:"";position:absolute;inset:0;
   background:linear-gradient(180deg,rgba(4,14,8,.62),rgba(4,14,8,.42) 38%,rgba(5,13,8,.88) 88%,var(--bg)),
              radial-gradient(900px 520px at 50% 40%,rgba(10,60,32,.35),rgba(4,12,7,.72) 75%)}
 .hero::before{content:"";position:absolute;inset:0;z-index:1;background-image:radial-gradient(rgba(255,255,255,.05) 1.2px,transparent 1.3px);background-size:26px 26px;
   -webkit-mask-image:linear-gradient(180deg,transparent,#000 28%,#000 70%,transparent);mask-image:linear-gradient(180deg,transparent,#000 28%,#000 70%,transparent)}
 .hero>*{position:relative;z-index:2}
 .sparks{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
 .sparks i{position:absolute;bottom:-12px;border-radius:50%;background:var(--green);opacity:0;animation:rise linear infinite;will-change:transform,opacity}
 @keyframes rise{0%{transform:translateY(0) scale(.7);opacity:0}12%{opacity:.7}100%{transform:translateY(-78vh) scale(1.1);opacity:0}}
 .pill{display:inline-flex;align-items:center;gap:10px;background:var(--s1);color:#cfe6d8;font-weight:700;font-size:13.5px;padding:9px 18px;border-radius:999px}
 .pill b{font-weight:900;color:var(--txt);font-variant-numeric:tabular-nums}
 .pill .dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(var(--greenRGB),.18);animation:blink 2s ease-in-out infinite}
 @keyframes blink{50%{opacity:.3}}
 h1{font-size:clamp(38px,10vw,68px);line-height:.95;font-weight:900;letter-spacing:-.015em;margin:22px 0 16px}
 h1 .y{color:var(--yellow)}h1 .g{color:var(--green)}h1 .w{color:#fff}
 .sub{max-width:520px;margin:0 auto;color:#b9d4c6;font-weight:600;font-size:clamp(15px,3.4vw,17.5px);line-height:1.55;text-wrap:pretty}
 .sub b{color:var(--yellow);font-weight:800}
 .mascotwrap{position:relative;width:190px;height:152px;margin:10px auto 2px;display:grid;place-items:center}
 .mascotwrap::before{content:"";position:absolute;inset:4px 10px;border-radius:50%;background:radial-gradient(circle,rgba(var(--greenRGB),.3),transparent 66%);animation:breathe 4s ease-in-out infinite}
 @keyframes breathe{50%{transform:scale(1.06)}}
 .mascotwrap .mfruit img{width:96px}
 .mascotwrap .mfruit img+img{margin-left:-16px}
 .mascotwrap svg,.mascotwrap img{position:relative;width:156px;height:auto;filter:drop-shadow(0 16px 32px rgba(0,0,0,.55))}
 /* voo do mascote: sobe/desce de leve com uma inclinadinha, como se planasse.
    Mira só nos filhos DIRETOS — as metades da melancia (fruit) têm rotate
    inline e uma animação de transform aqui apagaria o giro delas. */
 @keyframes voa{0%,100%{transform:translateY(0) rotate(-1.4deg)}50%{transform:translateY(-11px) rotate(1.4deg)}}
 .mascotwrap>svg,.mascotwrap>img,.mascotwrap>.mfruit{animation:voa 3.2s ease-in-out infinite;will-change:transform}
 @media(prefers-reduced-motion:reduce){.mascotwrap>svg,.mascotwrap>img,.mascotwrap>.mfruit{animation:none}}
 /* faixa "jogue valendo": mesma mensagem de antes, agora em superfície e não em caixa com traço */
 .lock{display:inline-flex;align-items:center;background:var(--s1);color:#cdbfe6;font-weight:800;font-size:12.5px;padding:10px 20px;border-radius:999px;margin:6px 0 20px}
 /* CTA: pulsa de leve o tempo todo + halo respirando, pra puxar o olho */
 .ctawrap{display:flex;flex-direction:column;align-items:center;gap:22px;margin-top:4px}
 .play{position:relative;font-size:17.5px;padding:19px 56px;letter-spacing:.03em;
   box-shadow:0 16px 40px -14px rgba(var(--greenRGB),.75);animation:ctapulse 2.4s ease-in-out infinite;will-change:transform}
 .play::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:2px solid rgba(var(--greenRGB),.55);
   animation:ctahalo 2.4s ease-out infinite;pointer-events:none}
 .play:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 24px 56px -14px rgba(var(--greenRGB),.95);animation-play-state:paused}
 @keyframes ctapulse{50%{transform:scale(1.045);box-shadow:0 22px 52px -12px rgba(var(--greenRGB),.95)}}
 @keyframes ctahalo{0%{opacity:.75;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.22)}}
 @media(prefers-reduced-motion:reduce){.play,.play::after{animation:none}}
 .have{display:inline-block;color:var(--mut);font-weight:700;font-size:13.5px;transition:color .18s}
 .have:hover{color:var(--txt)}
 /* linha de confiança: virou selo com check, pra dar peso ao que convence */
 /* selos empilhados, todos do MESMO tamanho (nada de quebrar 2+1 aleatório) */
 .trust{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:34px}
 .trust span{display:flex;align-items:center;justify-content:center;gap:9px;width:min(340px,100%);
   background:rgba(255,255,255,.055);
   border:1px solid rgba(var(--greenRGB),.28);color:#dcefe4;font-weight:800;font-size:13px;
   padding:12px 20px;border-radius:999px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
   box-shadow:0 8px 22px -14px rgba(0,0,0,.9)}
 .trust span svg{width:16px;height:16px;flex:none;color:var(--green);stroke:currentColor;fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}

 /* ---------- números ---------- */
 .stats{background:linear-gradient(180deg,rgba(255,255,255,.032),transparent);padding:52px 0 56px}
 .statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center}
 /* nowrap: "R$" nunca fica sozinho numa linha e o valor na de baixo */
 .stat .n{font-size:clamp(24px,5.4vw,44px);font-weight:900;color:var(--yellow);font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1;white-space:nowrap}
 .stat .l{color:var(--mut);font-weight:800;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;margin-top:10px}

 /* ---------- seções ---------- */
 .sec{padding:76px 0}
 .sec h2{text-align:center;font-weight:900;font-size:clamp(28px,5.4vw,46px);letter-spacing:-.03em;line-height:1;text-wrap:balance}
 .sec h2 .g{color:var(--green)}
 .sec .s{text-align:center;color:var(--mut);font-weight:600;font-size:15px;margin:16px auto 0;max-width:500px;line-height:1.6}
 .sechd{margin-bottom:44px;text-align:center}
 .sechd .eyebrow{display:block;margin-bottom:14px}

 /* ---------- como jogar (arte em cima, texto embaixo — bloco grande no mobile) ---------- */
 .sechd h2.hj{display:flex;align-items:center;justify-content:center;gap:12px;text-transform:uppercase;letter-spacing:-.01em}
 .sechd h2.hj svg{width:1.05em;height:1.05em;flex:none;fill:var(--green)}
 .steps{display:grid;grid-template-columns:1fr;gap:18px}
 .step{background:var(--s1);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:10px 10px 4px;
   box-shadow:var(--sh);transition:transform .28s ease,border-color .28s ease,background-color .28s ease}
 .step:hover{transform:translateY(-4px);background:var(--s2);border-color:rgba(var(--greenRGB),.34)}
 .step .art{position:relative;aspect-ratio:4/3;background:rgba(0,0,0,.28);border-radius:14px;overflow:hidden}
 .step .art svg,.step .art img{width:100%;height:100%;object-fit:cover;display:block}
 /* selo do número (só no desenho padrão — arte enviada já traz o número) */
 .step .art .badge{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;
   display:flex;align-items:center;justify-content:center;background:var(--green);color:#04160b;
   font-weight:900;font-size:15px;box-shadow:0 6px 16px -6px rgba(0,0,0,.9)}
 .step .tx{padding:18px 14px 20px}
 .step h3{font-size:17.5px;font-weight:800;letter-spacing:-.01em}
 .step p{color:var(--mut);font-weight:600;font-size:14.5px;line-height:1.6;margin-top:10px}
 .stepscta{display:flex;justify-content:center;margin-top:36px}

 /* ---------- depoimentos ---------- */
 .voices{display:grid;grid-template-columns:1fr;gap:18px}
 .voice{background:var(--s1);border-radius:22px;padding:30px 28px;box-shadow:var(--sh);display:flex;flex-direction:column}
 .voice .stars{display:flex;gap:3px;margin-bottom:14px}
 .voice .stars svg{width:17px;height:17px;fill:#fbbf24;flex:none}
 .voice q{display:block;font-weight:600;color:#dcece3;line-height:1.65;font-size:15.5px;flex:1;quotes:'\201C' '\201D'}
 .voice q::before{content:open-quote;color:var(--green);font-size:34px;font-weight:900;line-height:0;vertical-align:-6px;margin-right:3px}
 .voice q::after{content:no-close-quote}
 .voice .who{margin-top:24px}
 .voice .nm{font-weight:800;font-size:14.5px}
 .voice .vf{color:var(--mut);font-weight:700;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;margin-top:5px}

 /* ---------- chamada final ---------- */
 .cta{position:relative;text-align:center;padding:88px 20px 96px;overflow:hidden;
   background:radial-gradient(760px 380px at 50% 118%,rgba(var(--greenRGB),.22),transparent 64%)}
 .cta h2{font-weight:900;font-size:clamp(28px,5.6vw,48px);letter-spacing:-.03em;line-height:1;text-wrap:balance}
 .cta p{color:var(--mut);font-weight:600;font-size:15px;margin:18px auto 34px;max-width:440px;line-height:1.6}

 /* ---------- rodapé (tom, não traço) ---------- */
 footer{background:#040a06;padding:58px 0 62px}
 footer .fb{font-weight:900;color:var(--green);font-size:19px;margin-bottom:18px;display:flex}
 footer .cp{color:#cbe0d4;font-weight:700;font-size:13.5px}
 footer .dis{color:var(--mut);font-weight:600;font-size:12.5px;line-height:1.7;margin-top:14px;max-width:640px}
 .fcols{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:40px;max-width:520px}
 .fcols h4{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);margin-bottom:16px}
 .fcols a{display:block;color:#cfe3d7;font-weight:700;font-size:13.5px;padding:6px 0;transition:color .18s}
 .fcols a:hover{color:var(--green)}

 /* aparecer ao rolar */
 .js .rv{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}
 .js .rv.in{opacity:1;transform:none}

 @media(min-width:720px){
   .steps{grid-template-columns:1fr 1fr;gap:22px}
   .voices{grid-template-columns:repeat(3,1fr)}
   .hero{padding:calc(var(--navh) + 22px) 20px 84px}
   .statgrid{gap:32px}
 }
 /* desktop: os 4 passos lado a lado, igual o concorrente */
 @media(min-width:1000px){
   .steps{grid-template-columns:repeat(4,1fr);gap:20px}
   .step .art{aspect-ratio:3/2}
   .step .tx{padding:16px 12px 18px}
   .step h3{font-size:16.5px}
   .step p{font-size:13.5px}
 }
 /* em tela estreita não cabem 3 lado a lado sem espremer: vira 2 em cima e
    1 embaixo ocupando a linha inteira (igual o concorrente) */
 @media(max-width:760px){
   .statgrid{grid-template-columns:1fr 1fr;gap:26px 16px}
   .statgrid .stat:last-child{grid-column:1 / -1}
 }
 @media(max-width:520px){
   .trust{gap:10px;font-size:12px}
 }
 @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}
</style><style data-site-cloner-inlined="true">
body {transition: opacity ease-in 0.2s; } 
body[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } 



 *{margin:0;padding:0;box-sizing:border-box;touch-action:manipulation}
 /* --green/--bg/--panel/--txt são sobrescritos pelo tenant_theme_head — não renomear.
    --s1/--s2 são as "superfícies": substituem as bordas na separação dos blocos. */
 :root{--green:#22c55e;--greenD:#16a34a;--greenRGB:34,197,94;--yellow:#f7c948;--bg:#050d08;--panel:#0b1a11;--txt:#eaf5ee;--mut:#8fae9e;--line:rgba(var(--greenRGB),.16);
   --s1:rgba(255,255,255,.035);--s2:rgba(255,255,255,.06);--sh:0 20px 48px -20px rgba(0,0,0,.9)}
 html{scroll-behavior:smooth}
 body{font-family:'Montserrat',system-ui,sans-serif;background:var(--bg);color:var(--txt);-webkit-font-smoothing:antialiased;overflow-x:hidden}
 a{text-decoration:none;color:inherit}
 img{max-width:100%;display:block}
 ::selection{background:var(--green);color:#04160b}
 :focus-visible{outline:2px solid var(--green);outline-offset:3px}
 .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
 .eyebrow{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--mut)}
 .btn{display:inline-flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;border-radius:999px;cursor:pointer;border:0;
   transition:background-color .18s,transform .18s,box-shadow .18s,color .18s}
 .btn-g{background:linear-gradient(180deg,var(--green),var(--greenD));color:#04160b;padding:12px 26px;font-size:14px;
   box-shadow:0 8px 22px -10px rgba(var(--greenRGB),.9),inset 0 1px 0 rgba(255,255,255,.35)}
 .btn-g:hover{background:linear-gradient(180deg,var(--green),var(--greenD));transform:translateY(-1px);box-shadow:0 14px 30px -10px rgba(var(--greenRGB),1)}
 /* "Entrar" = contorno verde (igual o do concorrente), não caixa cinza */
 .btn-o{background:transparent;color:var(--green);border:1.6px solid rgba(var(--greenRGB),.55);padding:11px 24px;font-size:14px}
 .btn-o:hover{background:rgba(var(--greenRGB),.12);border-color:var(--green);color:#eafff1;transform:translateY(-1px)}

 /* ---------- topo (sem traço: só o blur separa) ---------- */
 /* barra do topo: efeito de vidro SEMPRE. Pra isso o herói é puxado pra cima
    (--navh) e o cenário desfocado passa por trás dela — sem isso o vidro
    borraria o preto da página e a barra ficaria chapada no topo. */
 :root{--navh:66px}
 .nav{position:sticky;top:0;z-index:50;background:rgba(6,18,10,.14);
   backdrop-filter:blur(12px) saturate(1.25);-webkit-backdrop-filter:blur(12px) saturate(1.25);
   transition:background-color .25s}
 .nav.solid{background:rgba(6,18,10,.8)}
 .nav .in{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px}
 /* espaço da logo à esquerda: some se o site não subiu logo (fica só o vazio) */
 .nav .brand{display:flex;align-items:center;min-height:38px;min-width:40px}
 .nav .brand img{max-height:38px;width:auto;object-fit:contain}
 .nav .actions{display:flex;gap:10px;flex-shrink:0}

 /* ---------- herói ---------- */
 /* sobe atrás da barra (margem negativa) e devolve o espaço no padding, pro
    cenário desfocado chegar até o topo da tela e a barra ter o que borrar */
 .hero{position:relative;text-align:center;margin-top:calc(var(--navh) * -1);
   padding:calc(var(--navh) + 18px) 20px 76px;overflow:hidden;background:var(--bg)}
 /* fundo = o próprio cenário do jogo, desfocado. A escala evita a borda
    transparente que o blur cria nas beiradas. */
 /* especificidade maior que a do `.hero>*` lá embaixo — senão ele vira
    position:relative e o fundo colapsa pra altura 0 */
 .hero>.heroBg{position:absolute;inset:0;z-index:0;overflow:hidden}
 .heroBg svg,.heroBg img{position:absolute;top:-8%;left:-8%;width:116%;height:116%;filter:blur(26px) saturate(1.15)}
 .heroBg img{object-fit:cover}
 /* véu por cima: escurece o suficiente pro texto ler, mas deixa o cenário aparecer.
    A camada verde puxa o fundo pra identidade da marca. */
 .heroBg::after{content:"";position:absolute;inset:0;
   background:linear-gradient(180deg,rgba(4,14,8,.62),rgba(4,14,8,.42) 38%,rgba(5,13,8,.88) 88%,var(--bg)),
              radial-gradient(900px 520px at 50% 40%,rgba(10,60,32,.35),rgba(4,12,7,.72) 75%)}
 .hero::before{content:"";position:absolute;inset:0;z-index:1;background-image:radial-gradient(rgba(255,255,255,.05) 1.2px,transparent 1.3px);background-size:26px 26px;
   -webkit-mask-image:linear-gradient(180deg,transparent,#000 28%,#000 70%,transparent);mask-image:linear-gradient(180deg,transparent,#000 28%,#000 70%,transparent)}
 .hero>*{position:relative;z-index:2}
 .sparks{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
 .sparks i{position:absolute;bottom:-12px;border-radius:50%;background:var(--green);opacity:0;animation:rise linear infinite;will-change:transform,opacity}
 @keyframes rise{0%{transform:translateY(0) scale(.7);opacity:0}12%{opacity:.7}100%{transform:translateY(-78vh) scale(1.1);opacity:0}}
 .pill{display:inline-flex;align-items:center;gap:10px;background:var(--s1);color:#cfe6d8;font-weight:700;font-size:13.5px;padding:9px 18px;border-radius:999px}
 .pill b{font-weight:900;color:var(--txt);font-variant-numeric:tabular-nums}
 .pill .dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(var(--greenRGB),.18);animation:blink 2s ease-in-out infinite}
 @keyframes blink{50%{opacity:.3}}
 h1{font-size:clamp(38px,10vw,68px);line-height:.95;font-weight:900;letter-spacing:-.015em;margin:22px 0 16px}
 h1 .y{color:var(--yellow)}h1 .g{color:var(--green)}h1 .w{color:#fff}
 .sub{max-width:520px;margin:0 auto;color:#b9d4c6;font-weight:600;font-size:clamp(15px,3.4vw,17.5px);line-height:1.55;text-wrap:pretty}
 .sub b{color:var(--yellow);font-weight:800}
 .mascotwrap{position:relative;width:190px;height:152px;margin:10px auto 2px;display:grid;place-items:center}
 .mascotwrap::before{content:"";position:absolute;inset:4px 10px;border-radius:50%;background:radial-gradient(circle,rgba(var(--greenRGB),.3),transparent 66%);animation:breathe 4s ease-in-out infinite}
 @keyframes breathe{50%{transform:scale(1.06)}}
 .mascotwrap .mfruit img{width:96px}
 .mascotwrap .mfruit img+img{margin-left:-16px}
 .mascotwrap svg,.mascotwrap img{position:relative;width:156px;height:auto;filter:drop-shadow(0 16px 32px rgba(0,0,0,.55))}
 /* voo do mascote: sobe/desce de leve com uma inclinadinha, como se planasse.
    Mira só nos filhos DIRETOS — as metades da melancia (fruit) têm rotate
    inline e uma animação de transform aqui apagaria o giro delas. */
 @keyframes voa{0%,100%{transform:translateY(0) rotate(-1.4deg)}50%{transform:translateY(-11px) rotate(1.4deg)}}
 .mascotwrap>svg,.mascotwrap>img,.mascotwrap>.mfruit{animation:voa 3.2s ease-in-out infinite;will-change:transform}
 @media(prefers-reduced-motion:reduce){.mascotwrap>svg,.mascotwrap>img,.mascotwrap>.mfruit{animation:none}}
 /* faixa "jogue valendo": mesma mensagem de antes, agora em superfície e não em caixa com traço */
 .lock{display:inline-flex;align-items:center;background:var(--s1);color:#cdbfe6;font-weight:800;font-size:12.5px;padding:10px 20px;border-radius:999px;margin:6px 0 20px}
 /* CTA: pulsa de leve o tempo todo + halo respirando, pra puxar o olho */
 .ctawrap{display:flex;flex-direction:column;align-items:center;gap:22px;margin-top:4px}
 .play{position:relative;font-size:17.5px;padding:19px 56px;letter-spacing:.03em;
   box-shadow:0 16px 40px -14px rgba(var(--greenRGB),.75);animation:ctapulse 2.4s ease-in-out infinite;will-change:transform}
 .play::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:2px solid rgba(var(--greenRGB),.55);
   animation:ctahalo 2.4s ease-out infinite;pointer-events:none}
 .play:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 24px 56px -14px rgba(var(--greenRGB),.95);animation-play-state:paused}
 @keyframes ctapulse{50%{transform:scale(1.045);box-shadow:0 22px 52px -12px rgba(var(--greenRGB),.95)}}
 @keyframes ctahalo{0%{opacity:.75;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.22)}}
 @media(prefers-reduced-motion:reduce){.play,.play::after{animation:none}}
 .have{display:inline-block;color:var(--mut);font-weight:700;font-size:13.5px;transition:color .18s}
 .have:hover{color:var(--txt)}
 /* linha de confiança: virou selo com check, pra dar peso ao que convence */
 /* selos empilhados, todos do MESMO tamanho (nada de quebrar 2+1 aleatório) */
 .trust{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:34px}
 .trust span{display:flex;align-items:center;justify-content:center;gap:9px;width:min(340px,100%);
   background:rgba(255,255,255,.055);
   border:1px solid rgba(var(--greenRGB),.28);color:#dcefe4;font-weight:800;font-size:13px;
   padding:12px 20px;border-radius:999px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
   box-shadow:0 8px 22px -14px rgba(0,0,0,.9)}
 .trust span svg{width:16px;height:16px;flex:none;color:var(--green);stroke:currentColor;fill:none;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}

 /* ---------- números ---------- */
 .stats{background:linear-gradient(180deg,rgba(255,255,255,.032),transparent);padding:52px 0 56px}
 .statgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center}
 /* nowrap: "R$" nunca fica sozinho numa linha e o valor na de baixo */
 .stat .n{font-size:clamp(24px,5.4vw,44px);font-weight:900;color:var(--yellow);font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1;white-space:nowrap}
 .stat .l{color:var(--mut);font-weight:800;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;margin-top:10px}

 /* ---------- seções ---------- */
 .sec{padding:76px 0}
 .sec h2{text-align:center;font-weight:900;font-size:clamp(28px,5.4vw,46px);letter-spacing:-.03em;line-height:1;text-wrap:balance}
 .sec h2 .g{color:var(--green)}
 .sec .s{text-align:center;color:var(--mut);font-weight:600;font-size:15px;margin:16px auto 0;max-width:500px;line-height:1.6}
 .sechd{margin-bottom:44px;text-align:center}
 .sechd .eyebrow{display:block;margin-bottom:14px}

 /* ---------- como jogar (arte em cima, texto embaixo — bloco grande no mobile) ---------- */
 .sechd h2.hj{display:flex;align-items:center;justify-content:center;gap:12px;text-transform:uppercase;letter-spacing:-.01em}
 .sechd h2.hj svg{width:1.05em;height:1.05em;flex:none;fill:var(--green)}
 .steps{display:grid;grid-template-columns:1fr;gap:18px}
 .step{background:var(--s1);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:10px 10px 4px;
   box-shadow:var(--sh);transition:transform .28s ease,border-color .28s ease,background-color .28s ease}
 .step:hover{transform:translateY(-4px);background:var(--s2);border-color:rgba(var(--greenRGB),.34)}
 .step .art{position:relative;aspect-ratio:4/3;background:rgba(0,0,0,.28);border-radius:14px;overflow:hidden}
 .step .art svg,.step .art img{width:100%;height:100%;object-fit:cover;display:block}
 /* selo do número (só no desenho padrão — arte enviada já traz o número) */
 .step .art .badge{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;
   display:flex;align-items:center;justify-content:center;background:var(--green);color:#04160b;
   font-weight:900;font-size:15px;box-shadow:0 6px 16px -6px rgba(0,0,0,.9)}
 .step .tx{padding:18px 14px 20px}
 .step h3{font-size:17.5px;font-weight:800;letter-spacing:-.01em}
 .step p{color:var(--mut);font-weight:600;font-size:14.5px;line-height:1.6;margin-top:10px}
 .stepscta{display:flex;justify-content:center;margin-top:36px}

 /* ---------- depoimentos ---------- */
 .voices{display:grid;grid-template-columns:1fr;gap:18px}
 .voice{background:var(--s1);border-radius:22px;padding:30px 28px;box-shadow:var(--sh);display:flex;flex-direction:column}
 .voice .stars{display:flex;gap:3px;margin-bottom:14px}
 .voice .stars svg{width:17px;height:17px;fill:#fbbf24;flex:none}
 .voice q{display:block;font-weight:600;color:#dcece3;line-height:1.65;font-size:15.5px;flex:1;quotes:'\201C' '\201D'}
 .voice q::before{content:open-quote;color:var(--green);font-size:34px;font-weight:900;line-height:0;vertical-align:-6px;margin-right:3px}
 .voice q::after{content:no-close-quote}
 .voice .who{margin-top:24px}
 .voice .nm{font-weight:800;font-size:14.5px}
 .voice .vf{color:var(--mut);font-weight:700;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;margin-top:5px}

 /* ---------- chamada final ---------- */
 .cta{position:relative;text-align:center;padding:88px 20px 96px;overflow:hidden;
   background:radial-gradient(760px 380px at 50% 118%,rgba(var(--greenRGB),.22),transparent 64%)}
 .cta h2{font-weight:900;font-size:clamp(28px,5.6vw,48px);letter-spacing:-.03em;line-height:1;text-wrap:balance}
 .cta p{color:var(--mut);font-weight:600;font-size:15px;margin:18px auto 34px;max-width:440px;line-height:1.6}

 /* ---------- rodapé (tom, não traço) ---------- */
 footer{background:#040a06;padding:58px 0 62px}
 footer .fb{font-weight:900;color:var(--green);font-size:19px;margin-bottom:18px;display:flex}
 footer .cp{color:#cbe0d4;font-weight:700;font-size:13.5px}
 footer .dis{color:var(--mut);font-weight:600;font-size:12.5px;line-height:1.7;margin-top:14px;max-width:640px}
 .fcols{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:40px;max-width:520px}
 .fcols h4{font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);margin-bottom:16px}
 .fcols a{display:block;color:#cfe3d7;font-weight:700;font-size:13.5px;padding:6px 0;transition:color .18s}
 .fcols a:hover{color:var(--green)}

 /* aparecer ao rolar */
 .js .rv{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s ease}
 .js .rv.in{opacity:1;transform:none}

 @media(min-width:720px){
   .steps{grid-template-columns:1fr 1fr;gap:22px}
   .voices{grid-template-columns:repeat(3,1fr)}
   .hero{padding:calc(var(--navh) + 22px) 20px 84px}
   .statgrid{gap:32px}
 }
 /* desktop: os 4 passos lado a lado, igual o concorrente */
 @media(min-width:1000px){
   .steps{grid-template-columns:repeat(4,1fr);gap:20px}
   .step .art{aspect-ratio:3/2}
   .step .tx{padding:16px 12px 18px}
   .step h3{font-size:16.5px}
   .step p{font-size:13.5px}
 }
 /* em tela estreita não cabem 3 lado a lado sem espremer: vira 2 em cima e
    1 embaixo ocupando a linha inteira (igual o concorrente) */
 @media(max-width:760px){
   .statgrid{grid-template-columns:1fr 1fr;gap:26px 16px}
   .statgrid .stat:last-child{grid-column:1 / -1}
 }
 @media(max-width:520px){
   .trust{gap:10px;font-size:12px}
 }
 @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}}


/* Style from https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,600&display=swap */
/* cyrillic-ext */
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq3p6WXV0poK5.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq3p6WXx0poK5.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* vietnamese */
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq3p6WXd0poK5.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq3p6WXZ0poK5.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Montserrat';
  font-style: italic;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq3p6WXh0pg.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* cyrillic-ext */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WRhyzbi.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459W1hyzbi.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* vietnamese */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WZhyzbi.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wdhyzbi.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* cyrillic-ext */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WRhyzbi.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459W1hyzbi.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* vietnamese */
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WZhyzbi.woff2) f
<!-- ... [Consulte os arquivos completos em ./paginas/ para o código integral] -->
```

*📊 Prompt Otimizado para Workspace: ~9.613 tokens*
