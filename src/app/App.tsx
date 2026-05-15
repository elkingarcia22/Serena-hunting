import { RouterProvider } from 'react-router';
import { router } from './routes';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import WelcomeOverlay from './components/feedback/WelcomeOverlay';
import OnboardingTour from './components/feedback/OnboardingTour';
import FeedbackFAB from './components/feedback/FeedbackFAB';
import FeedbackModal from './components/feedback/FeedbackModal';
import { Toaster } from './components/ui/sonner';

function OnboardingManager() {
  const { isFeedbackModalOpen, closeFeedback } = useOnboarding();
  
  return (
    <>
      {/* <WelcomeOverlay /> */}
      {/* <OnboardingTour /> */}
      {/* <FeedbackModal isOpen={isFeedbackModalOpen} onClose={closeFeedback} /> */}
    </>
  );
}

export default function App() {
  return (
    <OnboardingProvider>
      <RouterProvider router={router} />
      <OnboardingManager />
      <Toaster position="top-right" />
    </OnboardingProvider>
  );
}