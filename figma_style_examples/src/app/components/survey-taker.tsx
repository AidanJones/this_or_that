import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Survey, SurveyResponse, VoteStrength } from "@/app/types/survey";
import { motion } from "motion/react";

interface SurveyTakerProps {
  survey: Survey;
  onBack: () => void;
  onComplete: (surveyId: string, responses: SurveyResponse[]) => void;
}

export function SurveyTaker({ survey, onBack, onComplete }: SurveyTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<'A' | 'B' | null>(null);

  // Check if survey is expired
  if (survey.isExpired) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <Card className="max-w-md border-2 border-black">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="p-6 inline-flex mb-6" style={{ backgroundColor: '#FFED00' }}>
              <AlertCircle className="h-16 w-16 text-black" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Survey Expired</h2>
            <p className="text-black mb-8">
              This survey has reached its maximum number of responses ({survey.maxVotes})
            </p>
            <Button onClick={onBack} size="lg" className="bg-black text-white">
              Back to Surveys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;
  const question = survey.questions[currentQuestion];

  const handleChoice = (choice: 'A' | 'B') => {
    setPendingChoice(choice);
  };

  const handleStrength = (strength: VoteStrength) => {
    if (!pendingChoice) return;

    const newResponses = [...responses, { 
      questionId: question.id, 
      choice: pendingChoice,
      strength 
    }];
    setResponses(newResponses);
    setPendingChoice(null);

    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      onComplete(survey.id, newResponses);
    }
  };

  const handleBackFromStrength = () => {
    setPendingChoice(null);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md border-2 border-black">
            <CardContent className="pt-16 pb-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-6 inline-flex mb-6"
                style={{ backgroundColor: '#FF10F0' }}
              >
                <Check className="h-16 w-16 text-black" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
              <p className="text-black mb-8">
                Your responses have been recorded
              </p>
              <Button onClick={onBack} size="lg" className="bg-black text-white">
                Back to Surveys
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6 border-2 border-black">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>

        <Card className="border-2 border-black">
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>{survey.title}</CardTitle>
                <span className="text-sm text-black">
                  {currentQuestion + 1} of {survey.questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            {!pendingChoice ? (
              <motion.div
                key={`choice-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-center text-xl mb-8 text-black">
                  Which do you prefer?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleChoice('A')}
                      className="w-full border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
                      style={{ borderColor: '#FFED00' }}
                    >
                      <img 
                        src={question.optionAImage} 
                        alt={question.optionA}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4" style={{ backgroundColor: '#FFED00' }}>
                        <p className="text-lg font-semibold text-black">{question.optionA}</p>
                      </div>
                    </button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleChoice('B')}
                      className="w-full border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
                      style={{ borderColor: '#FF10F0' }}
                    >
                      <img 
                        src={question.optionBImage} 
                        alt={question.optionB}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4" style={{ backgroundColor: '#FF10F0' }}>
                        <p className="text-lg font-semibold text-black">{question.optionB}</p>
                      </div>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`strength-${currentQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl mb-2 text-black">You chose:</h3>
                  <div 
                    className="inline-block px-6 py-3 rounded-lg text-xl font-bold text-black"
                    style={{ backgroundColor: pendingChoice === 'A' ? '#FFED00' : '#FF10F0' }}
                  >
                    {pendingChoice === 'A' ? question.optionA : question.optionB}
                  </div>
                </div>

                <h3 className="text-center text-xl text-black">
                  How strong is your preference?
                </h3>

                <div className="space-y-3 max-w-md mx-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleStrength('by-a-hair')}
                      variant="outline"
                      className="w-full h-20 text-lg border-2 border-black flex flex-col"
                      style={{ backgroundColor: '#FFED00' }}
                    >
                      <span className="font-bold text-black">By a Hair</span>
                      <span className="text-sm text-black">Just slightly better</span>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleStrength('comfortably')}
                      variant="outline"
                      className="w-full h-20 text-lg flex flex-col"
                      style={{ backgroundColor: '#FF10F0' }}
                    >
                      <span className="font-bold text-black">Comfortably</span>
                      <span className="text-sm text-black">Clearly prefer this option</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleStrength('no-brainer')}
                      variant="outline"
                      className="w-full h-20 text-lg flex flex-col"
                      style={{ backgroundColor: '#FFED00' }}
                    >
                      <span className="font-bold text-black">No Brainer</span>
                      <span className="text-sm text-black">Obvious choice, not even close</span>
                    </Button>
                  </motion.div>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    onClick={handleBackFromStrength} 
                    variant="ghost"
                    size="sm"
                    className="border-2 border-black"
                  >
                    ← Change my choice
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}