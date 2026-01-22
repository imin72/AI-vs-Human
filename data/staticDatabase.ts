
import { QuizQuestion, Difficulty, Language } from '../types';

/**
 * STATIC QUESTION DATABASE (Pre-generated Pool)
 * 
 * Strategy:
 * 1. Store frequently accessed topics here to save API costs.
 * 2. Key Format: "TopicName_DIFFICULTY_Language" (e.g., "Quantum Physics_HARD_en")
 * 3. If a key matches, these questions are returned instantly without API calls.
 */

export const STATIC_QUESTION_DB: Record<string, QuizQuestion[]> = {
  // --- EXAMPLE: QUANTUM PHYSICS (Hard, English) ---
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

  // --- EXAMPLE: ANCIENT EGYPT (Medium, Korean) ---
  "Ancient Egypt_MEDIUM_ko": [
    {
      id: 201,
      question: "고대 이집트에서 죽은 자의 영혼이 내세로 가기 위해 심장 무게를 잴 때 사용된 깃털의 주인은 누구입니까?",
      options: ["오시리스", "아누비스", "마아트", "호루스"],
      correctAnswer: "마아트",
      context: "마아트는 진리, 균형, 질서, 조화, 법, 도덕, 정의를 상징하는 여신입니다."
    },
    {
      id: 202,
      question: "이집트의 룩소르 신전과 카르낙 신전이 위치한 고대 도시의 이름은 무엇입니까?",
      options: ["멤피스", "테베", "알렉산드리아", "기자"],
      correctAnswer: "테베",
      context: "테베는 중왕국과 신왕국 시대의 수도로서 '백 개의 문이 있는 도시'라고 불렸습니다."
    },
    {
      id: 203,
      question: "이집트 상형문자를 해독하는 열쇠가 된 비석의 이름은 무엇입니까?",
      options: ["팔레르모석", "로제타석", "나르메르 팔레트", "메르넵타 비석"],
      correctAnswer: "로제타석",
      context: "1799년 나폴레옹 원정대에 의해 발견되었으며, 같은 내용이 세 가지 문자로 기록되어 있었습니다."
    },
    {
      id: 204,
      question: "최초의 피라미드로 알려진 계단식 피라미드를 건설한 파라오는 누구입니까?",
      options: ["쿠푸", "조세르", "람세스 2세", "투탕카멘"],
      correctAnswer: "조세르",
      context: "임호텝이 설계했으며, 사카라에 위치해 있습니다."
    },
    {
      id: 205,
      question: "고대 이집트인들이 종이 대신 사용했던 기록 매체는 무엇입니까?",
      options: ["양피지", "파피루스", "점토판", "비단"],
      correctAnswer: "파피루스",
      context: "파피루스 식물의 줄기를 얇게 썰어 압축하여 만들었으며, 영어단어 'Paper'의 어원이 되었습니다."
    }
  ],
  
  // --- ADD MORE TOPICS HERE TO REDUCE API COSTS ---
  // Format: "SubTopicName_DIFFICULTY_ISOcode"
};
