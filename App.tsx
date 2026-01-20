import { Layout } from './components/Layout';
import { StageResults } from './components/StageResults';
import { AppStage, TOPIC_IDS } from './types';
import { useGameViewModel } from './viewmodels/useGameViewModel';

// Views
import { LanguageView } from './views/LanguageView';
import { IntroView } from './views/IntroView';
import { ProfileView } from './views/ProfileView';
import { TopicSelectionView } from './views/TopicSelectionView';
import { QuizView } from './views/QuizView';
import { LoadingView } from './views/LoadingView';
import { ErrorView } from './views/ErrorView';

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
          backLabel={t.common.btn_back}
        />
      )}
      
      {stage === AppStage.PROFILE && (
        <ProfileView 
          t={t.profile} 
          userProfile={userProfile} 
          onUpdate={actions.updateProfile}
          onSubmit={actions.submitProfile}
          onBack={actions.goBack}
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
          t={t.quiz}
          questions={quizState.questions}
          currentIndex={quizState.currentQuestionIndex}
          selectedOption={quizState.selectedOption}
          topicLabel={topicState.selectedCategory === TOPIC_IDS.CUSTOM ? topicState.customTopic : topicState.selectedSubTopic}
          onSelectOption={actions.selectOption}
          onConfirm={actions.confirmAnswer}
          onBack={actions.goBack}
          backLabel={t.common.btn_back}
        />
      )}
      
      {stage === AppStage.ANALYZING && (
        <LoadingView text={t.loading.analyzing} />
      )}
      
      {stage === AppStage.RESULTS && resultState.evaluation && (
        <StageResults 
          data={resultState.evaluation} 
          onRestart={actions.resetApp} 
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