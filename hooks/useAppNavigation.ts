import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

/**
 * 앱의 화면 단계(Stage)와 브라우저 히스토리(뒤로가기)를 전담하는 훅입니다.
 * 외부(ViewModel)에서 콜백을 주입받아, 특정 상황(종료, 홈 이동)에서 실행합니다.
 */
export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  // 화면 상태 관리
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 외부에서 주입받을 콜백과 메시지들을 저장하는 Ref
  const callbacksRef = useRef({
    onExitApp: () => {},
    onResetQuiz: () => {},
    confirmExitMsg: "앱을 종료하시겠습니까?",
    confirmHomeMsg: "홈 화면으로 이동하시겠습니까? 진행 중인 내용은 초기화됩니다."
  });

  // 콜백 업데이트 함수
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

  // 이벤트 리스너 내부에서 최신 State를 참조하기 위한 Ref
  const stateRef = useRef({ stage, selectionPhase });
  useEffect(() => {
    stateRef.current = { stage, selectionPhase };
  }, [stage, selectionPhase]);

  // --- [핵심] 단일 히스토리 트랩 (Single Trap) 설치 ---
  useEffect(() => {
    // 앱이 로드될 때 딱 한 번만 실행
    if (!window.history.state || window.history.state.key !== 'trap') {
      window.history.replaceState({ key: 'root' }, '');
      window.history.pushState({ key: 'trap' }, '');
    }

    // 에러 수정: event 파라미터를 사용하지 않으므로 '_'로 변경
    const handlePopState = (_: PopStateEvent) => {
      // 1. 뒤로가기가 감지되면, 즉시 다시 트랩을 씌워 이탈을 막습니다. (Push State)
      window.history.pushState({ key: 'trap' }, '');

      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // 2. 비동기 처리 (setTimeout)
      setTimeout(() => {
        // [상황 A] 인트로 화면: 앱 종료 시도
        if (stage === AppStage.INTRO) {
          if (window.confirm(confirmExitMsg)) {
            const len = window.history.length;
            if (len > 2) window.history.go(-2);
            else window.history.back(); 
            
            if (onExitApp) onExitApp();
          }
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

        // [상황 D] 그 외 (프로필 등) -> 무조건 인트로로 복귀
        setStage(AppStage.INTRO);
        setSelectionPhase('CATEGORY');
      }, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); 

  // 수동 뒤로가기 (UI 버튼용)
  const goBack = useCallback(() => {
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