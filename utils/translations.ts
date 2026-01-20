
import { Language, Difficulty, TOPIC_IDS } from '../types';

interface TranslationData {
  common: {
    btn_back: string;
    confirm_exit: string;
  };
  intro: {
    human_label: string;
    ai_label: string;
    desc: string;
    btn_start: string;
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
    nationalities: { [key: string]: string };
  };
  topics: {
    title_select: string;
    title_config: string;
    btn_refresh: string;
    label_custom: string;
    ph_custom: string;
    label_field: string;
    label_difficulty: string;
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

const nationalList = {
  "South Korea": "South Korea",
  "USA": "USA",
  "Japan": "Japan",
  "Spain": "Spain",
  "UK": "UK",
  "Other": "Other"
};

// 최적화된 이미지 파라미터 적용
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
  [TOPIC_IDS.PHILOSOPHY]: `https://images.unsplash.com/photo-1505664194779-8beaceb93744?${OPT}`,
  [TOPIC_IDS.CUSTOM]: ""
};

const SUBTOPIC_IMAGES = {
  "고대 이집트": `https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?${OPT}`,
  "로마 제국": `https://images.unsplash.com/photo-1552832230-c0197dd311b5?${OPT}`,
  "Ancient Egypt": `https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?${OPT}`,
  "Roman Empire": `https://images.unsplash.com/photo-1552832230-c0197dd311b5?${OPT}`,
  "양자 역학": `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?${OPT}`,
  "Quantum Physics": `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?${OPT}`,
  "Astronomy": `https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?${OPT}`,
  "천문학": `https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?${OPT}`,
  "Artificial Intelligence": `https://images.unsplash.com/photo-1677442136019-21780ecad995?${OPT}`,
  "인공지능": `https://images.unsplash.com/photo-1677442136019-21780ecad995?${OPT}`,
  "Space": `https://images.unsplash.com/photo-1451187580459-43490279c0fa?${OPT}`,
  "Solar System": `https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?${OPT}`,
  "태양계": `https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?${OPT}`,
  "Nintendo": `https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?${OPT}`,
  "닌텐도": `https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?${OPT}`,
  "Marvel Cinematic Universe": `https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?${OPT}`,
  "마블 시네마틱 유니버스": `https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?${OPT}`,
};

const ENGLISH_BASE: TranslationData = {
  common: {
    btn_back: "Back",
    confirm_exit: "Are you sure you want to exit the quiz? Progress will be lost."
  },
  intro: {
    human_label: "HUMAN",
    ai_label: "AI",
    desc: "Challenge the algorithm. Select a field of expertise and prove that human intuition still reigns supreme.",
    btn_start: "Initialize Protocol"
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
    nationalities: nationalList
  },
  topics: {
    title_select: "Select Domain",
    title_config: "Configuration",
    btn_refresh: "Shuffle",
    label_custom: "CUSTOM TOPIC",
    ph_custom: "e.g. '80s Synthwave', 'Quantum Mechanics'",
    label_field: "SPECIFIC FIELD",
    label_difficulty: "DIFFICULTY",
    btn_start_sim: "Start Simulation",
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
      [TOPIC_IDS.PHILOSOPHY]: "Philosophy",
      [TOPIC_IDS.CUSTOM]: "Custom Topic"
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
      [TOPIC_IDS.PHILOSOPHY]: ["Ethics", "Logic", "Metaphysics", "Existentialism", "Stoicism", "Nihilism", "Political Philosophy", "Eastern Philosophy", "Ancient Greek", "Enlightenment", "Utilitarianism", "Aesthetics", "Epistemology", "Philosophy of Mind", "Famous Quotes", "Paradoxes"],
      [TOPIC_IDS.CUSTOM]: []
    }
  },
  quiz: {
    label_target: "Target",
    label_info: "INFO",
    btn_next: "Next Sequence",
    btn_finish: "Terminate Protocol"
  },
  results: {
    badge_complete: "Analysis Complete",
    label_percentile: "Global Percentile",
    label_correct: "Correct Answers",
    label_cohort: "Cohort Analysis",
    label_template: "Result Template",
    label_bottom: "Bottom 1%",
    label_top: "Top",
    btn_retry: "Retry",
    btn_share: "Share Result",
    btn_save: "Save Image",
    chart: { accuracy: "Accuracy", speed: "Speed", cohort: "Cohort", logic: "Logic", intuition: "Intuition" }
  },
  loading: {
    gen_vectors: "Generating Test Vectors...",
    analyzing: "AI Analyzing Performance..."
  },
  difficulty: {
    [Difficulty.EASY]: "Novice",
    [Difficulty.MEDIUM]: "Competent",
    [Difficulty.HARD]: "Expert"
  },
  error: {
    title: "System Failure",
    btn_reset: "System Reset"
  }
};

export const TRANSLATIONS: Record<Language, TranslationData> = {
  en: ENGLISH_BASE,
  ko: {
    ...ENGLISH_BASE,
    common: {
      btn_back: "뒤로",
      confirm_exit: "퀴즈를 종료하시겠습니까? 진행 상황이 손실됩니다."
    },
    intro: {
      human_label: "인간",
      ai_label: "인공지능",
      desc: "알고리즘에 도전하세요. 당신의 전문 분야를 선택하고 인간의 직관이 여전히 우위임을 증명하십시오.",
      btn_start: "프로토콜 시작"
    },
    profile: {
      title: "대상자 프로필",
      desc: "사용자의 국가별 문화 특성 및 교육 수준 최적화를 위해 사용됩니다.",
      label_gender: "성별",
      label_age: "연령대",
      label_nationality: "국적",
      btn_submit: "프로필 확정",
      skip: "건너뛰기",
      genders: { Male: "남성", Female: "여성", Other: "기타" },
      ages: { "Under 18": "18세 미만", "18-24": "18-24세", "25-34": "25-34세", "35-44": "35-44세", "45-54": "45-54세", "55+": "55세 이상" },
      nationalities: {
        "South Korea": "대한민국",
        "USA": "미국",
        "Japan": "일본",
        "Spain": "스페인",
        "UK": "영국",
        "Other": "기타"
      }
    },
    topics: {
      ...ENGLISH_BASE.topics,
      title_select: "영역 선택",
      title_config: "구성 설정",
      btn_refresh: "새로고침",
      label_custom: "사용자 지정 주제",
      ph_custom: "예: '80년대 신스웨이브', '양자 역학'",
      label_field: "세부 분야",
      label_difficulty: "난이도",
      btn_start_sim: "시뮬레이션 시작",
      categories: {
        [TOPIC_IDS.HISTORY]: "역사",
        [TOPIC_IDS.SCIENCE]: "과학",
        [TOPIC_IDS.ARTS]: "예술",
        [TOPIC_IDS.GENERAL]: "일반 상식",
        [TOPIC_IDS.GEOGRAPHY]: "지리",
        [TOPIC_IDS.MOVIES]: "영화",
        [TOPIC_IDS.MUSIC]: "음악",
        [TOPIC_IDS.GAMING]: "게임",
        [TOPIC_IDS.SPORTS]: "스포츠",
        [TOPIC_IDS.TECH]: "기술",
        [TOPIC_IDS.MYTHOLOGY]: "신화",
        [TOPIC_IDS.LITERATURE]: "문학",
        [TOPIC_IDS.NATURE]: "자연",
        [TOPIC_IDS.FOOD]: "음식",
        [TOPIC_IDS.SPACE]: "우주",
        [TOPIC_IDS.PHILOSOPHY]: "철학",
        [TOPIC_IDS.CUSTOM]: "직접 입력"
      }
    },
    quiz: {
      label_target: "목표",
      label_info: "정보",
      btn_next: "다음 시퀀스",
      btn_finish: "프로토콜 종료"
    },
    results: {
      badge_complete: "분석 완료",
      label_percentile: "글로벌 백분위",
      label_correct: "정답 수",
      label_cohort: "집단 분석",
      label_template: "결과 템플릿",
      label_bottom: "하위 1%",
      label_top: "상위",
      btn_retry: "재시도",
      btn_share: "결과 공유",
      btn_save: "이미지 저장",
      chart: { accuracy: "정확도", speed: "속도", cohort: "집단위치", logic: "논리력", intuition: "직관력" }
    },
    loading: {
      gen_vectors: "테스트 벡터 생성 중...",
      analyzing: "AI 성능 분석 중..."
    },
    difficulty: {
      [Difficulty.EASY]: "초급",
      [Difficulty.MEDIUM]: "중급",
      [Difficulty.HARD]: "고급"
    },
    error: {
      title: "시스템 오류",
      btn_reset: "시스템 재설정"
    }
  },
  ja: ENGLISH_BASE,
  es: ENGLISH_BASE
};
