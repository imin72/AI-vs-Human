import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
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

  // --- 히스토리 트랩 로직 개선 ---
  useEffect(() => {
    // 1. 진입 시 트랩 설치
    if (!window.history.state || window.history.state.key !== 'trap') {
      window.history.replaceState({ key: 'root' }, '');
      window.history.pushState({ key: 'trap' }, '');
    }

    const handlePopState = (_: PopStateEvent) => {
      // 주의: 여기서 무조건 pushState를 하면 종료가 안 됩니다.
      
      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // [상황 A] Intro 화면: 앱 종료 시도
      if (stage === AppStage.INTRO) {
        // 이미 뒤로가기가 눌려서 'trap'이 빠진 상태입니다.
        
        if (window.confirm(confirmExitMsg)) {
          // [종료 확정]
          // ★ 중요: 여기서 pushState를 하지 않습니다! (그래야 나갈 수 있음)
          
          // 추가적인 안전장치로 한 번 더 뒤로가기를 시도하여 확실히 이탈
          setTimeout(() => {
             window.history.back();
             if (onExitApp) onExitApp();
             try { window.close(); } catch {}
          }, 0);
        } else {
          // [종료 취소]
          // 다시 트랩을 씌워서 화면을 유지합니다.
          window.history.pushState({ key: 'trap' }, '');
        }
        return;
      }

      // [상황 B, C, D] Intro가 아닌 경우 (퀴즈, 결과, 선택화면 등)
      // 이 경우는 앱을 나가는 게 아니라 화면 내부 이동이므로,
      // ★ 반드시 다시 트랩을 씌워야 합니다 (Lock).
      window.history.pushState({ key: 'trap' }, '');

      setTimeout(() => {
        // 퀴즈/결과 화면 -> 홈 이동 확인
        if (stage === AppStage.QUIZ || stage === AppStage.RESULTS || stage === AppStage.LOADING_QUIZ || stage === AppStage.ANALYZING || stage === AppStage.ERROR) {
          if (window.confirm(confirmHomeMsg)) {
             setStage(AppStage.INTRO);
             setSelectionPhase('CATEGORY');
             if (onResetQuiz) onResetQuiz(); 
          }
          return;
        }

        // 영역 선택 (서브토픽 -> 카테고리)
        if (stage === AppStage.TOPIC_SELECTION && selectionPhase === 'SUBTOPIC') {
          setSelectionPhase('CATEGORY');
          return;
        }

        // 그 외 (프로필 등) -> 인트로로
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