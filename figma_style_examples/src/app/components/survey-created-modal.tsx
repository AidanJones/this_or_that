import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { CheckCircle, Copy, Globe, Lock, X } from "lucide-react";
import { Survey } from "@/app/types/survey";
import { useState } from "react";

interface SurveyCreatedModalProps {
  survey: Survey;
  onClose: () => void;
}

export function SurveyCreatedModal({ survey, onClose }: SurveyCreatedModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (survey.inviteCode) {
      navigator.clipboard.writeText(survey.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <div className="rounded-full bg-green-100 p-4 inline-flex mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {survey.surveyType === 'tournament' ? 'Tournament' : 'Survey'} Created!
            </h2>
            <p className="text-gray-600 mb-6">{survey.title}</p>

            {survey.visibility === 'public' ? (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Public Survey</span>
                </div>
                <p className="text-sm text-blue-700">
                  Your survey is now live in the public feed for everyone to participate!
                </p>
              </div>
            ) : (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Private Survey</span>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  Share this invite code with your participants:
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                  <div className="text-3xl font-bold text-purple-600 mb-2 tracking-wider">
                    {survey.inviteCode}
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full" size="lg">
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
