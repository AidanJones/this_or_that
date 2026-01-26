import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ArrowLeft, PlusCircle, X, Save, Upload, Image as ImageIcon, Globe, Lock } from "lucide-react";
import { Question, SurveyVisibility } from "@/app/types/survey";

interface SurveyCreatorProps {
  onBack: () => void;
  onSave: (title: string, questions: Question[], maxVotes: number, visibility: SurveyVisibility) => void;
}

export function SurveyCreator({ onBack, onSave }: SurveyCreatorProps) {
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState("10");
  const [visibility, setVisibility] = useState<SurveyVisibility>('public');
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: crypto.randomUUID(), 
      optionA: "", 
      optionAImage: "",
      optionB: "", 
      optionBImage: "",
      votesA: 0, 
      votesB: 0,
      votesAByHair: 0,
      votesAComfortably: 0,
      votesANoBrainer: 0,
      votesBByHair: 0,
      votesBComfortably: 0,
      votesBNoBrainer: 0
    }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: crypto.randomUUID(), 
        optionA: "", 
        optionAImage: "",
        optionB: "", 
        optionBImage: "",
        votesA: 0, 
        votesB: 0,
        votesAByHair: 0,
        votesAComfortably: 0,
        votesANoBrainer: 0,
        votesBByHair: 0,
        votesBComfortably: 0,
        votesBNoBrainer: 0
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleImageUpload = (id: string, option: 'A' | 'B', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const field = option === 'A' ? 'optionAImage' : 'optionBImage';
      updateQuestion(id, field, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a survey title");
      return;
    }

    const maxVotesNum = parseInt(maxVotes);
    if (isNaN(maxVotesNum) || maxVotesNum < 1) {
      alert("Please enter a valid number of max votes (at least 1)");
      return;
    }

    const validQuestions = questions.filter(q => 
      q.optionA.trim() && q.optionAImage && q.optionB.trim() && q.optionBImage
    );
    
    if (validQuestions.length === 0) {
      alert("Please add at least one complete comparison with both images uploaded");
      return;
    }

    onSave(title, validQuestions, maxVotesNum, visibility);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Survey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input
                id="title"
                placeholder="e.g., Product Feature Preferences"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxVotes">Maximum Number of Responses</Label>
              <Input
                id="maxVotes"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={maxVotes}
                onChange={(e) => setMaxVotes(e.target.value)}
              />
              <p className="text-sm text-gray-500">Survey will expire after this many responses</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Binary Comparisons</Label>
                <Button onClick={addQuestion} size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Comparison
                </Button>
              </div>

              {questions.map((question, index) => (
                <Card key={question.id} className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-6">
                        {/* Option A */}
                        <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-blue-200">
                          <Label className="text-blue-700 font-semibold">Option A</Label>
                          <Input
                            placeholder="Label (e.g., Beach Vacation)"
                            value={question.optionA}
                            onChange={(e) => updateQuestion(question.id, 'optionA', e.target.value)}
                          />
                          <div className="space-y-2">
                            <Label 
                              htmlFor={`imageA-${question.id}`}
                              className="cursor-pointer"
                            >
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                question.optionAImage 
                                  ? 'border-blue-400 bg-blue-50' 
                                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                              }`}>
                                {question.optionAImage ? (
                                  <div className="space-y-2">
                                    <img 
                                      src={question.optionAImage} 
                                      alt="Option A" 
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <p className="text-sm text-blue-600 font-medium">Click to change image</p>
                                  </div>
                                ) : (
                                  <div className="py-8">
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                  </div>
                                )}
                              </div>
                            </Label>
                            <input
                              id={`imageA-${question.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(question.id, 'A', file);
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-center font-bold text-xl text-gray-500">VS</div>

                        {/* Option B */}
                        <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-indigo-200">
                          <Label className="text-indigo-700 font-semibold">Option B</Label>
                          <Input
                            placeholder="Label (e.g., Mountain Retreat)"
                            value={question.optionB}
                            onChange={(e) => updateQuestion(question.id, 'optionB', e.target.value)}
                          />
                          <div className="space-y-2">
                            <Label 
                              htmlFor={`imageB-${question.id}`}
                              className="cursor-pointer"
                            >
                              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                question.optionBImage 
                                  ? 'border-indigo-400 bg-indigo-50' 
                                  : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                              }`}>
                                {question.optionBImage ? (
                                  <div className="space-y-2">
                                    <img 
                                      src={question.optionBImage} 
                                      alt="Option B" 
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <p className="text-sm text-indigo-600 font-medium">Click to change image</p>
                                  </div>
                                ) : (
                                  <div className="py-8">
                                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                  </div>
                                )}
                              </div>
                            </Label>
                            <input
                              id={`imageB-${question.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(question.id, 'B', file);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {questions.length > 1 && (
                        <Button
                          onClick={() => removeQuestion(question.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    visibility === 'public' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Public</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Appears in public feed for all users
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    visibility === 'private' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">Private</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Only accessible via invite code
                  </p>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Save Survey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}