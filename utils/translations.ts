
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

const CATEGORY_IMAGES = {
  [TOPIC_IDS.HISTORY]: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.SCIENCE]: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.ARTS]: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.GENERAL]: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.GEOGRAPHY]: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.MOVIES]: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.MUSIC]: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.GAMING]: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.SPORTS]: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.TECH]: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.MYTHOLOGY]: "https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.LITERATURE]: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.NATURE]: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.FOOD]: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.SPACE]: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.PHILOSOPHY]: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=400&auto=format&fit=crop",
  [TOPIC_IDS.CUSTOM]: ""
};

const SUBTOPIC_IMAGES = {
  // 역사
  "고대 이집트": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&q=80",
  "로마 제국": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80",
  "Ancient Egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&q=80",
  "Roman Empire": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80",
  // 과학
  "양자 역학": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
  "Quantum Physics": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
  "Astronomy": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
  "천문학": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
  // 기술
  "Artificial Intelligence": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
  "인공지능": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80",
  // 우주
  "Space": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
  "Solar System": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80",
  "태양계": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80",
  // 영화/게임
  "Nintendo": "https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?w=400&q=80",
  "닌텐도": "https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?w=400&q=80",
  "Marvel Cinematic Universe": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
  "마블 시네마틱 유니버스": "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&q=80",
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
    ...ENGLISH_BASE, // 기본 구조 상속
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
      ...ENGLISH_BASE.topics, // 영문 데이터 상속 후 한글로 덮어쓰기
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
      },
      subtopics: {
        [TOPIC_IDS.HISTORY]: ["고대 이집트", "로마 제국", "제2차 세계 대전", "냉전", "르네상스", "산업 혁명", "프랑스 혁명", "미국 남북 전쟁", "일본 전국시대", "바이킹", "아즈텍 제국", "몽골 제국", "십자군 전쟁", "빅토리아 시대", "선사 시대", "탈식민지화"],
        [TOPIC_IDS.SCIENCE]: ["양자 역학", "유전학", "유기 화학", "신경 과학", "식물학", "천문학", "지질학", "열역학", "해양 생물학", "진화론", "입자 물리학", "면역학", "고생물학", "기상학", "로봇 공학", "생태학"],
        [TOPIC_IDS.ARTS]: ["인상주의", "르네상스 미술", "입체파", "초현실주의", "바로크", "모더니즘", "조각", "그래픽 디자인", "패션의 역사", "사진", "연극", "오페라", "추상 표현주의", "도예", "서예", "고딕 건축"],
        [TOPIC_IDS.GENERAL]: ["80년대 퀴즈", "90년대 퀴즈", "위대한 발명", "세계 수도", "화폐 단위", "노벨상", "공포증", "브랜드 로고", "암호화폐", "바이럴 트렌드", "보드게임", "카드게임", "슈퍼히어로", "고전 장난감", "칵테일", "자동차 브랜드"],
        [TOPIC_IDS.GEOGRAPHY]: ["수도 이름", "랜드마크", "산맥", "강과 호수", "사막", "섬", "화산", "국기", "인구 통계", "기후대", "대양", "미국 주", "유럽 국가", "아시아 도시", "아프리카 국가", "국경선"],
        [TOPIC_IDS.MOVIES]: ["아카데미상", "SF 영화", "공포 영화", "마블 시네마틱 유니버스", "스타워즈", "픽사", "80년대 영화", "90년대 영화", "유명 감독", "영화 OST", "컬트 영화", "애니메이션 영화", "프랑스 영화", "무성 영화", "특수 효과", "영화 속 악당"],
        [TOPIC_IDS.MUSIC]: ["록앤롤", "팝 음악", "재즈", "클래식", "힙합", "K-Pop", "EDM", "헤비메탈", "블루스", "컨트리", "오페라", "악기", "90년대 히트곡", "원히트 원더", "음악 이론", "우드스탁"],
        [TOPIC_IDS.GAMING]: ["닌텐도", "플레이스테이션", "Xbox", "PC 게임", "RPG", "FPS", "아케이드 고전", "레트로 게임", "E스포츠", "마인크래프트", "포켓몬", "젤다의 전설", "슈퍼 마리오", "인디 게임", "스피드런", "MMORPG"],
        [TOPIC_IDS.SPORTS]: ["축구", "농구", "야구", "테니스", "골프", "F1", "올림픽", "복싱", "UFC/MMA", "크리켓", "럭비", "수영", "동계 스포츠", "스케이트보드", "프로레슬링", "월드컵"],
        [TOPIC_IDS.TECH]: ["인공지능", "스마트폰", "인터넷 역사", "소셜 미디어", "코딩", "사이버 보안", "우주 기술", "VR/AR", "블록체인", "로봇", "컴퓨터 하드웨어", "빅데이터", "스타트업", "해커", "게이밍 기어", "5G 통신"],
        [TOPIC_IDS.MYTHOLOGY]: ["그리스 신화", "북유럽 신화", "이집트 신화", "로마 신화", "일본 요괴", "중국 신화", "켈트 신화", "아즈텍 신화", "힌두 신화", "북미 원주민 신화", "전설의 괴물", "영웅 서사시", "저승/사후세계", "창조 신화", "전쟁의 신", "트릭스터"],
        [TOPIC_IDS.LITERATURE]: ["셰익스피어", "고전 소설", "디스토피아", "판타지 소설", "SF 소설", "시", "공포 소설", "추리 소설", "만화", "노벨 문학상", "동화", "그리스 서사시", "러시아 문학", "미국 문학", "영국 문학", "희곡 작가"],
        [TOPIC_IDS.NATURE]: ["포유류", "조류", "곤충", "해양 생물", "공룡", "열대 우림", "사막 생태계", "날씨", "꽃", "나무", "국립공원", "생존 기술", "진화", "멸종 위기종", "균류(버섯)", "보석과 광물"],
        [TOPIC_IDS.FOOD]: ["이탈리아 요리", "프랑스 요리", "멕시코 음식", "일본 요리", "중국 요리", "인도 요리", "디저트", "와인", "커피", "치즈", "향신료", "길거리 음식", "패스트푸드", "제과 제빵", "비건", "칵테일 레시피"],
        [TOPIC_IDS.SPACE]: ["태양계", "블랙홀", "화성", "달 착륙", "별자리", "항성", "은하", "우주비행사", "우주 경쟁", "망원경", "외계 행성", "중력", "로켓", "외계 지적생명체", "국제우주정거장", "빅뱅 이론"],
        [TOPIC_IDS.PHILOSOPHY]: ["윤리학", "논리학", "형이상학", "실존주의", "스토아 학파", "허무주의", "정치 철학", "동양 철학", "고대 그리스", "계몽주의", "공리주의", "미학", "인식론", "심리 철학", "철학 명언", "역설"],
        [TOPIC_IDS.CUSTOM]: []
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
