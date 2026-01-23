import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 콜백 및 메시지 저장
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

  // --- [핵심] 무조건 방어 히스토리 트랩 ---
  useEffect(() => {
    // 1. 컴포넌트 마운트 시 트랩 설치 (현재 상태를 복제하여 히스토리 추가)
    // 이것이 있어야 뒤로가기를 눌렀을 때 popstate 이벤트가 발생합니다.
    window.history.pushState({ trap: true }, '', '');

    const handlePopState = (event: PopStateEvent) => {
      // 2. [가장 중요] 뒤로가기가 감지되자마자 묻지도 따지지도 않고 다시 트랩 설치
      // 이 코드가 1순위로 실행되어야 브라우저 이탈을 막을 수 있습니다.
      window.history.pushState({ trap: true }, '', '');

      // 3. 이제 안전하게 로직 수행
      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // 비동기 처리로 UI 흐름 분리 (브라우저 먹통 방지)
      setTimeout(() => {
        // [상황 A] Intro 화면: 앱 종료 시도
        if (stage === AppStage.INTRO) {
          if (window.confirm(confirmExitMsg)) {
            // [종료 확정]
            // 방금 위에서 pushState로 트랩을 하나 더 깔았으므로,
            // 앱을 나가려면 '방금 깐 트랩' + '원래 있던 트랩' = 총 2칸을 뒤로 가야 합니다.
            const len = window.history.length;
            if (len > 2) {
                window.history.go(-2);
            } else {
                window.history.back(); // 히스토리가 짧으면 그냥 back
            }
            
            if (onExitApp) onExitApp();
            try { window.close(); } catch {}
          }
          // 취소(No)하면? 이미 맨 위에서 pushState로 막아뒀으니 아무것도 안 해도 됨 (현상 유지)
          return;
        }

        // [상황 B] 퀴즈/결과 등 -> 홈 이동 확인
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

        // [상황 D] 그 외 -> 무조건 인트로로
        setStage(AppStage.INTRO);
        setSelectionPhase('CATEGORY');
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    
    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); 

  // 수동 뒤로가기 (UI 버튼용)
  const goBack = useCallback(() => {
    // 물리 버튼과 동일하게 동작하도록 history.back 호출 -> handlePopState 트리거
    window.history.back();
  }, []);

  // 수동 홈 이동 (UI 버튼용)
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