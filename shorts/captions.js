// Legendas (a = início, b = fim, em segundos). Usadas na animação e para gerar o .srt
const CAPTIONS = [
  { a: 0.0, b: 3.0, text: "Sem internet, sem luz, sem água..." },
  { a: 3.0, b: 6.0, text: "O nerd sobreviveria ao apocalipse?" },
  { a: 6.0, b: 10.0, text: "Téo leu 300 wikis e zerou 40 jogos de sobrevivência." },
  { a: 10.0, b: 13.0, text: "Dia 1: a rede elétrica cai e não volta." },
  { a: 13.0, b: 16.0, text: "Painel solar ligado à rede? Desliga junto." },
  { a: 16.0, b: 20.0, text: "Fogo para ferver a água? Tentativa 1, 2, 3..." },
  { a: 20.0, b: 23.0, text: "Na 14ª funciona. Nerd não desiste, debuga." },
  { a: 23.0, b: 28.0, text: "Semana 2: a comida acaba e a horta leva semanas." },
  { a: 28.0, b: 33.0, text: "O problema nunca foi inteligência. Foi estar sozinho." },
  { a: 33.0, b: 37.0, text: "Em grupo, o nerd vira a peça que faltava." },
  { a: 37.0, b: 40.0, text: "Documenta, calcula, conserta e ensina." },
  { a: 40.0, b: 43.0, text: "Sozinho, a chance é ruim." },
  { a: 43.0, b: 46.0, text: "Em grupo, ele vira um multiplicador de força." },
  { a: 46.0, b: 49.0, text: "Você sabe acender um fogo?" },
  { a: 49.0, b: 52.0, text: "E você, sobreviveria?" },
];
const DURATION = 52;
if (typeof module !== "undefined") module.exports = { CAPTIONS, DURATION };
