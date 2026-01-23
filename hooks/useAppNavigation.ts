import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 종료 프로세스 진행 중인지 체크 (중복 실행 방지)
  const isExitingRef = useRef(false);

  const callbacksRef = useRef({
    onExitApp: () => {},
    onResetQuiz: () => {},
    confirmExitMsg: "앱을 종료하시겠습니까?",
    confirmHomeMsg: "홈 화면으로 이동하시겠습니까? 진행 중인 내용은 초기화됩니다."
  });

  const updateCallbacks = useCallback((
    onExit: () => void, 
    onReset: () => void,
    exitMsg: string,
    homeMsg: string
  ) => {
    callbacksRef.current = { 
      onExitApp: onExit, 
      onResetQuiz: onReset, 
      confirmExitMsg: exitMsg, 
      confirmHomeMsg: homeMsg 
    };
  }, []);

  // 상태 참조 Ref (이벤트 리스너 내부용)
  const stateRef = useRef({ stage, selectionPhase });
  useEffect(() => {
    stateRef.current = { stage, selectionPhase };
  }, [stage, selectionPhase]);

  // --- [핵심] 더블 히스토리 트랩 (Double Trap) ---
  useEffect(() => {
    // 1. 초기화 시: 현재 상태를 저장하고, 트랩을 '2번' 쌓습니다.
    // 이렇게 하면 모바일에서 빠르게 뒤로가기를 연타해도 앱이 꺼지지 않습니다.
    // Stack: [Root, Trap1, Trap2]
    if (!window.history.state || window.history.state.key !== 'trap2') {
      window.history.replaceState({ key: 'root' }, '');
      window.history.pushState({ key: 'trap1' }, '');
      window.history.pushState({ key: 'trap2' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // 종료 중이면 간섭하지 않음
      if (isExitingRef.current) return;

      // 2. 뒤로가기 감지 시: 현재 위치를 확인하지 않고 무조건 다시 끝으로 밀어넣습니다.
      // (사용자가 뒤로가기를 눌러서 Trap1이나 Root로 갔을 때, 다시 Trap2로 강제 이동)
      window.history.pushState({ key: 'trap2' }, '');

      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // 3. 로직 수행 (비동기로 UI 블로킹 방지)
      setTimeout(() => {
        // [상황 A] Intro 화면: 앱 종료
        if (stage === AppStage.INTRO) {
          if (window.confirm(confirmExitMsg)) {
             isExitingRef.current = true;
             
             // [종료 로직]
             // 현재 우리는 방금 pushState를 해서 [Root, Trap1, Trap2(현재)]에 있습니다.
             // 앱을 나가려면 3칸을 뒤로 가야 안전합니다. (Root 이전으로)
             // 모바일/태블릿 호환성을 위해 go를 사용하되, 실패 시 back을 연타합니다.
             const len = window.history.length;
             if (len > 3) {
                 window.history.go(-3);
             } else {
                 // 히스토리 깊이가 얕을 경우 (바로가기로 실행 등)
                 window.history.back(); // Trap2 제거
                 setTimeout(() => window.history.back(), 50); // Trap1 제거
                 setTimeout(() => window.history.back(), 100); // Root 제거 -> 종료
             }
             
             if (onExitApp) onExitApp();
             try { window.close(); } catch {}
          }
          return;
        }

        // [상황 B] 퀴즈/결과 화면: 홈 이동
        const isGameActive = stage === AppStage.QUIZ || stage === AppStage.RESULTS || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING || stage === AppStage.ERROR;
        
        if (isGameActive) {
          if (window.confirm(confirmHomeMsg)) {
             setStage(AppStage.INTRO);
             setSelectionPhase('CATEGORY');
             if (onResetQuiz) onResetQuiz(); 
          }
          return;
        }

        // [상황 C] 영역 선택 (서브토픽 -> 카테고리)
        if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
          setSelectionPhase('CATEGORY');
          return;
        }

        // [상황 D] 그 외 -> 인트로로
        setStage(AppStage.INTRO);
        setSelectionPhase('CATEGORY');
      }, 10); // 모바일 터치 씹힘 방지를 위해 아주 짧은 딜레이(10ms) 추가
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); 

  // 수동 뒤로가기 (UI 버튼)
  const goBack = useCallback(() => {
    // 물리 버튼과 똑같이 동작하도록 history.back() 호출
    window.history.back();
  }, []);

  // 수동 홈 이동 (UI 버튼)
  const goHome = useCallback(() => {
     const { onResetQuiz, confirmHomeMsg } = callbacksRef.current;
     const currentStage = stateRef.current.stage;
     const needsConfirm = currentStage === AppStage.QUIZ || currentStage === AppStage.RESULTS;
     
     if (needsConfirm) {
        if(!window.confirm(confirmHomeMsg)) return;
     }
     
     setStage(AppStage.INTRO);
     setSelectionPhase('CATEGORY');
     if (onResetQuiz) onResetQuiz();
  }, []);

  return {
    stage,
    setStage,
    selectionPhase,
    setSelectionPhase,
    updateCallbacks,
    goBack,
    goHome
  };
};