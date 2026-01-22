
import { Language, Difficulty, TOPIC_IDS } from '../types';

export interface TranslationData {
  common: {
    btn_back: string;
    confirm_exit: string;
  };
  intro: {
    human_label: string;
    ai_label: string;
    title: string;
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
    nationalities: { other: string };
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
    confirm_exit: "Are you sure you want to exit the quiz? Progress will be lost."
  },
  intro: {
    human_label: "HUMAN",
    ai_label: "AI",
    title: "Challenge the AI!",
    desc: "Select a field of expertise and prove that human intuition still reigns supreme.",
    btn_start: "Start Test"
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
    btn_refresh: "Shuffle",
    label_custom: "",
    ph_custom: "",
    label_field: "SPECIFIC FIELD",
    label_difficulty: "DIFFICULTY",
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
    chart: { accuracy: "Accuracy", speed: "Speed", cohort: "Cohort", logic: "Logic", intuition: "Intuition" }
  },
  loading: { gen_vectors: "Generating test vectors...", analyzing: "AI is analyzing performance..." },
  difficulty: { [Difficulty.EASY]: "Novice", [Difficulty.MEDIUM]: "Competent", [Difficulty.HARD]: "Expert" },
  error: { title: "System Failure", btn_reset: "System Reset" }
};

const KO_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "뒤로", confirm_exit: "퀴즈를 종료하시겠습니까? 진행 상황이 손실됩니다." },
  intro: { 
    human_label: "인간", 
    ai_label: "인공지능", 
    title: "AI에 도전하세요!",
    desc: "전문 분야를 선택하고 인간의 직관이 여전히 우위임을 증명하십시오.", 
    btn_start: "테스트 시작" 
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
    title_select: "영역 선택", title_config: "세부 분야 선택", btn_refresh: "새로고침", label_custom: "", ph_custom: "", label_field: "세부 분야", label_difficulty: "난이도", btn_start_sim: "테스트 시작",
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
    chart: { accuracy: "정확도", speed: "속도", cohort: "집단위치", logic: "논리력", intuition: "직관력" }
  },
  loading: { gen_vectors: "테스트 벡터 생성 중...", analyzing: "AI 성능 분석 중..." },
  difficulty: { [Difficulty.EASY]: "초급", [Difficulty.MEDIUM]: "중급", [Difficulty.HARD]: "고급" },
  error: { title: "시스템 오류", btn_reset: "시스템 재설정" }
};

const JA_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "戻る", confirm_exit: "クイズを終了しますか？進行状況は失われます。" },
  intro: { 
    human_label: "人間", 
    ai_label: "AI", 
    title: "AIに挑戦せよ！",
    desc: "専門分野を選択し、人間の直感がいまだに優位であることを証明してください。", 
    btn_start: "テスト開始" 
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
    title_select: "ドメイン選択", title_config: "詳細分野の選択", btn_refresh: "更新", label_custom: "", ph_custom: "", label_field: "特定分野", label_difficulty: "難易度", btn_start_sim: "テスト開始",
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
      [TOPIC_IDS.SPACE]: ["太陽系", "ブラックホール", "火星", "月面着陸", "星座", "星", "銀河", "宇宙飛行士", "宇宙開発競争", "망원경", "系外惑星", "重力", "ロケット", "SETI", "国際宇宙ステーション", "ビッグバン"],
      [TOPIC_IDS.PHILOSOPHY]: ["倫理学", "論理学", "形而上学", "実存主義", "ストア派", "虚無主義", "政治哲学", "東洋哲学", "古代ギリシャ", "啓術主義", "功利主義", "美学", "認識論", "心の哲学", "有名な名言", "パラドックス"]
    }
  },
  quiz: { 
    label_target: "ターゲット", label_info: "情報", 
    btn_next: "次の問題", 
    btn_finish: "結果分析",
    btn_analyze: "中間分析を実行",
    btn_start_next_topic_prefix: "",
    btn_start_next_topic_suffix: " テスト開始",
    ai_status: "AI STATUS",
    ai_calculating: "計算中...",
    ai_answer_found: "解答特定",
    ai_done: "AI完了"
  },
  results: {
    badge_complete: "分析完了", label_percentile: "グローバル偏差値", label_correct: "正解数", label_cohort: "集団分析", label_template: "結果テンプレート", label_bottom: "下位1%", label_top: "上位", btn_retry: "リトライ", btn_share: "結果を共有", btn_save: "画像を保存",
    btn_next_topic: "次のトピック:", 
    chart: { accuracy: "正確性", speed: "速度", cohort: "集団位置", logic: "論理", intuition: "直感" }
  },
  loading: { gen_vectors: "テストベクトル生成中...", analyzing: "AIがパフォーマンスを分析中..." },
  difficulty: { [Difficulty.EASY]: "初級", [Difficulty.MEDIUM]: "中級", [Difficulty.HARD]: "上級" },
  error: { title: "システムエラー", btn_reset: "リセット" }
};

const ES_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "Volver", confirm_exit: "¿Estás seguro de que quieres salir? Se perderá el progreso." },
  intro: { 
    human_label: "HUMANO", 
    ai_label: "IA", 
    title: "¡Desafía a la IA!",
    desc: "Selecciona un campo de especialización y demuestra que la intuición humana aún reina.", 
    btn_start: "Iniciar Prueba" 
  },
  profile: {
    title: "Perfil del Sujeto", desc: "Utilizado para la optimización del contexto cultural y educativo.",
    label_gender: "GÉNERO", label_age: "EDAD", label_nationality: "NACIONALIDAD", btn_submit: "Confirmar", skip: "Omitir",
    genders: { Male: "Masculino", Female: "Femenino", Other: "Otro" },
    ages: { "Under 18": "< 18", "18-24": "18-24", "25-34": "25-34", "35-44": "35-44", "45-54": "45-54", "55+": "55+" },
    nationalities: { other: "Seleccionar otro país..." }
  },
  topics: {
    ...ENGLISH_BASE.topics,
    title_select: "Seleccionar Dominio", title_config: "Seleccionar Subtema", btn_refresh: "Mezclar", label_custom: "", ph_custom: "", label_field: "CAMPO ESPECÍFICO", label_difficulty: "DIFICULTAD", btn_start_sim: "Iniciar Prueba",
    categories: {
      [TOPIC_IDS.HISTORY]: "Historia", [TOPIC_IDS.SCIENCE]: "Ciencia", [TOPIC_IDS.ARTS]: "Artes", [TOPIC_IDS.GENERAL]: "Cultura General", [TOPIC_IDS.GEOGRAPHY]: "Geografía", [TOPIC_IDS.MOVIES]: "Cine", [TOPIC_IDS.MUSIC]: "Música", [TOPIC_IDS.GAMING]: "Videojuegos", [TOPIC_IDS.SPORTS]: "Deportes", [TOPIC_IDS.TECH]: "Tecnología", [TOPIC_IDS.MYTHOLOGY]: "Mitología", [TOPIC_IDS.LITERATURE]: "Literatura", [TOPIC_IDS.NATURE]: "Naturaleza", [TOPIC_IDS.FOOD]: "Gastronomía", [TOPIC_IDS.SPACE]: "Espacio", [TOPIC_IDS.PHILOSOPHY]: "Filosofía"
    },
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["Antiguo Egipto", "Imperio Romano", "Segunda Guerra Mundial", "Guerra Fría", "Renacimiento", "Revolución Industrial", "Revolución Francesa", "Guerra Civil Americana", "Japón Feudal", "Vikingos", "Imperio Azteca", "Imperio Mongol", "Cruzadas", "Era Victoriana", "Prehistoria", "Descolonización"],
      [TOPIC_IDS.SCIENCE]: ["Física Cuántica", "Genética", "Química Orgánica", "Neurociencia", "Botánica", "Astronomía", "Geología", "Termodinámica", "Biología Marina", "Evolución", "Física de Partículas", "Inmunología", "Paleontología", "Meteorología", "Robótica", "Ecología"],
      [TOPIC_IDS.ARTS]: ["Impresionismo", "Arte del Renacimiento", "Cubismo", "Surrealismo", "Barroco", "Modernismo", "Escultura", "Diseño Gráfico", "Historia de la Moda", "Fotografía", "Teatro", "Ópera", "Expresionismo Abstracto", "Alfarería", "Caligrafía", "Arquitectura Gótica"],
      [TOPIC_IDS.GENERAL]: ["Trivia de los 80", "Trivia de los 90", "Inventos", "Capitales del Mundo", "Monedas", "Premios Nobel", "Fobias", "Logos de Marcas", "Criptomonedas", "Tendencias Virales", "Juegos de Mesa", "Juegos de Cartas", "Superhéroes", "Juguetes Clásicos", "Cócteles", "Marcas de Autos"],
      [TOPIC_IDS.GEOGRAPHY]: ["Capitales", "Monumentos", "Montañas", "Ríos", "Desiertos", "Islas", "Volcanos", "Banderas", "Demografía", "Zonas Climáticas", "Océanos", "Estados de EE.UU.", "Países Europeos", "Ciudades Asiáticas", "Naciones Africanas", "Fronteras"],
      [TOPIC_IDS.MOVIES]: ["Oscars", "Ciencia Ficción", "Terror", "Universo Cinematográfico de Marvel", "Star Wars", "Pixar", "Cine de los 80", "Cine de los 90", "Directores Famosos", "Bandas Sonoras", "Clásicos de Culto", "Películas de Anime", "Cine Francés", "Era del Cine Mudo", "Efectos Especiales", "Villanos de Cine"],
      [TOPIC_IDS.MUSIC]: ["Rock & Roll", "Pop", "Jazz", "Clásica", "Hip Hop", "K-Pop", "EDM", "Heavy Metal", "Blues", "Country", "Ópera (Música)", "Instrumentos Musicales", "Éxitos de los 90", "One Hit Wonders", "Teoría Musical", "Woodstock"],
      [TOPIC_IDS.GAMING]: ["Nintendo (es)", "PlayStation", "Xbox", "PC Gaming", "RPG", "FPS", "Clásicos de Arcade", "Retro Gaming", "eSports", "Minecraft", "Pokemon", "Zelda", "Mario", "Juegos Indie", "Speedrunning", "MMO"],
      [TOPIC_IDS.SPORTS]: ["Fútbol", "Baloncesto", "Béisbol", "Tenis", "Golf", "Fórmula 1", "Juegos Olímpicos", "Boxeo", "MMA", "Cricket", "Rugby", "Natación", "Deportes de Invierno", "Skateboarding", "Lucha Libre", "Copa del Mundo"],
      [TOPIC_IDS.TECH]: ["Inteligencia Artificial", "Smartphones", "Historia del Internet", "Redes Sociales", "Programación", "Ciberseguridad", "Tecnología Espacial", "VR/AR", "Blockchain", "Robots", "Hardware de PC", "Big Data", "Startups", "Hackers", "Tecnología Gaming", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["Mitología Griega", "Mitología Nórdica", "Mitología Egipcia", "Mitología Romana", "Folklore Japonés", "Mitología China", "Mitología Celta", "Mitología Azteca", "Mitología Hindú", "Nativos Americanos", "Monstruos Legendarios", "Héroes Épicos", "Inframundos", "Mitos de Creación", "Dioses de la Guerra", "Tricksters"],
      [TOPIC_IDS.LITERATURE]: ["Shakespeare", "Novelas Clásicas", "Ficción Distópica", "Fantasía", "Libros de Ciencia Ficción", "Poesía", "Terror (Libros)", "Misterio", "Cómics y Manga", "Premios Nobel (Lit)", "Cuentos de Hadas", "Épica Griega", "Literatura Rusa", "Literatura Americana", "Literatura Británica", "Dramaturgos"],
      [TOPIC_IDS.NATURE]: ["Mamíferos", "Aves", "Insectos", "Vida Marina", "Dinosaurios", "Selvas Tropicales", "Desiertos (Naturaleza)", "Clima", "Flores", "Árboles", "Parques Nacionales", "Supervivencia", "Evolución (Nat)", "Especies en Peligro", "Hongos", "Gemas y Minerales"],
      [TOPIC_IDS.FOOD]: ["Cocina Italiana", "Cocina Francesa", "Comida Mexicana", "Comida Japonesa", "Comida China", "Comida India", "Postres", "Vino", "Café", "Queso", "Especias", "Comida Callejera", "Comida Rápida", "Repostería", "Vegano", "Cócteles (Food)"],
      [TOPIC_IDS.SPACE]: ["Sistema Solar", "Agujeros Negros", "Marte", "Alunizaje", "Constelaciones", "Estrellas", "Galaxias", "Astronautas", "Carrera Espacial", "Telescopios", "Exoplanetas", "Gravedad", "Cohetes", "SETI", "ISS", "Big Bang"],
      [TOPIC_IDS.PHILOSOPHY]: ["Ética", "Lógica", "Metafísica", "Existencialismo", "Estoicismo", "Nihilismo", "Filosofía Política", "Filosofía Oriental", "Grecia Antigua", "Ilustración", "Utilitarismo", "Estética", "Epistemología", "Filosofía de la Mente", "Frases Famosas", "Paradojas"]
    }
  },
  quiz: { 
    label_target: "Objetivo", label_info: "INFO", 
    btn_next: "Siguiente Pregunta", 
    btn_finish: "Analizar Resultados",
    btn_analyze: "Analizar Segmento",
    btn_start_next_topic_prefix: "Iniciar Prueba de ",
    btn_start_next_topic_suffix: "",
    ai_status: "AI STATUS",
    ai_calculating: "CALCULANDO...",
    ai_answer_found: "RESPUESTA ENCONTRADA",
    ai_done: "IA LISTA"
  },
  results: {
    badge_complete: "Análisis Completo", label_percentile: "Percentil Global", label_correct: "Aciertos", label_cohort: "Análisis de Cohorte", label_template: "Plantilla de Resultado", label_bottom: "Mínimo 1%", label_top: "Top", btn_retry: "Reintentar", btn_share: "Compartir", btn_save: "Guardar Imagen",
    btn_next_topic: "Continuar a", 
    chart: { accuracy: "Precisión", speed: "Velocidad", cohort: "Cohorte", logic: "Lógica", intuition: "Intuición" }
  },
  loading: { gen_vectors: "Generando vectores de prueba...", analyzing: "Análisis de IA en curso..." },
  difficulty: { [Difficulty.EASY]: "Novato", [Difficulty.MEDIUM]: "Competente", [Difficulty.HARD]: "Experto" },
  error: { title: "Error del Sistema", btn_reset: "Reiniciar" }
};

const FR_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "Retour", confirm_exit: "Voulez-vous vraiment quitter ? La progression sera perdue." },
  intro: { 
    human_label: "HUMAIN", 
    ai_label: "IA", 
    title: "Défiez l'IA !",
    desc: "Sélectionnez un domaine d'expertise et prouvez que l'intuition humaine règne toujours.", 
    btn_start: "Commencer le Test" 
  },
  profile: {
    title: "Profil du Sujet", desc: "Utilisé pour l'optimisation du contexte culturel et éducatif.",
    label_gender: "GENRE", label_age: "GROUPE D'ÂGE", label_nationality: "NATIONALITÉ", btn_submit: "Confirmer le Profil", skip: "Passer & Continuer",
    genders: { Male: "Homme", Female: "Femme", Other: "Autre" },
    ages: { "Under 18": "< 18", "18-24": "18-24", "25-34": "25-34", "35-44": "35-44", "45-54": "45-54", "55+": "55+" },
    nationalities: { other: "Sélectionner un autre pays..." }
  },
  topics: {
    ...ENGLISH_BASE.topics,
    title_select: "Sélectionner Domaine", title_config: "Sélectionner Sous-thème", btn_refresh: "Mélanger", label_custom: "", ph_custom: "", label_field: "DOMAINE SPÉCIFIQUE", label_difficulty: "DIFFICULTÉ", btn_start_sim: "Commencer le Test",
    categories: {
      [TOPIC_IDS.HISTORY]: "Histoire", [TOPIC_IDS.SCIENCE]: "Sciences", [TOPIC_IDS.ARTS]: "Arts", [TOPIC_IDS.GENERAL]: "Culture Générale", [TOPIC_IDS.GEOGRAPHY]: "Géographie", [TOPIC_IDS.MOVIES]: "Cinéma", [TOPIC_IDS.MUSIC]: "Musique", [TOPIC_IDS.GAMING]: "Jeux Vidéo", [TOPIC_IDS.SPORTS]: "Sports", [TOPIC_IDS.TECH]: "Technologie", [TOPIC_IDS.MYTHOLOGY]: "Mythologie", [TOPIC_IDS.LITERATURE]: "Littérature", [TOPIC_IDS.NATURE]: "Nature", [TOPIC_IDS.FOOD]: "Gastronomie", [TOPIC_IDS.SPACE]: "Espace", [TOPIC_IDS.PHILOSOPHY]: "Philosophie"
    },
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["Égypte Antique", "Empire Romain", "Seconde Guerre Mondiale", "Guerre Froide", "Renaissance", "Révolution Industrielle", "Révolution Française", "Guerre de Sécession", "Japon Féodal", "Vikings", "Empire Aztèque", "Empire Mongol", "Croisades", "Ère Victorienne", "Préhistoire", "Décolonisation"],
      [TOPIC_IDS.SCIENCE]: ["Physique Quantique", "Génétique", "Chimie Organique", "Neuroscience", "Botanique", "Astronomie", "Géologie", "Thermodynamique", "Biologie Marine", "Évolution", "Physique des Particules", "Immunologie", "Paléontologie", "Météorologie", "Robotique", "Écologie"],
      [TOPIC_IDS.ARTS]: ["Impressionnisme", "Art Renaissance", "Cubisme", "Surréalisme", "Barroco", "Modernismo", "Sculpture", "Design Graphique", "Histoire de la Mode", "Photographie", "Théâtre", "Opéra", "Expressionnisme Abstrait", "Poterie", "Calligraphie", "Architecture Gothique"],
      [TOPIC_IDS.GENERAL]: ["Trivia Années 80", "Trivia Années 90", "Inventions", "Capitales Mondiales", "Monnaies", "Prix Nobel", "Phobies", "Logos de Marques", "Cryptomonnaie", "Tendencias Virales", "Jeux de Plateau", "Jeux de Cartes", "Super-héros", "Jouets Classiques", "Cocktails", "Marques de Voitures"],
      [TOPIC_IDS.GEOGRAPHY]: ["Capitales", "Monuments", "Montagnes", "Rivières", "Déserts", "Îles", "Volcans", "Drapeaux", "Démographie", "Zones Climatiques", "Océans", "États des USA", "Pays Européens", "Villes Asiatiques", "Nations Africaines", "Frontières"],
      [TOPIC_IDS.MOVIES]: ["Oscars", "Science-Fiction", "Horreur", "Univers Cinématographique Marvel", "Star Wars", "Pixar", "Films Années 80", "Films Années 90", "Réalisateurs Célèbres", "Bandes Originales", "Films Cultes", "Films d'Animation", "Cinéma Français", "Cinéma Muet", "Effets Spéciaux", "Méchants de Cinéma"],
      [TOPIC_IDS.MUSIC]: ["Rock & Roll", "Pop", "Jazz", "Classique", "Hip Hop", "K-Pop", "EDM", "Heavy Metal", "Blues", "Country", "Opéra", "Instruments", "Hits Années 90", "Succès Sans Lendemain", "Théorie Musicale", "Woodstock"],
      [TOPIC_IDS.GAMING]: ["Nintendo", "PlayStation", "Xbox", "Jeux PC", "RPG", "FPS", "Classiques Arcade", "Rétrogaming", "Esports", "Minecraft", "Pokemon", "Zelda", "Mario", "Jeux Indés", "Speedrun", "MMO"],
      [TOPIC_IDS.SPORTS]: ["Football", "Basket-ball", "Baseball", "Tennis", "Golf", "Formule 1", "Jeux Olympiques", "Boxe", "MMA", "Cricket", "Rugby", "Natación", "Sports d'Hiver", "Skateboard", "Lutte", "Coupe du Monde"],
      [TOPIC_IDS.TECH]: ["Intelligence Artificielle", "Smartphones", "Histoire d'Internet", "Réseaux Sociaux", "Codage", "Cybersécurité", "Tech Spatiale", "VR/AR", "Blockchain", "Robots", "Matériel Informatique", "Big Data", "Startups", "Hackers", "Tech Gaming", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["Mythologie Grecque", "Mythologie Nordique", "Mythologie Égyptienne", "Mythologie Romaine", "Folklore Japonais", "Mythologie Chinoise", "Mythologie Celtique", "Mythologie Aztèque", "Mythologie Hindoue", "Amérindiens", "Monstres Légendaires", "Héroes Épiques", "Enfers", "Mythes de Création", "Dieux de la Guerre", "Tricksters"],
      [TOPIC_IDS.LITERATURE]: ["Shakespeare", "Romans Classiques", "Fiction Dystopique", "Fantasy", "Livres SF", "Poésie", "Horreur", "Mystère", "BD & Manga", "Prix Nobel (Litt)", "Contes de Fées", "Épopées Grecques", "Littérature Russe", "Littérature Américaine", "Littérature Britannique", "Dramaturges"],
      [TOPIC_IDS.NATURE]: ["Mammifères", "Oiseaux", "Insectes", "Vie Marine", "Dinosaures", "Forêts Tropicales", "Déserts", "Météo", "Fleurs", "Arbres", "Parques Nationaux", "Survie", "Évolution", "Espèces en Danger", "Champignons", "Gemmes & Minéraux"],
      [TOPIC_IDS.FOOD]: ["Cuisine Italienne", "Cuisine Française", "Cuisine Mexicaine", "Cuisine Japonaise", "Cuisine Chinoise", "Cuisine Indienne", "Desserts", "Vin", "Café", "Fromage", "Épices", "Street Food", "Fast Food", "Pâtisserie", "Végan", "Cocktails"],
      [TOPIC_IDS.SPACE]: ["Système Solaire", "Trous Noirs", "Mars", "Atterrissage Lunaire", "Constellations", "Étoiles", "Galaxies", "Astronautes", "Course à l'Espace", "Télescopes", "Exoplanètes", "Gravité", "Fusées", "SETI", "ISS", "Big Bang"],
      [TOPIC_IDS.PHILOSOPHY]: ["Éthique", "Logique", "Métaphysique", "Existentialisme", "Stoïcisme", "Nihilismo", "Philosophie Politique", "Philosophie Orientale", "Grèce Antique", "Lumières", "Utilitarisme", "Esthétique", "Épistémologie", "Philosophie de l'Esprit", "Citations Célèbres", "Paradoxes"]
    }
  },
  quiz: { 
    label_target: "Cible", label_info: "INFO", 
    btn_next: "Question Suivante", 
    btn_finish: "Analyser Résultats",
    btn_analyze: "Analyser le Segment",
    btn_start_next_topic_prefix: "Commencer le Test ",
    btn_start_next_topic_suffix: "",
    ai_status: "AI STATUS",
    ai_calculating: "CALCUL EN COURS...",
    ai_answer_found: "RÉPONSE TROUVÉE",
    ai_done: "IA TERMINÉE"
  },
  results: {
    badge_complete: "Analyse Terminée", label_percentile: "Percentile Global", label_correct: "Réponses Correctes", label_cohort: "Analyse de Cohorte", label_template: "Modèle de Résultat", label_bottom: "Bas 1%", label_top: "Haut", btn_retry: "Réessayer", btn_share: "Partager", btn_save: "Sauvegarder",
    btn_next_topic: "Continuer vers", 
    chart: { accuracy: "Précision", speed: "Vitesse", cohort: "Cohorte", logic: "Logique", intuition: "Intuition" }
  },
  loading: { gen_vectors: "Génération des vecteurs de test...", analyzing: "Analyse des performances par l'IA..." },
  difficulty: { [Difficulty.EASY]: "Novice", [Difficulty.MEDIUM]: "Compétent", [Difficulty.HARD]: "Expert" },
  error: { title: "Échec Système", btn_reset: "Réinitialiser" }
};

const ZH_TRANSLATIONS: TranslationData = {
  ...ENGLISH_BASE,
  common: { btn_back: "返回", confirm_exit: "确定要退出测验吗？进度将会丢失。" },
  intro: { 
    human_label: "人类", 
    ai_label: "人工智能", 
    title: "挑战 AI！",
    desc: "选择一个专业领域，证明人类直觉依然至高无上。", 
    btn_start: "开始测试" 
  },
  profile: {
    title: "受试者档案", desc: "用于优化文化和教育背景。",
    label_gender: "性别", label_age: "年龄组", label_nationality: "国籍", btn_submit: "确认档案", skip: "跳过并继续",
    genders: { Male: "男性", Female: "女性", Other: "其他" },
    ages: { "Under 18": "18岁以下", "18-24": "18-24岁", "25-34": "25-34岁", "35-44": "35-44岁", "45-54": "45-54岁", "55+": "55岁以上" },
    nationalities: { other: "选择其他国家..." }
  },
  topics: {
    ...ENGLISH_BASE.topics,
    title_select: "选择领域", title_config: "选择子主题", btn_refresh: "刷新", label_custom: "", ph_custom: "", label_field: "特定领域", label_difficulty: "难度", btn_start_sim: "开始测试",
    categories: {
      [TOPIC_IDS.HISTORY]: "历史", [TOPIC_IDS.SCIENCE]: "科学", [TOPIC_IDS.ARTS]: "艺术", [TOPIC_IDS.GENERAL]: "一般常识", [TOPIC_IDS.GEOGRAPHY]: "地理", [TOPIC_IDS.MOVIES]: "电影", [TOPIC_IDS.MUSIC]: "音乐", [TOPIC_IDS.GAMING]: "游戏", [TOPIC_IDS.SPORTS]: "体育", [TOPIC_IDS.TECH]: "科技", [TOPIC_IDS.MYTHOLOGY]: "神话", [TOPIC_IDS.LITERATURE]: "文学", [TOPIC_IDS.NATURE]: "自然", [TOPIC_IDS.FOOD]: "美食", [TOPIC_IDS.SPACE]: "太空", [TOPIC_IDS.PHILOSOPHY]: "哲学"
    },
    subtopics: {
      [TOPIC_IDS.HISTORY]: ["古埃及", "罗马帝国", "第二次世界大战", "冷战", "文艺复兴", "工业革命", "法国大革命", "美国内战", "封建日本", "维京人", "阿兹特克帝国", "蒙古帝国", "十字军东征", "维多利亚时代", "史前时代", "非殖民化"],
      [TOPIC_IDS.SCIENCE]: ["量子物理", "遗传学", "有机化学", "神经科学", "植物学", "天文学", "地质学", "热力学", "海洋生物学", "进化论", "粒子物理学", "免疫学", "古生物学", "气象学", "机器人学", "生态学"],
      [TOPIC_IDS.ARTS]: ["印象派", "文艺复兴艺术", "立体主义", "超现实主义", "巴洛克", "现代主义", "雕塑", "平面设计", "时尚史", "摄影", "戏剧", "歌剧", "抽象表现主义", "陶艺", "书法", "哥特式建筑"],
      [TOPIC_IDS.GENERAL]: ["80年代趣闻", "90年代趣闻", "发明", "世界首都", "货币", "诺贝尔奖", "恐惧症", "品牌标志", "加密货币", "病毒式趋势", "棋盘游戏", "纸牌游戏", "超级英雄", "经典玩具", "鸡尾酒", "汽车品牌"],
      [TOPIC_IDS.GEOGRAPHY]: ["首都", "地标", "山脉", "河流", "沙漠", "岛屿", "火山", "国旗", "人口统计", "气候带", "海洋", "美国各州", "欧洲国家", "亚洲城市", "非洲国家", "边界"],
      [TOPIC_IDS.MOVIES]: ["奥斯卡", "科幻", "恐怖", "漫威电影宇宙", "星球大战", "皮克斯", "80年代电影", "90年代电影", "著名导演", "电影原声带", "邪典电影", "动画电影", "法国电影", "默片时代", "特效", "电影反派"],
      [TOPIC_IDS.MUSIC]: ["摇滚乐", "流行音乐", "爵士乐", "古典音乐", "嘻哈", "K-Pop", "电子舞曲", "重金属", "蓝调", "乡村音乐", "歌剧", "乐器", "90年代金曲", "昙花一现", "乐理", "伍德斯托克"],
      [TOPIC_IDS.GAMING]: ["任天堂", "PlayStation", "Xbox", "PC游戏", "角色扮演游戏", "第一人称射击", "街机经典", "复古游戏", "电子竞技", "我的世界", "宝可梦", "塞尔达", "马里奥", "独立游戏", "速通", "大型多人在线"],
      [TOPIC_IDS.SPORTS]: ["足球", "篮球", "棒球", "网球", "高尔夫", "一级方程式", "奥运会", "拳击", "综合格斗", "板球", "橄榄球", "游泳", "冬季运动", "滑板", "摔跤", "世界杯"],
      [TOPIC_IDS.TECH]: ["人工智能", "智能手机", "互联网历史", "社交媒体", "编程", "网络安全", "太空技术", "VR/AR", "区块链", "机器人", "计算机硬件", "大数据", "初创公司", "黑客", "游戏技术", "5G"],
      [TOPIC_IDS.MYTHOLOGY]: ["希腊神话", "北欧神话", "埃及神话", "罗马神话", "日本传说", "中国神话", "凯尔特神话", "阿兹特克神话", "印度神话", "美洲原住民", "传说怪物", "史诗英雄", "冥界", "创世神话", "战神", "捣蛋鬼"],
      [TOPIC_IDS.LITERATURE]: ["莎士比亚", "经典小说", "反乌托邦小说", "奇幻", "科幻书籍", "诗歌", "恐怖", "悬疑", "漫画", "诺贝尔文学奖", "童话", "希腊史诗", "俄罗斯文学", "美国文学", "英国文学", "剧作家"],
      [TOPIC_IDS.NATURE]: ["哺乳动物", "鸟类", "昆虫", "海洋生物", "恐龙", "雨林", "沙漠", "天气", "花卉", "树木", "国家公园", "生存技能", "进化", "濒危物种", "真菌", "宝石与矿物"],
      [TOPIC_IDS.FOOD]: ["意大利菜", "法国菜", "墨西哥菜", "日本菜", "中国菜", "印度菜", "甜点", "葡萄酒", "咖啡", "奶酪", "香料", "街头小吃", "快餐", "烘焙", "素食", "鸡尾酒"],
      [TOPIC_IDS.SPACE]: ["太阳系", "黑洞", "火星", "登月", "星座", "恒星", "星系", "宇航员", "太空竞赛", "望远镜", "系外行星", "重力", "火箭", "搜寻地外文明", "国际空间站", "大爆炸"],
      [TOPIC_IDS.PHILOSOPHY]: ["伦理学", "逻辑学", "形而上学", "存在主义", "斯多葛学派", "虚无主义", "政治哲学", "东方哲学", "古希腊", "启蒙运动", "功利主义", "美学", "认识论", "心灵哲学", "名言", "悖论"]
    }
  },
  quiz: { 
    label_target: "目标", label_info: "信息", 
    btn_next: "下一题", 
    btn_finish: "分析结果",
    btn_analyze: "分析片段",
    btn_start_next_topic_prefix: "开始 ",
    btn_start_next_topic_suffix: " 测试",
    ai_status: "AI STATUS",
    ai_calculating: "计算中...",
    ai_answer_found: "答案已生成",
    ai_done: "AI 完成"
  },
  results: {
    badge_complete: "分析完成", label_percentile: "全球百分位", label_correct: "正确答案", label_cohort: "群体分析", label_template: "结果模板", label_bottom: "后 1%", label_top: "前", btn_retry: "重试", btn_share: "分享结果", btn_save: "保存图片",
    btn_next_topic: "继续", 
    chart: { accuracy: "准确度", speed: "速度", cohort: "群体", logic: "逻辑", intuition: "直觉" }
  },
  loading: { gen_vectors: "生成测试向量...", analyzing: "AI 正在分析表现..." },
  difficulty: { [Difficulty.EASY]: "新手", [Difficulty.MEDIUM]: "胜任", [Difficulty.HARD]: "专家" },
  error: { title: "系统故障", btn_reset: "系统重置" }
};

export const TRANSLATIONS: Record<Language, TranslationData> = {
  en: ENGLISH_BASE,
  ko: KO_TRANSLATIONS,
  ja: JA_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  fr: FR_TRANSLATIONS,
  zh: ZH_TRANSLATIONS
};
