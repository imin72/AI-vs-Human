
import { QuizQuestion } from '../../types';

export const SCIENCE_DB: Record<string, QuizQuestion[]> = {
  // --- Quantum Physics ---
  "Quantum Physics_HARD_en": [
    {
      id: 101,
      question: "What is the phenomenon where particles become correlated in such a way that the quantum state of each particle cannot be described independently?",
      options: ["Superposition", "Quantum Entanglement", "Tunneling", "Decoherence"],
      correctAnswer: "Quantum Entanglement",
      context: "Einstein famously referred to this as 'spooky action at a distance'."
    },
    {
      id: 102,
      question: "Which principle states that certain pairs of physical properties cannot be known to arbitrary precision simultaneously?",
      options: ["Pauli Exclusion Principle", "Heisenberg Uncertainty Principle", "Born Rule", "Fermi-Dirac Statistics"],
      correctAnswer: "Heisenberg Uncertainty Principle",
      context: "It implies a fundamental limit to the precision with which certain pairs of physical properties, such as position and momentum, can be known."
    },
    {
      id: 103,
      question: "What is the hypothetical elementary particle that mediates the force of gravity in the framework of quantum field theory?",
      options: ["Higgs Boson", "Graviton", "Gluon", "Photon"],
      correctAnswer: "Graviton",
      context: "Unlike other force carriers, the graviton has not yet been observed experimentally."
    },
    {
      id: 104,
      question: "In the Schrödinger's cat thought experiment, what determines the state of the cat before observation?",
      options: ["Dead", "Alive", "Superposition of Dead and Alive", "Non-existent"],
      correctAnswer: "Superposition of Dead and Alive",
      context: "The cat is considered to be both dead and alive until the box is opened and the system interacts with the external environment."
    },
    {
      id: 105,
      question: "Which experiment demonstrated the wave-particle duality of light and matter?",
      options: ["Michelson-Morley Experiment", "Double-slit Experiment", "Stern-Gerlach Experiment", "Oil Drop Experiment"],
      correctAnswer: "Double-slit Experiment",
      context: "It shows that light and matter can display characteristics of both classically defined waves and particles."
    }
  ],
  "Quantum Physics_HARD_ko": [
    {
      id: 101,
      question: "두 개 이상의 입자가 서로 멀리 떨어져 있어도 양자 상태가 연결되어 있어, 한 입자의 상태가 결정되면 다른 입자의 상태도 즉시 결정되는 현상은 무엇입니까?",
      options: ["중첩", "양자 얽힘", "터널링", "결풀림"],
      correctAnswer: "양자 얽힘",
      context: "아인슈타인은 이 현상을 '유령 같은 원격 작용'이라고 부르며 회의적인 태도를 보였습니다."
    },
    {
      id: 102,
      question: "입자의 위치와 운동량을 동시에 정확하게 측정할 수 없다는 원리는 무엇입니까?",
      options: ["파울리 배타 원리", "하이젠베르크의 불확정성 원리", "보른 규칙", "페르미-디랙 통계"],
      correctAnswer: "하이젠베르크의 불확정성 원리",
      context: "이는 측정 장비의 오차가 아니라 자연의 근본적인 한계를 나타냅니다."
    },
    {
      id: 103,
      question: "슈뢰딩거의 고양이 사고 실험에서, 관측하기 전 고양이의 상태는 어떠합니까?",
      options: ["죽어 있다", "살아 있다", "죽어 있으면서 동시에 살아 있다", "존재하지 않는다"],
      correctAnswer: "죽어 있으면서 동시에 살아 있다",
      context: "상자를 열어 관측하는 순간 파동함수가 붕괴되어 하나의 상태로 결정됩니다."
    },
    {
      id: 104,
      question: "빛과 물질이 입자성과 파동성을 동시에 가진다는 것을 증명한 실험은 무엇입니까?",
      options: ["마이컬슨-몰리 실험", "이중 슬릿 실험", "슈테른-게를라흐 실험", "기름방울 실험"],
      correctAnswer: "이중 슬릿 실험",
      context: "전자를 하나씩 쏘아도 간섭무늬가 나타나는 현상은 양자역학의 가장 미스터리한 부분 중 하나입니다."
    },
    {
      id: 105,
      question: "양자 컴퓨터의 기본 정보 처리 단위는 무엇입니까?",
      options: ["비트 (Bit)", "큐비트 (Qubit)", "바이트 (Byte)", "플롭스 (FLOPS)"],
      correctAnswer: "큐비트 (Qubit)",
      context: "0과 1의 상태를 동시에 가질 수 있는 중첩 성질을 이용해 병렬 연산을 수행합니다."
    }
  ]
};
