import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 콜백 저장소
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

  // 상태 참조 Ref
  const stateRef = useRef({ stage, selectionPhase });
  useEffect(() => {
    stateRef.current = { stage, selectionPhase };
  }, [stage, selectionPhase]);

  // --- [핵심] 상태 기반 히스토리 가드 (State-Based History Guard) ---
  useEffect(() => {
    // 1. 초기화: 앱이 실행되면 현재 히스토리에 'app_active'라는 깃발을 꽂습니다.
    const ensureHistoryState = () => {
      if (!window.history.state || window.history.state.tag !== 'app_active') {
        window.history.replaceState({ tag: 'root' }, '');
        window.history.pushState({ tag: 'app_active' }, '');
      }
    };

    ensureHistoryState();

    const handlePopState = (_: PopStateEvent) => {
      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // [로직 A] 앱 종료 시도 (Intro 화면)
      if (stage === AppStage.INTRO) {
        if (window.confirm(confirmExitMsg)) {
          if (onExitApp) onExitApp();
          
          if (window.history.length > 1) {
            window.history.back();
          } else {
            try { window.close(); } catch {}
          }
        } else {
          // 취소 시 다시 가두기
          window.history.pushState({ tag: 'app_active' }, '');
        }
        return;
      }

      // [로직 B] 앱 내부 이동
      // 1. 일단 다시 가둡니다.
      window.history.pushState({ tag: 'app_active' }, '');

      // 2. 비동기로 UI 로직 수행
      setTimeout(() => {
        // B-1. 퀴즈/결과 화면 -> 홈 이동 확인
        const isGameActive = stage === AppStage.QUIZ || stage === AppStage.RESULTS || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING || stage === AppStage.ERROR;
        
        if (isGameActive) {
          if (window.confirm(confirmHomeMsg)) {
             setStage(AppStage.INTRO);
             setSelectionPhase('CATEGORY');
             if (onResetQuiz) onResetQuiz(); 
          }
          return;
        }

        // B-2. 영역 선택 (서브토픽 -> 카테고리)
        if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
          setSelectionPhase('CATEGORY');
          return;
        }

        // B-3. 그 외 -> 인트로로 복귀
        setStage(AppStage.INTRO);
        setSelectionPhase('CATEGORY');
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); 

  // 수동 뒤로가기
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  // 수동 홈 이동
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