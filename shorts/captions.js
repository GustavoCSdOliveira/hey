// Legendas (a = início, b = fim, em segundos). Usadas na animação e para gerar o .srt
const CAPTIONS = [
  { a: 0.3, b: 3.4, text: "Sem internet, sem luz, sem água..." },
  { a: 3.5, b: 5.9, text: "O nerd sobreviveria ao apocalipse?" },
  { a: 6.0, b: 10.3, text: "Téo leu 300 wikis e zerou 40 jogos de sobrevivência." },
  { a: 10.4, b: 14.1, text: "Dia 1: a rede elétrica cai e não volta." },
  { a: 14.3, b: 16.9, text: "Painel solar ligado à rede? Desliga junto." },
  { a: 17.0, b: 23.1, text: "Fogo para ferver a água? Tentativa 1, 2, 3..." },
  { a: 23.3, b: 27.7, text: "Na 14ª funciona. Nerd não desiste, debuga." },
  { a: 28.0, b: 32.2, text: "Semana 2: a comida acaba e a horta leva semanas." },
  { a: 32.3, b: 36.2, text: "O problema nunca foi inteligência. Foi estar sozinho." },
  { a: 37.7, b: 40.6, text: "Em grupo, o nerd vira a peça que faltava." },
  { a: 40.8, b: 44.0, text: "Documenta, calcula, conserta e ensina." },
  { a: 44.3, b: 46.2, text: "Sozinho, a chance é ruim." },
  { a: 46.4, b: 49.8, text: "Em grupo, ele vira um multiplicador de força." },
  { a: 50.0, b: 51.5, text: "Você sabe acender um fogo?" },
  { a: 51.6, b: 55.0, text: "E você, sobreviveria?" },
];
const DURATION = 55;
if (typeof module !== "undefined") module.exports = { CAPTIONS, DURATION };
