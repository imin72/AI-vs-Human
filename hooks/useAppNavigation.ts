import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 종료 진행 중인지 체크하는 플래그 (중복 실행 방지)
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

  const stateRef = useRef({ stage, selectionPhase });
  useEffect(() => {
    stateRef.current = { stage, selectionPhase };
  }, [stage, selectionPhase]);

  // --- [핵심] 강력한 히스토리 트랩 로직 ---
  useEffect(() => {
    // 1. 진입 시 트랩 설치
    if (!window.history.state || window.history.state.key !== 'trap') {
      window.history.replaceState({ key: 'root' }, '');
      window.history.pushState({ key: 'trap' }, '');
    }

    const handlePopState = (_: PopStateEvent) => {
      // 이미 종료 프로세스가 진행 중이면 간섭하지 않음
      if (isExitingRef.current) return;

      // ★ [무조건 방어] ★
      // 어떤 화면이든 뒤로가기가 감지되면, 즉시 다시 트랩을 깔아서 '물리적인 이탈'을 막습니다.
      // 이렇게 하면 stage 상태가 꼬여도 앱이 꺼지는 일은 절대 없습니다.
      window.history.pushState({ key: 'trap' }, '');

      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // 비동기로 UI 로직 수행
      setTimeout(() => {
        // [상황 A] Intro 화면: 종료 시도
        if (stage === AppStage.INTRO) {
          if (window.confirm(confirmExitMsg)) {
             // [종료 확정]
             isExitingRef.current = true;
             
             // 방금 우리가 pushState로 트랩을 다시 깔았으므로(현재 위치), 
             // 앱을 나가려면 '새로 깐 트랩' + '원래 있던 루트' = 총 2칸을 뒤로 가야 합니다.
             // 이 방법이 무한 루프 없이 확실하게 나가는 방법입니다.
             const len = window.history.length;
             if (len > 2) window.history.go(-2);
             else window.history.back();
             
             if (onExitApp) onExitApp();
             try { window.close(); } catch {}
          }
          // 취소하면? 이미 맨 위에서 pushState로 막아뒀으니 아무것도 안 해도 됨 (현상 유지)
          return;
        }

        // [상황 B] 퀴즈/결과 화면: 홈 이동 확인
        if (stage === AppStage.QUIZ || stage === AppStage.RESULTS || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING || stage === AppStage.ERROR) {
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
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); 

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

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