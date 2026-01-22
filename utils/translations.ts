
import { Language, Difficulty, TOPIC_IDS } from '../types';

export interface TranslationData {
  common: {
    btn_back: string;
    confirm_exit: string;
    close: string;
  };
  intro: {
    human_label: string;
    ai_label: string;
    title: string;
    desc: string;
    btn_start: string;
    btn_continue: string;
    btn_reset: string;
  };
  profile: {
    title: string;
    desc: string;
    label_gender: string;
    label_age: string;
    label_nationality: string;
    btn_submit: string;
    skip: string;
    genders: { [key: string]: string };
    ages: { [key: string]: string };
    nationalities: { other: string };
  };
  topics: {
    title_select: string;
    title_config: string;
    desc_select: string;
    btn_refresh: string;
    btn_next_step: string;
    label_custom: string;
    ph_custom: string;
    label_field: string;
    label_difficulty: string;
    label_topics_selected: string;
    btn_start_sim: string;
    categories: { [key: string]: string };
    subtopics: { [key: string]: string[] };
    categoryImages: { [key: string]: string };
    subtopicImages: { [key: string]: string };
  };
  quiz: {
    label_target: string;
    label_info: string;
    btn_next: string;
    btn_finish: string;
    btn_analyze: string; 
    btn_start_next_topic_prefix: string;
    btn_start_next_topic_suffix: string;
    ai_status: string;
    ai_calculating: string;
    ai_answer_found: string;
    ai_done: string;
  };
  results: {
    badge_complete: string;
    label_percentile: string;
    label_correct: string;
    label_cohort: string;
    label_template: string;
    label_bottom: string;
    label_top: string;
    btn_retry: string;
    btn_share: string;
    btn_save: string;
    btn_next_topic: string;
    header_aggregate: string;
    label_sync: string;
    header_breakdown: string;
    label_fact: string;
    label_missed: string;
    label_ai_observer: string;
    unit_avg: string;
    unit_pts: string;
    suffix_global: string;
    tab_analysis: string;
    tab_details: string;
    page_summary: string;
    page_details: string;
    click_for_details: string;
    popup_question: string;
    popup_your_answer: string;
    popup_correct_answer: string;
    popup_ai_comment: string;
    level_ai: string;
    level_global: string;
    chart: {
      accuracy: string;
      speed: string;
      cohort: string;
      logic: string;
      intuition: string;
    };
  };
  loading: {
    gen_vectors: string;
    analyzing: string;
  };
  difficulty: {
    [key in Difficulty]: string;
  };
  error: {
    title: string;
    btn_reset: string;
  };
}

const OPT = "&w=400&q=80&auto=format&fit=crop";

const CATEGORY_IMAGES = {
  [TOPIC_IDS.HISTORY]: `https://images.unsplash.com/photo-1461360370896-922624d12aa1?${OPT}`,
  [TOPIC_IDS.SCIENCE]: `https://images.unsplash.com/photo-1507413245164-6160d8298b31?${OPT}`,
  [TOPIC_IDS.ARTS]: `https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?${OPT}`,
  [TOPIC_IDS.GENERAL]: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?${OPT}`,
  [TOPIC_IDS.GEOGRAPHY]: `https://images.unsplash.com/photo-1521295121783-8a321d551ad2?${OPT}`,
  [TOPIC_IDS.MOVIES]: `https://images.unsplash.com/photo-1485846234645-a62644f84728?${OPT}`,
  [TOPIC_IDS.MUSIC]: `https://images.unsplash.com/photo-1511379938547-c1f69419868d?${OPT}`,
  [TOPIC_IDS.GAMING]: `https://images.unsplash.com/photo-1542751371-adc38448a05e?${OPT}`,
  [TOPIC_IDS.SPORTS]: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?${OPT}`,
  [TOPIC_IDS.TECH]: `https://images.unsplash.com/photo-1518770660439-4636190af475?${OPT}`,
  [TOPIC_IDS.MYTHOLOGY]: `https://images.unsplash.com/photo-1599739291060-4578e77dac5d?${OPT}`,
  [TOPIC_IDS.LITERATURE]: `https://images.unsplash.com/photo-1495446815901-a7297e633e8d?${OPT}`,
  [TOPIC_IDS.NATURE]: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${OPT}`,
  [TOPIC_IDS.FOOD]: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?${OPT}`,
  [TOPIC_IDS.SPACE]: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${OPT}`,
  [TOPIC_IDS.PHILOSOPHY]: `https://images.unsplash.com/photo-1505664194779-8beaceb93744?${OPT}`
};

// Image mapping uses English keys as reference
const SUBTOPIC_IMAGES = {
  // English keys
  "Ancient Egypt": `https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?${OPT}`,
  "Roman Empire": `https://images.unsplash.com/photo-1552832230-c0197dd311b5?${OPT}`,
  "Quantum Physics": `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?${OPT}`,
  "Astronomy": `https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?${OPT}`,
  "Artificial Intelligence": `https://images.unsplash.com/photo-1677442136019-21780ecad995?${OPT}`,
  "Solar System": `https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?${OPT}`,
  "Nintendo": `https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?${OPT}`,
  "Marvel Cinematic Universe": `https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?${OPT}`,
};

const ENGLISH_BASE: TranslationData = {
  common: {
    btn_back: "Back",
    confirm_exit: "Are you sure you want to exit the quiz? Progress will be lost.",
    close: "Close"
  },
  intro: {
    human_label: "HUMAN",
    ai_label: "AI",
    title: "Challenge the AI!",
    desc: "Select a field of expertise and prove that human intuition still reigns supreme.",
    btn_start: "Start Test",
    btn_continue: "Continue with Saved Profile",
    btn_reset: "Reset Profile Data"
  },
  profile: {
    title: "Subject Profile",
    desc: "Used for cultural and educational context optimization.",
    label_gender: "GENDER",
    label_age: "AGE GROUP",
    label_nationality: "NATIONALITY",
    btn_submit: "Confirm Profile",
    skip: "Skip & Continue",
    genders: { Male: "Male", Female: "Female", Other: "Other" },
    ages: { "Under 18": "< 18", "18-24": "18-24", "25-34": "25-34", "35-44": "35-44", "45-54": "45-54", "55+": "55+" },
    nationalities: { other: "Select other country..." }
  },
  topics: {
    title_select: "Select Domain",
    title_config: "Select Sub-Topic",
    desc_select: "Select 1 to 4 domains to challenge.",
    btn_refresh: "Shuffle",
    btn_next_step: "Select Sub-topics",
    label_custom: "",
    ph_custom: "",
    label_field: "SPECIFIC FIELD",
    label_difficulty: "DIFFICULTY",
    label_topics_selected: "Topics Selected",
    btn_start_sim: "Start Test",
    categories: {
      [TOPIC_IDS.HISTORY]: "History",
      [TOPIC_IDS.SCIENCE]: "Science",
      [TOPIC_IDS.ARTS]: "Arts",
      [TOPIC_IDS.GENERAL]: "General Knowledge",
      [TOPIC_IDS.GEOGRAPHY]: "Geography",
      [TOPIC_IDS.MOVIES]: "Movies",
      [TOPIC_IDS.MUSIC]: "Music",
      [TOPIC_IDS.GAMING]: "Gaming",
      [TOPIC_IDS.SPORTS]: "Sports",
      [TOPIC_IDS.TECH]: "Technology",
      [TOPIC_IDS.MYTHOLOGY]: "Mythology",
      [TOPIC_IDS.LITERATURE]: "Literature",
      [TOPIC_IDS.NATURE]: "Nature",
      [TOPIC_IDS.FOOD]: "Food & Drink",
      [TOPIC_IDS.SPACE]: "Space",
      [TOPIC_IDS.PHILOSOPHY]: "Philosophy"
    },
    categoryImages: CATEGORY_IMAGES,
    subtopicImages: SUBTOPIC_IMAGES,
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["Ancient Egypt", "Roman Empire", "World War II", "Cold War", "Renaissance", "Industrial Revolution", "French Revolution", "American Civil War", "Feudal Japan", "The Vikings", "Aztec Empire", "Mongol Empire", "The Crusades", "Victorian Era", "Prehistoric Era", "Decolonization"],
      [TOPIC_IDS.SCIENCE]: ["Quantum Physics", "Genetics", "Organic Chemistry", "Neuroscience", "Botany", "Astronomy", "Geology", "Thermodynamics", "Marine Biology", "Evolution", "Particle Physics", "Immunology", "Paleontology", "Meteorology", "Robotics", "Ecology"],
      [TOPIC_IDS.ARTS]: ["Impressionism", "Renaissance Art", "Cubism", "Surrealism", "Baroque", "Modernism", "Sculpture", "Graphic Design", "Fashion History", "Photography", "Theater", "Opera", "Abstract Expressionism", "Pottery", "Calligraphy", "Gothic Architecture"],
      [TOPIC_IDS.GENERAL]: ["1980s Trivia", "1990s Trivia", "Inventions", "World Capitals", "Currencies", "Nobel Prizes", "Phobias", "Brand Logos", "Cryptocurrency", "Viral Trends", "Board Games", "Card Games", "Superheroes", "Classic Toys", "Cocktails", "Car Brands"],
      [TOPIC_IDS.GEOGRAPHY]: ["Capitals", "Landmarks", "Mountains", "Rivers", "Deserts", "Islands", "Volcanos", "Flags", "Population Stats", "Climate Zones", "Oceans", "US States", "European Countries", "Asian Cities", "African Nations", "Borders"],
      [TOPIC_IDS.MOVIES]: ["Oscars", "Sci-Fi", "Horror", "Marvel Cinematic Universe", "Star Wars", "Pixar", "80s Movies", "90s Movies", "Famous Directors", "Movie Soundtracks", "Cult Classics", "Anime Movies", "French Cinema", "Silent Era", "Special Effects", "Movie Villains"],
      [TOPIC_IDS.MUSIC]: ["Rock & Roll", "Pop Music", "Jazz", "Classical", "Hip Hop", "K-Pop", "EDM", "Heavy Metal", "Blues", "Country", "Opera", "Musical Instruments", "90s Hits", "One Hit Wonders", "Music Theory", "Woodstock"],
      [TOPIC_IDS.GAMING]: ["Nintendo", "PlayStation", "Xbox", "PC Gaming", "RPGs", "FPS", "Arcade Classics", "Retro Gaming", "Esports", "Minecraft", "Pokemon", "Zelda", "Mario", "Indie Games", "Speedrunning", "MMOs"],
      [TOPIC_IDS.SPORTS]: ["Soccer", "Basketball", "Baseball", "Tennis", "Golf", "Formula 1", "Olympics", "Boxing", "MMA", "Cricket", "Rugby", "Swimming", "Winter Sports", "Skateboarding", "Wrestling", "World Cup"],
      [TOPIC_IDS.TECH]: ["Artificial Intelligence", "Smartphones", "Internet History", "Social Media", "Coding", "Cybersecurity", "Space Tech", "VR/AR", "Blockchain", "Robots", "Computer Hardware", "Big Data", "Startups", "Hackers", "Gaming Tech", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["Greek Mythology", "Norse Mythology", "Egyptian Mythology", "Roman Mythology", "Japanese Folklore", "Chinese Mythology", "Celtic Mythology", "Aztec Mythology", "Hindu Mythology", "Native American", "Legendary Monsters", "Epic Heroes", "Underworlds", "Creation Myths", "Gods of War", "Tricksters"],
      [TOPIC_IDS.LITERATURE]: ["Shakespeare", "Classic Novels", "Dystopian Fiction", "Fantasy", "Sci-Fi Books", "Poetry", "Horror", "Mystery", "Comics & Manga", "Nobel Laureates", "Fairy Tales", "Greek Epics", "Russian Literature", "American Literature", "British Literature", "Playwrights"],
      [TOPIC_IDS.NATURE]: ["Mammals", "Birds", "Insects", "Marine Life", "Dinosaurs", "Rain Forests", "Deserts", "Weather", "Flowers", "Trees", "National Parks", "Survival Skills", "Evolution", "Endangered Species", "Fungi", "Gems & Minerals"],
      [TOPIC_IDS.FOOD]: ["Italian Cuisine", "French Cuisine", "Mexican Food", "Japanese Food", "Chinese Food", "Indian Food", "Desserts", "Wine", "Coffee", "Cheese", "Spices", "Street Food", "Fast Food", "Baking", "Vegan", "Cocktails"],
      [TOPIC_IDS.SPACE]: ["Solar System", "Black Holes", "Mars", "Moon Landing", "Constellations", "Stars", "Galaxies", "Astronauts", "Space Race", "Telescopes", "Exoplanets", "Gravity", "Rockets", "SETI", "ISS", "Big Bang"],
      [TOPIC_IDS.PHILOSOPHY]: ["Ética", "Lógica", "Metafísica", "Existentialism", "Stoicism", "Nihilism", "Political Philosophy", "Eastern Philosophy", "Ancient Greek", "Enlightenment", "Utilitarianism", "Aesthetics", "Epistemology", "Philosophy of Mind", "Famous Quotes", "Paradoxes"]
    }
  },
  quiz: { 
    label_target: "TARGET", 
    label_info: "INFO", 
    btn_next: "Next Question", 
    btn_finish: "Analyze Results",
    btn_analyze: "Analyze Segment",
    btn_start_next_topic_prefix: "Start ",
    btn_start_next_topic_suffix: " Test",
    ai_status: "AI STATUS",
    ai_calculating: "CALCULATING...",
    ai_answer_found: "ANSWER FOUND",
    ai_done: "AI DONE"
  },
  results: {
    badge_complete: "Analysis Complete", label_percentile: "Global Percentile", label_correct: "Correct Answers", label_cohort: "Cohort Analysis", label_template: "Result Template", label_bottom: "Bottom 1%", label_top: "Top", btn_retry: "Retry", btn_share: "Share Result", btn_save: "Save Image",
    btn_next_topic: "Continue to", 
    header_aggregate: "Aggregate Report",
    label_sync: "Total Synchronization",
    header_breakdown: "Detailed Breakdown",
    label_fact: "Fact:",
    label_missed: "Missed",
    label_ai_observer: "AI Observer",
    unit_avg: "AVG",
    unit_pts: "pts",
    suffix_global: "Global",
    tab_analysis: "Analysis",
    tab_details: "Details",
    page_summary: "SUMMARY",
    page_details: "DETAILS",
    click_for_details: "Click for Details",
    popup_question: "Question",
    popup_your_answer: "Your Answer",
    popup_correct_answer: "Correct Answer",
    popup_ai_comment: "AI Analysis",
    level_ai: "AI Level",
    level_global: "Global Level",
    chart: {
      accuracy: "Accuracy",
      speed: "Speed",
      cohort: "Cohort",
      logic: "Logic",
      intuition: "Intuition"
    }
  },
  loading: { gen_vectors: "Generating test vectors...", analyzing: "AI is analyzing performance..." },
  difficulty: { [Difficulty.EASY]: "Novice", [Difficulty.MEDIUM]: "Competent", [Difficulty.HARD]: "Expert" },
  error: { title: "System Failure", btn_reset: "System Reset" }
};

const KO_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "뒤로", confirm_exit: "퀴즈를 종료하시겠습니까? 진행 상황이 손실됩니다.", close: "닫기" },
  intro: { 
    human_label: "인간", 
    ai_label: "인공지능", 
    title: "AI에 도전하세요!",
    desc: "전문 분야를 선택하고 인간의 직관이 여전히 우위임을 증명하십시오.", 
    btn_start: "테스트 시작",
    btn_continue: "저장된 프로필로 계속하기",
    btn_reset: "프로필 초기화"
  },
  profile: {
    title: "대상자 프로필", desc: "사용자의 국가별 문화 특성 및 교육 수준 최적화를 위해 사용됩니다.",
    label_gender: "성별", label_age: "연령대", label_nationality: "국적", btn_submit: "프로필 확정", skip: "건너뛰기",
    genders: { Male: "남성", Female: "여성", Other: "기타" },
    ages: { "Under 18": "18세 미만", "18-24": "18-24세", "25-34": "25-34세", "35-44": "35-44세", "45-54": "45-54세", "55+": "55세 이상" },
    nationalities: { other: "다른 국가 선택..." }
  },
  topics: {
    ...ENGLISH_BASE.topics,
    title_select: "영역 선택", title_config: "세부 분야 선택", 
    desc_select: "도전하고자 하는 영역을 1개~4개 고르세요. (최대 4개)",
    btn_refresh: "새로고침", 
    btn_next_step: "세부 분야 선택",
    label_custom: "", ph_custom: "", label_field: "세부 분야", label_difficulty: "난이도", label_topics_selected: "개 분야 선택됨", btn_start_sim: "테스트 시작",
    categories: {
      [TOPIC_IDS.HISTORY]: "역사", [TOPIC_IDS.SCIENCE]: "과학", [TOPIC_IDS.ARTS]: "예술", [TOPIC_IDS.GENERAL]: "일반 상식", [TOPIC_IDS.GEOGRAPHY]: "지리", [TOPIC_IDS.MOVIES]: "영화", [TOPIC_IDS.MUSIC]: "음악", [TOPIC_IDS.GAMING]: "게임", [TOPIC_IDS.SPORTS]: "스포츠", [TOPIC_IDS.TECH]: "기술", [TOPIC_IDS.MYTHOLOGY]: "신화", [TOPIC_IDS.LITERATURE]: "문학", [TOPIC_IDS.NATURE]: "자연", [TOPIC_IDS.FOOD]: "음식", [TOPIC_IDS.SPACE]: "우주", [TOPIC_IDS.PHILOSOPHY]: "철학"
    },
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["고대 이집트", "로마 제국", "제2차 세계대전", "냉전", "르네상스", "산업 혁명", "프랑스 혁명", "미국 내전", "봉건 일본", "바이킹", "아즈텍 제국", "몽골 제국", "십자군", "빅토리아 시대", "선사 시대", "탈식민지화"],
      [TOPIC_IDS.SCIENCE]: ["양자 역학", "유전학", "유기 화학", "신경 과학", "식물학", "천문학", "지질학", "열역학", "해양 생물학", "진화론", "입자 물리학", "면역학", "고생물학", "기상학", "로봇 공학", "생태학"],
      [TOPIC_IDS.ARTS]: ["인상주의", "르네상스 예술", "입체파", "초현실주의", "바로크", "모더니즘", "조각", "그래픽 디자인", "패션 역사", "사진", "연극", "오페라", "추상 표현주의", "도예", "서예", "고딕 건축"],
      [TOPIC_IDS.GENERAL]: ["80년대 퀴즈", "90년대 퀴즈", "발명품", "세계 수도", "통화", "노벨상", "공포증", "브랜드 로고", "암호화폐", "바이럴 트렌드", "보드 게임", "카드 게임", "슈퍼히어로", "클래식 장난감", "칵테일", "자동차 브랜드"],
      [TOPIC_IDS.GEOGRAPHY]: ["수도", "랜드마크", "산맥", "강", "사막", "섬", "화산", "국기", "인구 통계", "기후대", "대양", "미국 주", "유럽 국가", "아시아 도시", "아프리카 국가", "국경"],
      [TOPIC_IDS.MOVIES]: ["오스카", "SF", "공포", "마블 시네마틱 유니버스", "스타워즈", "픽사", "80년대 영화", "90년대 영화", "유명 감독", "영화 사운드트랙", "컬트 클래식", "애니메이션 영화", "프랑스 영화", "무성 영화 시대", "특수 효과", "영화 빌런"],
      [TOPIC_IDS.MUSIC]: ["락앤롤", "팝 음악", "재즈", "클래식", "힙합", "K-팝", "EDM", "헤비 메탈", "블루스", "컨트리", "오페라", "악기", "90년대 히트곡", "원 히트 원더", "음악 이론", "우드스탁"],
      [TOPIC_IDS.GAMING]: ["닌텐도", "플레이스테이션", "엑스박스", "PC 게임", "RPG", "FPS", "아케이드 클래식", "레트로 게임", "e스포츠", "마인크래프트", "포켓몬", "젤다", "마리오", "인디 게임", "스피드런", "MMO"],
      [TOPIC_IDS.SPORTS]: ["축구", "농구", "야구", "테니스", "골프", "포뮬러 1", "올림픽", "복싱", "MMA", "크리켓", "럭비", "수영", "겨울 스포츠", "스케이트보드", "레슬링", "월드컵"],
      [TOPIC_IDS.TECH]: ["인공지능", "스마트폰", "인터넷 역사", "소셜 미디어", "코딩", "사이버 보안", "우주 기술", "VR/AR", "블록체인", "로봇", "컴퓨터 하드웨어", "빅데이터", "스타트업", "해커", "게이밍 기술", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["그리스 신화", "북유럽 신화", "이집트 신화", "로마 신화", "일본 설화", "중국 신화", "켈트 신화", "아즈텍 신화", "힌두 신화", "북미 원주민", "전설의 괴물", "서사시 영웅", "지하 세계", "창세 신화", "전쟁의 신", "트릭스터"],
      [TOPIC_IDS.LITERATURE]: ["셰익스피어", "고전 소설", "디스토피아 소설", "판타지", "SF 도서", "시", "공포", "미스터리", "만화 및 망가", "노벨 문학상", "동화", "그리스 서사시", "러시아 문학", "미국 문학", "영국 문학", "극작가"],
      [TOPIC_IDS.NATURE]: ["포유류", "조류", "곤충", "해양 생물", "공룡", "열대 우림", "사막", "날씨", "꽃", "나무", "국립공원", "생존 기술", "진화", "멸종 위기종", "균류", "보석 및 광물"],
      [TOPIC_IDS.FOOD]: ["이탈리아 요리", "프랑스 요리", "멕시코 음식", "일본 음식", "중국 음식", "인도 음식", "디저트", "와인", "커피", "치즈", "향신료", "길거리 음식", "패스트 푸드", "베이킹", "비건", "칵테일"],
      [TOPIC_IDS.SPACE]: ["태양계", "블랙홀", "화성", "달 착륙", "별자리", "별", "은하", "우주 비행사", "우주 경쟁", "망원경", "외계 행성", "중력", "로켓", "SETI", "국제 우주 정거장", "빅뱅"],
      [TOPIC_IDS.PHILOSOPHY]: ["윤리학", "논리학", "형이상학", "실존주의", "스토아학파", "허무주의", "정치 철학", "동양 철학", "고대 그리스", "계몽주의", "공리주의", "미학", "인식론", "심리 철학", "유명한 명언", "역설"]
    }
  },
  quiz: { 
    label_target: "목표", label_info: "정보", 
    btn_next: "다음 문제", 
    btn_finish: "결과 분석",
    btn_analyze: "중간 분석 실행",
    btn_start_next_topic_prefix: "",
    btn_start_next_topic_suffix: " 분야 테스트 시작",
    ai_status: "AI STATUS",
    ai_calculating: "생각 중...",
    ai_answer_found: "답변 도출 완료",
    ai_done: "AI 완료"
  },
  results: {
    badge_complete: "분석 완료", label_percentile: "글로벌 백분위", label_correct: "정답 수", label_cohort: "집단 분석", label_template: "결과 템플릿", label_bottom: "하위 1%", label_top: "상위", btn_retry: "재시도", btn_share: "결과 공유", btn_save: "이미지 저장",
    btn_next_topic: "다음 주제:", 
    header_aggregate: "종합 리포트",
    label_sync: "전체 동기화율",
    header_breakdown: "상세 분석",
    label_fact: "팩트:",
    label_missed: "오답",
    label_ai_observer: "AI 관찰자",
    unit_avg: "평균",
    unit_pts: "점",
    suffix_global: "글로벌",
    tab_analysis: "분석",
    tab_details: "상세",
    page_summary: "평가 요약",
    page_details: "상세 분석",
    click_for_details: "상세 보기",
    popup_question: "문제",
    popup_your_answer: "나의 답변",
    popup_correct_answer: "정답",
    popup_ai_comment: "AI 분석 코멘트",
    level_ai: "AI 대비 수준",
    level_global: "글로벌 수준",
    chart: { accuracy: "정확도", speed: "속도", cohort: "집단위치", logic: "논리력", intuition: "직관력" }
  },
  loading: { gen_vectors: "테스트 벡터 생성 중...", analyzing: "AI 성능 분석 중..." },
  difficulty: { [Difficulty.EASY]: "초급", [Difficulty.MEDIUM]: "중급", [Difficulty.HARD]: "고급" },
  error: { title: "시스템 오류", btn_reset: "시스템 재설정" }
};

const JA_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "戻る", confirm_exit: "クイズを終了しますか？進行状況は失われます。", close: "閉じる" },
  intro: { 
    human_label: "人間", 
    ai_label: "AI", 
    title: "AIに挑戦せよ！",
    desc: "専門分野を選択し、人間の直感がいまだに優位であることを証明してください。", 
    btn_start: "テスト開始",
    btn_continue: "保存されたプロフィールで続行",
    btn_reset: "プロフィールを初期化"
  },
  profile: {
    title: "被験者プロフィール", desc: "文化的・教育적背景の最適化に使用されます。",
    label_gender: "性別", label_age: "年齢層", label_nationality: "国籍", btn_submit: "確定", skip: "スキップ",
    genders: { Male: "男性", Female: "女性", Other: "その他" },
    ages: { "Under 18": "18歳未満", "18-24": "18-24歳", "25-34": "25-34歳", "35-44": "35-44歳", "45-54": "45-54歳", "55+": "55歳以上" },
    nationalities: { other: "他の国を選択..." }
  },
  topics: {
    ...ENGLISH_BASE.topics,
    title_select: "ドメイン選択", title_config: "詳細分野の選択", 
    desc_select: "挑戦する領域を1〜4つ選択してください（最大4つ）。",
    btn_refresh: "更新", 
    btn_next_step: "詳細分野の選択",
    label_custom: "", ph_custom: "", label_field: "特定分野", label_difficulty: "難易度", label_topics_selected: "個の分野を選択", btn_start_sim: "テスト開始",
    categories: {
      [TOPIC_IDS.HISTORY]: "歴史", [TOPIC_IDS.SCIENCE]: "科学", [TOPIC_IDS.ARTS]: "芸術", [TOPIC_IDS.GENERAL]: "一般常識", [TOPIC_IDS.GEOGRAPHY]: "地理", [TOPIC_IDS.MOVIES]: "映画", [TOPIC_IDS.MUSIC]: "音楽", [TOPIC_IDS.GAMING]: "ゲーム", [TOPIC_IDS.SPORTS]: "スポーツ", [TOPIC_IDS.TECH]: "テクノロジー", [TOPIC_IDS.MYTHOLOGY]: "神話", [TOPIC_IDS.LITERATURE]: "文学", [TOPIC_IDS.NATURE]: "自然", [TOPIC_IDS.FOOD]: "料理", [TOPIC_IDS.SPACE]: "宇宙", [TOPIC_IDS.PHILOSOPHY]: "哲学"
    },
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["古代エジプト", "ローマ帝国", "第二次世界大戦", "冷戦", "ルネサンス", "産業革命", "フランス革命", "アメリカ南北戦争", "封建時代の日本", "バイキング", "アズテック帝国", "モンゴル帝国", "十字軍", "ビクトリア朝", "先史時代", "非植民地化"],
      [TOPIC_IDS.SCIENCE]: ["量子力学", "遺伝学", "有機化学", "神経科学", "植物学", "天文学", "地質学", "熱力学", "海洋生物学", "進化論", "素粒子物理学", "免疫学", "古生物学", "気象学", "ロボット工学", "生態学"],
      [TOPIC_IDS.ARTS]: ["印象派", "ルネサンス美術", "キュビスム", "シュルレアリスム", "バロック", "モダニズム", "彫刻", "グラフィックデザイン", "ファッションの歴史", "写真", "演劇", "オペラ", "抽象表現主義", "陶芸", "書道", "ゴシック建築"],
      [TOPIC_IDS.GENERAL]: ["80年代トリビア", "90年代トリビア", "発明", "世界の首都", "通貨", "ノーベル賞", "恐怖症", "ブランドロゴ", "暗号資産", "バイラルトレンド", "ボードゲーム", "カードゲーム", "スーパーヒーロー", "クラシック玩具", "カクテル", "自動車ブランド"],
      [TOPIC_IDS.GEOGRAPHY]: ["首都", "ランドマーク", "山脈", "川", "砂漠", "島", "火山", "国旗", "人口統計", "気候帯", "海洋", "米国の州", "欧州の国々", "アジアの都市", "アフリカの諸国", "国境"],
      [TOPIC_IDS.MOVIES]: ["オスカー", "SF", "ホラー", "マーベル・シネマティック・ユニバース", "スター・ウォーズ", "ピクサー", "80年代映画", "90年代映画", "有名監督", "映画音楽", "カルト・クラシック", "アニメ映画", "フランス映画", "サイレント映画時代", "特殊効果", "映画のヴィラン"],
      [TOPIC_IDS.MUSIC]: ["ロックンロール", "ポップ・ミュージック", "ジャズ", "クラシック", "ヒップホップ", "K-POP", "EDM", "ヘヴィメタル", "ブルース", "カントリー", "オペラ", "楽器", "90年代ヒット曲", "ワン・ヒット・ワンダー", "音楽理論", "ウッドストック"],
      [TOPIC_IDS.GAMING]: ["任天堂", "プレイステーション", "Xbox", "PCゲーム", "RPG", "FPS", "アーケード・クラシック", "レトロゲーム", "eスポーツ", "マインクラフト", "ポケモン", "ゼルダ", "マリオ", "インディーゲーム", "スピードラン", "MMO"],
      [TOPIC_IDS.SPORTS]: ["サッカー", "バスケットボール", "野球", "テニス", "ゴルフ", "F1", "オリンピック", "ボクシング", "総合格闘技", "クリケット", "ラグビー", "水泳", "ウィンタースポーツ", "スケートボード", "レスリング", "ワールドカップ"],
      [TOPIC_IDS.TECH]: ["人工知能", "スマートフォン", "インターネットの歴史", "ソーシャルメディア", "コーディング", "サイバーセキュリティ", "宇宙技術", "VR/AR", "ブロックチェーン", "ロボット", "コンピュータハードウェア", "ビッグデータ", "スタートアップ", "ハッカー", "ゲーミング技術", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["ギリシャ神話", "北欧神話", "エジプト神話", "ローマ神話", "日本伝承", "中国神話", "ケルト神話", "アズテック神話", "ヒンドゥー神話", "ネイティブ・アメリカン", "伝説の怪物", "叙事詩の英雄", "冥界", "創世神話", "軍神", "トリックスター"],
      [TOPIC_IDS.LITERATURE]: ["シェイクスピア", "古典小説", "ディストピア小説", "ファンタジー", "SF小説", "詩", "ホラー", "ミステリー", "コミック・漫画", "ノーベル賞作家", "おとぎ話", "ギリシャ叙事詩", "ロシア文学", "アメリカ文学", "イギリス文学", "劇作家"],
      [TOPIC_IDS.NATURE]: ["哺乳類", "鳥類", "昆虫", "海洋生物", "恐竜", "熱帯雨林", "砂漠", "天気", "花", "木々", "国立公園", "生存技術", "進化", "絶滅危惧種", "菌類", "宝石・鉱物"],
      [TOPIC_IDS.FOOD]: ["イタリア料理", "フランス料理", "メキシコ料理", "日本料理", "中華料理", "インド料理", "デザート", "ワイン", "コーヒー", "チーズ", "スパイス", "ストリートフード", "ファストフード", "ベーキング", "ヴィーガン", "カクテル"],
      [TOPIC_IDS.SPACE]: ["太陽系", "ブラックホール", "火星", "月面着陸", "星座", "星", "銀河", "宇宙飛行士", "宇宙開発競争", "望遠鏡", "系外惑星", "重力", "ロケット", "SETI", "国際宇宙ステーション", "ビッグバン"],
      [TOPIC_IDS.PHILOSOPHY]: ["倫理学", "論理学", "形而上学", "実存主義", "ストア派", "虚無主義", "政治哲学", "東洋哲学", "古代ギリシャ", "啓術主義", "功利主義", "美学", "認識論", "心の哲学", "有名な名言", "パラドックス"]
    }
  },
  quiz: { 
    label_target: "目標", label_info: "情報", 
    btn_next: "次の問題", 
    btn_finish: "結果分析",
    btn_analyze: "中間分析を実行",
    btn_start_next_topic_prefix: "",
    btn_start_next_topic_suffix: "分野テスト開始",
    ai_status: "AI STATUS",
    ai_calculating: "計算中...",
    ai_answer_found: "回答生成完了",
    ai_done: "AI完了"
  },
  results: {
    badge_complete: "分析完了", label_percentile: "世界ランク", label_correct: "正解数", label_cohort: "集団分析", label_template: "結果テンプレート", label_bottom: "下位 1%", label_top: "上位", btn_retry: "リトライ", btn_share: "結果を共有", btn_save: "画像を保存",
    btn_next_topic: "次のテーマ:", 
    header_aggregate: "総合レポート",
    label_sync: "完全同期率",
    header_breakdown: "詳細分析",
    label_fact: "事実:",
    label_missed: "不正解",
    label_ai_observer: "AIオブザーバー",
    unit_avg: "平均",
    unit_pts: "点",
    suffix_global: "位",
    tab_analysis: "分析",
    tab_details: "詳細",
    page_summary: "評価概要",
    page_details: "詳細分析",
    click_for_details: "詳細を見る",
    popup_question: "問題",
    popup_your_answer: "あなたの回答",
    popup_correct_answer: "正解",
    popup_ai_comment: "AI分析コメント",
    level_ai: "AI対比レベル",
    level_global: "グローバルレベル",
    chart: { accuracy: "正確性", speed: "速度", cohort: "集団位置", logic: "論理力", intuition: "直感力" }
  },
  loading: { gen_vectors: "テストベクトル生成中...", analyzing: "AIパフォーマンス分析中..." },
  difficulty: { [Difficulty.EASY]: "初級", [Difficulty.MEDIUM]: "中級", [Difficulty.HARD]: "上級" },
  error: { title: "システムエラー", btn_reset: "システムリセット" }
};

const ES_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "Volver", confirm_exit: "¿Estás seguro de que quieres salir? Se perderá el progreso.", close: "Cerrar" },
  topics: {
    ...ENGLISH_BASE.topics,
    desc_select: "Selecciona de 1 a 4 dominios para desafiar.",
  },
  results: {
    ...ENGLISH_BASE.results,
    page_summary: "Resumen",
    page_details: "Detalles",
    click_for_details: "Ver detalles",
    popup_question: "Pregunta",
    popup_your_answer: "Tu Respuesta",
    popup_correct_answer: "Respuesta Correcta",
    popup_ai_comment: "Análisis de IA",
    level_ai: "Nivel IA",
    level_global: "Nivel Global",
  }
};

const FR_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "Retour", confirm_exit: "Voulez-vous vraiment quitter ? La progression sera perdue.", close: "Fermer" },
  topics: {
    ...ENGLISH_BASE.topics,
    desc_select: "Sélectionnez 1 à 4 domaines à défier.",
  },
  results: {
    ...ENGLISH_BASE.results,
    page_summary: "Résumé",
    page_details: "Détails",
    click_for_details: "Voir détails",
    popup_question: "Question",
    popup_your_answer: "Votre Réponse",
    popup_correct_answer: "Bonne Réponse",
    popup_ai_comment: "Analyse IA",
    level_ai: "Niveau IA",
    level_global: "Niveau Global",
  }
};

const ZH_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "返回", confirm_exit: "确定要退出测验吗？进度将会丢失。", close: "关闭" },
  topics: {
    ...ENGLISH_BASE.topics,
    desc_select: "选择 1 到 4 个领域进行挑战。",
  },
  results: {
    ...ENGLISH_BASE.results,
    page_summary: "评估摘要",
    page_details: "详细分析",
    click_for_details: "点击查看详情",
    popup_question: "问题",
    popup_your_answer: "你的答案",
    popup_correct_answer: "正确答案",
    popup_ai_comment: "AI 分析",
    level_ai: "AI 对比水平",
    level_global: "全球水平",
  }
};

export const TRANSLATIONS: Record<Language, TranslationData> = {
  en: ENGLISH_BASE,
  ko: KO_TRANSLATIONS,
  ja: JA_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  fr: FR_TRANSLATIONS,
  zh: ZH_TRANSLATIONS
};
