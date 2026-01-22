
import { QuizQuestion } from '../../types';

export const HISTORY_DB: Record<string, QuizQuestion[]> = {
  // --- Ancient Egypt ---
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

  // --- World War II ---
  "World War II_HARD_en": [
    {
      id: 301,
      question: "Which battle is considered the turning point of the war in the Pacific?",
      options: ["Battle of Iwo Jima", "Battle of Midway", "Battle of Coral Sea", "Battle of Guadalcanal"],
      correctAnswer: "Battle of Midway",
      context: "Fought in June 1942, the US Navy decisively defeated the Imperial Japanese Navy."
    },
    {
      id: 302,
      question: "What was the code name for the Allied invasion of Normandy?",
      options: ["Operation Barbarossa", "Operation Overlord", "Operation Market Garden", "Operation Torch"],
      correctAnswer: "Operation Overlord",
      context: "D-Day, June 6, 1944, marked the beginning of the liberation of Western Europe."
    },
    {
      id: 303,
      question: "Which German general was known as the 'Desert Fox'?",
      options: ["Heinz Guderian", "Erwin Rommel", "Erich von Manstein", "Gerd von Rundstedt"],
      correctAnswer: "Erwin Rommel",
      context: "He earned the nickname for his skillful military campaigns in North Africa."
    },
    {
      id: 304,
      question: "What was the name of the B-29 bomber that dropped the atomic bomb on Hiroshima?",
      options: ["Bockscar", "Enola Gay", "Memphis Belle", "The Great Artiste"],
      correctAnswer: "Enola Gay",
      context: "Piloted by Paul Tibbets, it dropped the 'Little Boy' bomb on August 6, 1945."
    },
    {
      id: 305,
      question: "Which conference in 1945 decided the post-war reorganization of Europe?",
      options: ["Tehran Conference", "Yalta Conference", "Casablanca Conference", "Potsdam Conference"],
      correctAnswer: "Yalta Conference",
      context: "Roosevelt, Churchill, and Stalin met to discuss Europe's postwar future."
    }
  ],
  "World War II_HARD_ko": [
    {
      id: 301,
      question: "태평양 전쟁의 판도를 뒤바꾼 결정적인 전환점으로 평가받는 해전은 무엇입니까?",
      options: ["이오지마 전투", "미드웨이 해전", "산호해 해전", "과달카날 전투"],
      correctAnswer: "미드웨이 해전",
      context: "1942년 6월, 미 해군은 일본 해군의 주력 항공모함 4척을 격침시키며 승기를 잡았습니다."
    },
    {
      id: 302,
      question: "연합군의 노르망디 상륙 작전의 코드명은 무엇입니까?",
      options: ["바르바로사 작전", "오버로드 작전", "마켓 가든 작전", "토치 작전"],
      correctAnswer: "오버로드 작전",
      context: "1944년 6월 6일 D-Day에 시작된 이 작전은 서유럽 해방의 시작을 알렸습니다."
    },
    {
      id: 303,
      question: "'사막의 여우'라는 별명으로 불렸던 독일의 장군은 누구입니까?",
      options: ["하인츠 구데리안", "에르빈 롬멜", "에리히 폰 만슈타인", "게르트 폰 룬트슈테트"],
      correctAnswer: "에르빈 롬멜",
      context: "북아프리카 전선에서 뛰어난 전술로 연합군을 괴롭히며 명성을 얻었습니다."
    },
    {
      id: 304,
      question: "히로시마에 원자폭탄을 투하한 B-29 폭격기의 이름은 무엇입니까?",
      options: ["복스카", "에놀라 게이", "멤피스 벨", "그레이트 아티스트"],
      correctAnswer: "에놀라 게이",
      context: "1945년 8월 6일, 폴 티베츠 대령이 조종하여 '리틀 보이'를 투하했습니다."
    },
    {
      id: 305,
      question: "나치 독일의 암호 기계 '에니그마'를 해독하는 데 결정적인 기여를 한 영국의 수학자는 누구입니까?",
      options: ["존 폰 노이만", "앨런 튜링", "찰스 배비지", "조지 불"],
      correctAnswer: "앨런 튜링",
      context: "그의 업적은 전쟁을 수년 단축시켰다고 평가받으며, 현대 컴퓨터 과학의 아버지로 불립니다."
    }
  ]
};
