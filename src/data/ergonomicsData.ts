import { BodyPart, ChecklistItem, DiscomfortRecord, ErgoCalculation, StretchExercise, UserErgoProfile } from '../types';

/**
 * Calculations based on Ergonomic Anthropometry standards (ISO 9241-5, OSHA, NR-17).
 * - Seated Popliteal height: ~24.5% to 25.5% of stature + shoe heel.
 * - Seated Elbow height above seat: ~13.5% to 14.5% of stature.
 * - Desk height seated: Popliteal height + Elbow height.
 * - Eye level seated: Popliteal height + ~43.5% of stature.
 * - Standing elbow height: ~62% of stature + shoe heel.
 * - Standing eye level: ~93% of stature + shoe heel.
 */
export function calculateErgonomics(profile: UserErgoProfile): ErgoCalculation {
  const h = Math.max(130, Math.min(220, profile.heightCm));
  const heel = Math.max(0, Math.min(10, profile.shoeHeelCm || 2));

  // 1. Altura do assento (distância poplítea com folga para circulação)
  const chairSeatHeight = Math.round(h * 0.252 + heel);

  // 2. Altura dos apoios de braço acima do assento (altura do cotovelo)
  const armrestHeightAboveSeat = Math.round(h * 0.138);

  // 3. Altura da mesa sentado (superfície onde repousam teclado e mouse)
  const deskHeightSitting = Math.round(chairSeatHeight + armrestHeightAboveSeat);

  // 4. Altura dos olhos sentado
  const eyeLevelSitting = Math.round(chairSeatHeight + h * 0.435);

  // 5. Altura do topo do monitor sentado (alinhado aos olhos ou até 3-5 cm abaixo)
  const monitorTopHeightSitting = eyeLevelSitting;

  // 6. Configuração em pé (standing desk)
  const deskHeightStanding = Math.round(h * 0.625 + heel);
  const monitorTopHeightStanding = Math.round(h * 0.93 + heel);

  // 7. Distância do monitor (comprimento aproximado do braço estendido)
  const armSpanEstimate = Math.round(h * 0.36);
  const monitorDistanceCm = {
    min: Math.max(50, armSpanEstimate - 10),
    max: Math.min(90, armSpanEstimate + 15),
  };

  // 8. Necessidade de apoio para os pés
  // Mesas fixas no mercado padrão brasileiro costumam ter 74-75 cm.
  // Se o usuário precisa de mesa menor que 73 cm e usa mesa fixa, ele precisará elevar a cadeira e apoiar os pés.
  const standardDeskHeight = 75;
  const needsFootrest = profile.deskType === 'fixed' && deskHeightSitting < standardDeskHeight - 2;

  let footrestExplanation = '';
  if (needsFootrest) {
    const diff = standardDeskHeight - deskHeightSitting;
    footrestExplanation = `Como sua mesa tem altura fixa padrão (~75 cm) e sua altura ideal de trabalho é ${deskHeightSitting} cm, você precisará erguer a cadeira em cerca de ${diff} cm e utilizar um Apoio Ergonômico para Pés com inclinação regulável (NR-17) para não prender a circulação sob as coxas.`;
  } else {
    footrestExplanation = `Com mesa regulável ajustada em ${deskHeightSitting} cm ou estatura compatível, seus pés apoiam confortavelmente e integralmente no piso plano.`;
  }

  return {
    chairSeatHeight,
    deskHeightSitting,
    deskHeightStanding,
    monitorTopHeightSitting,
    monitorTopHeightStanding,
    eyeLevelSitting,
    monitorDistanceCm,
    armrestHeightAboveSeat,
    needsFootrestRecommendation: needsFootrest,
    footrestExplanation,
  };
}

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'screen_height',
    category: 'screen',
    title: 'Altura da borda superior da tela',
    description: 'A borda superior do monitor está no mesmo nível horizontal dos seus olhos quando você olha para frente.',
    tip: 'Se usar notebook, use um suporte elevador e conecte teclado e mouse externos. Nunca trabalhe com a cabeça inclinada para baixo.',
    nr17Ref: 'NR-17 Item 17.5.3.3',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'screen_distance',
    category: 'screen',
    title: 'Distância do monitor e tamanho das fontes',
    description: 'A tela fica a aproximadamente um braço de distância (50 a 75 cm), permitindo ler sem projetar a cabeça para a frente.',
    tip: 'Estique o braço: a ponta dos seus dedos médios deve quase tocar o vidro do monitor. Aumente o zoom do sistema operacional para 110-125% se necessário.',
    nr17Ref: 'NR-17 Item 17.5.3',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'screen_glare',
    category: 'screen',
    title: 'Sem reflexos de janelas ou lâmpadas na tela',
    description: 'O monitor está posicionado perpendicularmente às janelas e sem luz direta incidindo no visor.',
    tip: 'Evite sentar de costas para janelas claras ou de frente para janelas sem cortina blackout.',
    nr17Ref: 'NR-17 Item 17.5.2',
    status: 'unanswered',
    importance: 'medium',
  },
  {
    id: 'chair_lumbar',
    category: 'chair',
    title: 'Apoio lombar regulado e acolhido',
    description: 'O encosto da cadeira apoia firmemente a curvatura natural da sua coluna lombar, sem deixar espaço vazio.',
    tip: 'Ajuste a altura da saliência lombar para encaixar na cintura. Na falta de ajuste, utilize uma almofada lombar ergonômica.',
    nr17Ref: 'NR-17 Item 17.6.3',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'chair_feet',
    category: 'chair',
    title: 'Pés apoiados e sem pressão sob as coxas',
    description: 'A sola dos pés fica totalmente apoiada no chão ou em apoio ergonômico, com espaço livre de 2 a 3 dedos atrás dos joelhos.',
    tip: 'A borda frontal do assento deve ser arredondada para não comprimir vasos sanguíneos e nervos poplíteos.',
    nr17Ref: 'NR-17 Item 17.6.3',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'chair_armrests',
    category: 'chair',
    title: 'Apoios de braço na mesma altura da mesa',
    description: 'Os apoios de braço sustentam o peso dos membros superiores mantendo ombros destensionados e relaxados.',
    tip: 'Seus cotovelos devem repousar em ângulo reto (90° a 100°). Se os braços ficarem muito altos, seus ombros ficarão encolhidos.',
    nr17Ref: 'NR-17 Item 17.6.3',
    status: 'unanswered',
    importance: 'medium',
  },
  {
    id: 'peripherals_wrists',
    category: 'desk_peripherals',
    title: 'Punhos em posição neutra (sem dobrar para cima)',
    description: 'Ao digitar e mover o mouse, seus punhos permanecem retos, flutuando ou sobre apoio macio sem flexão dorsal.',
    tip: 'Baixe as "perninhas" traseiras do teclado! Elas forçam a extensão prejudicial do punho, aumentando o risco de síndrome do túnel do carpo.',
    nr17Ref: 'NR-17 Item 17.5.4',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'mouse_proximity',
    category: 'desk_peripherals',
    title: 'Mouse próximo ao teclado e ao corpo',
    description: 'O mouse está alinhado à lateral do teclado, sem necessidade de esticar o braço para frente ou para o lado.',
    tip: 'Mantenha o cotovelo colado junto ao tronco ao segurar o mouse. Considere teclado compacto (sem teclado numérico à direita) se usar muito o mouse.',
    nr17Ref: 'NR-17 Item 17.5.4',
    status: 'unanswered',
    importance: 'medium',
  },
  {
    id: 'body_shoulders',
    category: 'body_posture',
    title: 'Ombros soltos e relaxados (sem tensão escapular)',
    description: 'Você não sente os ombros "subindo" em direção às orelhas durante a jornada de trabalho.',
    tip: 'Faça 3 respirações profundas soltando os ombros intencionalmente para baixo e para trás a cada 30 minutos.',
    nr17Ref: 'NR-17 Item 17.4',
    status: 'unanswered',
    importance: 'high',
  },
  {
    id: 'body_legs',
    category: 'body_posture',
    title: 'Não cruzar as pernas por longos períodos',
    description: 'As pernas ficam paralelas com quadris e joelhos alinhados, sem cruzar tornozelos ou sentar sobre as pernas.',
    tip: 'Cruzar as pernas gira a pelve, inclina a coluna lombar e restringe a circulação venosa profunda.',
    nr17Ref: 'NR-17 Item 17.4.2',
    status: 'unanswered',
    importance: 'medium',
  },
  {
    id: 'env_lighting',
    category: 'environment',
    title: 'Iluminação difusa e agradável (300 a 500 lux)',
    description: 'O ambiente é iluminado de forma homogênea, sem sombras fortes na mesa de trabalho nem ofuscamento visual.',
    tip: 'A luz de teto não deve incidir diretamente sobre sua cabeça nem criar brilho reflexivo nos documentos e telas.',
    nr17Ref: 'NR-17 Item 17.5.2',
    status: 'unanswered',
    importance: 'medium',
  },
];

export const STRETCH_EXERCISES: StretchExercise[] = [
  {
    id: 'neck_lateral',
    title: 'Alongamento Cervical Lateral',
    targetArea: 'Trapézio Superior e Escalenos (Pescoço)',
    bodyPart: 'neck',
    durationSec: 25,
    repsText: '1 vez de 20s para cada lado',
    benefits: 'Descomprime a tensão na base da cabeça e alivia cefaleia tensional.',
    steps: [
      'Sente-se com a coluna ereta e ombros relaxados.',
      'Leve a orelha direita suavemente em direção ao ombro direito.',
      'Com a mão direita, faça uma leve pressão sobre o topo da cabeça (sem puxar forte).',
      'Mantenha a respiração calma por 20 segundos e sinta o lado esquerdo do pescoço alongar.',
      'Retorne lentamente ao centro e repita para o lado esquerdo.',
    ],
    safetyTip: 'Nunca faça movimentos bruscos ou rotações forçadas com o pescoço estendido para trás.',
  },
  {
    id: 'chin_tuck',
    title: 'Retração Cervical (Queixo Duplo)',
    targetArea: 'Músculos Profundos do Pescoço',
    bodyPart: 'neck',
    durationSec: 20,
    repsText: '5 repetições segurando 4 segundos cada',
    benefits: 'Corrige a projeção da cabeça para frente (postura de "texto" e tela baixa).',
    steps: [
      'Mantenha o olhar na linha do horizonte.',
      'Deslize o queixo horizontalmente para trás, como se estivesse criando um queixo duplo suave.',
      'Não abaixe a cabeça nem olhe para o chão; o movimento é puramente de deslizamento axial posterior.',
      'Segure por 4 segundos, sinta a base do crânio alongar e solte.',
    ],
    safetyTip: 'Não incline a cabeça para trás, o movimento é de translação horizontal pura.',
  },
  {
    id: 'chest_opening',
    title: 'Abertura Peitoral e Retração Escapular',
    targetArea: 'Peitoral Maior/Menor e Romboides',
    bodyPart: 'shoulders',
    durationSec: 25,
    repsText: '2 séries de 15 segundos',
    benefits: 'Combate a postura cifótica de ombros caídos e enrolados para frente.',
    steps: [
      'Entrelace os dedos das mãos atrás das costas, na altura dos quadris.',
      'Abra o peito, projetando o esterno suavemente para a frente e para cima.',
      'Aproxime as duas escápulas (pás das costas) uma da outra.',
      'Respire fundo 3 vezes mantendo a abertura do tórax.',
    ],
    safetyTip: 'Não arqueie excessivamente a lombar; ative o abdômen suavemente.',
  },
  {
    id: 'wrist_extensor_flexor',
    title: 'Alongamento de Punhos e Dedos (Anti-LER)',
    targetArea: 'Flexores e Extensores dos Dedos e Punho',
    bodyPart: 'wrists',
    durationSec: 30,
    repsText: '15s palma para frente + 15s palma para dentro',
    benefits: 'Alivia a pressão no canal do carpo e tendões dos digitadores.',
    steps: [
      'Estenda o braço direito à frente na altura do ombro com a palma voltada para fora (dedos apontando para cima).',
      'Com a mão esquerda, puxe suavemente todos os dedos (incluindo o polegar) em direção ao seu corpo.',
      'Mantenha o cotovelo estendido por 15 segundos.',
      'Em seguida, inverta: aponte os dedos para baixo (palma para você) e puxe suavemente o dorso da mão por 15 segundos.',
      'Repita todo o ciclo com a mão esquerda.',
    ],
    safetyTip: 'Aplique força suave e contínua; não force se sentir formigamento agudo.',
  },
  {
    id: 'seated_twist',
    title: 'Torção Suave da Coluna Sentada',
    targetArea: 'Mobilidade Torácica e Musculatura Paravertebral',
    bodyPart: 'lower_back',
    durationSec: 25,
    repsText: '15 segundos para cada lado',
    benefits: 'Reduz a rigidez estática gerada por horas ininterruptas na mesma posição.',
    steps: [
      'Sente-se ereto com os pés firmes no chão.',
      'Coloque a mão direita no apoio de braço ou no encosto direito da cadeira.',
      'Gire suavemente o tronco para a direita, olhando por cima do ombro direito.',
      'Inspire crescendo a coluna e expire aprofundando a rotação de forma agradável.',
      'Retorne devagar e faça o mesmo para o lado esquerdo.',
    ],
    safetyTip: 'Gire o tórax, não force a articulação do pescoço além do limite confortável.',
  },
  {
    id: 'eye_202020',
    title: 'Regra 20-20-20 & Relaxamento Ocular',
    targetArea: 'Músculos Ciliares e Lubrificação Corneana',
    bodyPart: 'eyes',
    durationSec: 20,
    repsText: 'A cada 20 minutos de trabalho contínuo',
    benefits: 'Previne fadiga visual digital, olhos secos e espasmo acomodativo.',
    steps: [
      'Desvie os olhos da tela do computador e do celular.',
      'Encontre um ponto ou janela a pelo menos 6 metros de distância (20 pés).',
      'Foque suavemente nesse objeto distante por 20 segundos.',
      'Pisque 10 vezes de maneira completa e pausada para renovar a camada de lágrima.',
      'Esfregue as palmas das mãos até aquecerem e coloque-as em concha sobre os olhos fechados por 5 segundos.',
    ],
    safetyTip: 'Não aperte os globos oculares com as mãos.',
  },
  {
    id: 'calf_pump',
    title: 'Bomba de Panturrilha (Ativação Circulatória)',
    targetArea: 'Músculos Sóleo e Gastrocnêmio (Coração Periférico)',
    bodyPart: 'legs',
    durationSec: 30,
    repsText: '20 repetições de ponta dos pés e calcanhares',
    benefits: 'Estimula o retorno venoso, previne inchaço nos tornozelos e peso nas pernas.',
    steps: [
      'Mesmo sentado (ou preferencialmente em pé), mantenha os pés paralelos.',
      'Eleve os calcanhares o máximo possível, ficando na ponta dos pés, contraindo as panturrilhas.',
      'Desça os calcanhares e em seguida levante a ponta dos pés, apoiando apenas nos calcanhares.',
      'Alterne em ritmo constante por 30 segundos.',
    ],
    safetyTip: 'Se trabalhar em pé, mantenha os joelhos destravados com micro-flexão.',
  },
];

export const DISCOMFORT_DATABASE: Record<BodyPart, { name: string; causes: string[]; remedies: string[] }> = {
  neck: {
    name: 'Pescoço & Cervical',
    causes: [
      'Monitor muito baixo ou uso exclusivo de notebook sem suporte (projeção de cabeça para frente).',
      'Monitor deslocado lateralmente (olhar de lado o tempo todo em configurações de tela dupla desalinhadas).',
      'Atender chamadas segurando o celular entre o ombro e o ouvido.',
    ],
    remedies: [
      'Eleve o monitor com suporte ou livros até a borda superior estar na altura exata dos seus olhos.',
      'Posicione a tela de maior uso diretamente à sua frente.',
      'Use fone de ouvido ou headset para chamadas e reuniões online.',
      'Execute a retração cervical (queixo duplo) 3 vezes ao dia.',
    ],
  },
  shoulders: {
    name: 'Ombros & Trapézio',
    causes: [
      'Mesa muito alta ou apoios de braço muito elevados (forçando encolhimento de ombros).',
      'Teclado e mouse distantes do corpo (braços esticados sem suporte).',
      'Tensão emocional e estresse gerando contratura involuntária do trapézio.',
    ],
    remedies: [
      'Abaixe a mesa ou os apoios de braço até os cotovelos formarem ângulo reto de 90° com ombros caídos.',
      'Aproxime o teclado e o mouse a 15-20 cm da borda da mesa, mantendo os cotovelos junto ao tronco.',
      'Realize 3 voltas circulares com os ombros para trás sempre que perceber tensão.',
    ],
  },
  upper_back: {
    name: 'Costas Superior & Escápulas',
    causes: [
      'Postura em C / corcunda devido à tela distante ou fontes muito pequenas.',
      'Falta de encosto com suporte torácico e falta de pausas.',
      'Uso prolongado de cadeiras sem inclinação adequada.',
    ],
    remedies: [
      'Aproxime o monitor para 50-70 cm e aumente o tamanho da fonte em 125%.',
      'Sente-se com o quadril bem recuado na cadeira encostando totalmente a coluna.',
      'Faça o exercício de abertura de peitoral entrelaçando os dedos atrás das costas.',
    ],
  },
  lower_back: {
    name: 'Lombar',
    causes: [
      'Falta de apoio lombar na cadeira ou assento muito longo que empurra a pessoa para a ponta.',
      'Pés sem apoio flutuando no ar, aumentando a pressão sobre os discos intervertebrais.',
      'Permanecer sentado estaticamente por mais de 90 minutos contínuos.',
    ],
    remedies: [
      'Coloque uma toalha enrolada ou almofada lombar na curvatura da cintura.',
      'Use um apoio para os pés regulável caso a cadeira precise ficar alta para alcançar a mesa.',
      'Levante-se a cada 45 minutos para caminhar por 2 minutos e descomprimir a coluna.',
    ],
  },
  wrists: {
    name: 'Punhos & Mãos (LER/DORT)',
    causes: [
      'Uso das perninhas elevadas do teclado (causando hiperextensão do punho).',
      'Apoiar o punho com força contra a quina viva da mesa ao usar o mouse.',
      'Uso de mouse muito pequeno que força a mão em "garra".',
    ],
    remedies: [
      'Deite totalmente o teclado na mesa (feche as perninhas traseiras).',
      'Considere um mouse vertical ergonômico para manter o antebraço em pronação neutra ("aperto de mão").',
      'Mova o braço a partir do cotovelo/ombro ao mexer o mouse, e não apenas girando o punho.',
      'Alongue os flexores e extensores do punho por 20 segundos antes e depois de digitar.',
    ],
  },
  eyes: {
    name: 'Fadiga Ocular & Visão',
    causes: [
      'Piscar 60% menos vezes devido à concentração na tela luminosa.',
      'Reflexo de janelas ou lâmpadas na superfície do monitor.',
      'Brilho e contraste da tela descalibrados em relação à luz ambiente.',
    ],
    remedies: [
      'Adote rigorosamente a Regra 20-20-20: a cada 20 min, olhe a 6 metros por 20 segundos.',
      'Ajuste o brilho do monitor para que uma página branca fique com a mesma intensidade de uma folha de papel na sala.',
      'Posicione o monitor a 90 graus em relação a janelas.',
      'Considere usar colírio lubrificante com orientação oftalmológica se o ar-condicionado for intenso.',
    ],
  },
  legs: {
    name: 'Pernas & Circulação',
    causes: [
      'Borda da cadeira pressionando a parte de trás do joelho (área poplítea).',
      'Pernas cruzadas por longos períodos.',
      'Falta de contração muscular da panturrilha (estase venosa).',
    ],
    remedies: [
      'Garanta folga de 2 a 3 dedos entre a borda da cadeira e a dobra posterior dos joelhos.',
      'Pratique o exercício de elevação de calcanhares (bomba de panturrilha) regularmente.',
      'Varie a postura alternando entre sentado e em pé, se tiver mesa regulável.',
    ],
  },
};
