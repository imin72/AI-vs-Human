
import { Layout } from './components/Layout.tsx';
import { StageResults } from './components/StageResults.tsx';
import { AppStage } from './types.ts';
import { useGameViewModel } from './viewmodels/useGameViewModel.ts';

// Views
import { LanguageView } from './views/LanguageView.tsx';
import { IntroView } from './views/IntroView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { TopicSelectionView } from './views/TopicSelectionView.tsx';
import { QuizView } from './views/QuizView.tsx';
import { LoadingView } from './views/LoadingView.tsx';
import { ErrorView } from './views/ErrorView.tsx';

export default function App() {
  const { state, actions, t } = useGameViewModel();
  const { stage, language, userProfile, topicState, quizState, resultState } = state;

  return (
    <Layout>
      {stage === AppStage.LANGUAGE && (
        <LanguageView onSelect={actions.setLanguage} />
      )}
      
      {stage === AppStage.INTRO && (
        <IntroView 
          t={t.intro} 
          onStart={actions.startIntro} 
          onBack={actions.goBack}
          onHome={actions.goHome}
          backLabel={t.common.btn_back}
        />
      )}
      
      {stage === AppStage.PROFILE && (
        <ProfileView 
          t={t.profile} 
          userProfile={userProfile} 
          language={language}
          onUpdate={actions.updateProfile}
          onSubmit={actions.submitProfile}
          onBack={actions.goBack}
          onHome={actions.goHome}
          backLabel={t.common.btn_back}
        />
      )}
      
      {stage === AppStage.TOPIC_SELECTION && (
        <TopicSelectionView 
          t={{...t.topics, difficulty: t.difficulty, btn_back: t.common.btn_back}} 
          state={{
            ...topicState,
            errorMsg: resultState.errorMsg
          }}
          actions={{
            goBack: actions.goBack,
            goHome: actions.goHome,
            shuffleTopics: actions.shuffleTopics,
            selectCategory: actions.selectCategory,
            setCustomTopic: actions.setCustomTopic,
            shuffleSubTopics: actions.shuffleSubTopics,
            selectSubTopic: actions.selectSubTopic,
            setDifficulty: actions.setDifficulty,
            startQuiz: actions.startQuiz
          }}
        />
      )}
      
      {stage === AppStage.LOADING_QUIZ && (
        <LoadingView text={t.loading.gen_vectors} />
      )}
      
      {stage === AppStage.QUIZ && (
        <QuizView 
          questions={quizState.questions}
          currentIndex={quizState.currentQuestionIndex}
          selectedOption={quizState.selectedOption}
          topicLabel={topicState.selectedSubTopic || topicState.selectedCategory}
          onSelectOption={actions.selectOption}
          onConfirm={actions.confirmAnswer}
          onBack={actions.goBack}
          onHome={actions.goHome}
          backLabel={t.common.btn_back}
          language={language}
        />
      )}
      
      {stage === AppStage.ANALYZING && (
        <LoadingView text={t.loading.analyzing} />
      )}
      
      {stage === AppStage.RESULTS && resultState.evaluation && (
        <StageResults 
          data={resultState.evaluation} 
          onRestart={actions.resetApp} 
          onHome={actions.goHome}
          language={language} 
        />
      )}
      
      {stage === AppStage.ERROR && (
        <ErrorView 
          t={t.error}
          message={resultState.errorMsg} 
          onReset={actions.resetApp} 
        />
      )}
    </Layout>
  );
}
