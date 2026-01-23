import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStage } from '../types';

export const useAppNavigation = (initialStage: AppStage = AppStage.INTRO) => {
  const [stage, setStage] = useState<AppStage>(initialStage);
  const [selectionPhase, setSelectionPhase] = useState<'CATEGORY' | 'SUBTOPIC'>('CATEGORY');
  
  // 종료 중복 실행 방지 플래그
  const isExitingRef = useRef(false);

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

  // --- [핵심] 해시(#) 기반 가드 (Hash Guard) ---
  useEffect(() => {
    // 1. 초기화: 앱 실행 시 URL 뒤에 #guard가 없으면 붙입니다.
    // [예] myapp.com -> myapp.com/#guard
    if (window.location.hash !== '#guard') {
      window.history.pushState(null, '', '#guard');
    }

    const handlePopState = (_: PopStateEvent) => {
      // 종료 프로세스 중이면 간섭하지 않음
      if (isExitingRef.current) return;

      // 2. 뒤로가기 감지! (해시가 사라짐)
      // 사용자가 뒤로가기를 누르면 URL이 myapp.com/#guard -> myapp.com 으로 변합니다.
      
      const { stage, selectionPhase } = stateRef.current;
      const { onExitApp, onResetQuiz, confirmExitMsg, confirmHomeMsg } = callbacksRef.current;

      // 3. [철벽 방어] 즉시 다시 해시를 붙여서 제자리로 돌려놓습니다.
      // myapp.com -> myapp.com/#guard (원상복구)
      window.history.pushState(null, '', '#guard');

      // 4. 비동기로 팝업 로직 수행 (UI 블로킹 방지)
      setTimeout(() => {
        // [상황 A] Intro 화면: 앱 종료
        if (stage === AppStage.INTRO) {
          if (window.confirm(confirmExitMsg)) {
             // [종료 확정]
             isExitingRef.current = true;
             
             // 현재 상태: [이전사이트] -> [앱진입(root)] -> [앱가드(#guard)]
             // 방금 우리가 pushState로 #guard를 다시 붙였으므로, 
             // 완전히 나가려면 2칸을 뒤로 가야 합니다.
             const len = window.history.length;
             if (len > 2) {
                 window.history.go(-2);
             } else {
                 // 히스토리가 얕은 경우 안전하게 순차 후퇴
                 window.history.back(); 
                 setTimeout(() => window.history.back(), 50);
             }

             if (onExitApp) onExitApp();
             try { window.close(); } catch {}
          }
          // 취소 시: 이미 위에서 pushState('#guard')를 했으므로 화면 유지됨
          return;
        }

        // [상황 B] 게임/결과 화면: 홈 이동
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
      }, 10); // 모바일 터치 씹힘 방지 딜레이
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); 

  // 수동 뒤로가기
  const goBack = useCallback(() => {
    // 브라우저 뒤로가기와 동일한 효과 -> 해시 제거 -> handlePopState 트리거
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