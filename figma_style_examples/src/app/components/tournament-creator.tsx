import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { ArrowLeft, PlusCircle, X, Save, Trophy, Upload, Globe, Lock } from "lucide-react";
import { TournamentItem, SurveyVisibility } from "@/app/types/survey";

interface TournamentCreatorProps {
  onBack: () => void;
  onSave: (title: string, items: TournamentItem[], maxVotes: number, visibility: SurveyVisibility) => void;
}

export function TournamentCreator({ onBack, onSave }: TournamentCreatorProps) {
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState("10");
  const [visibility, setVisibility] = useState<SurveyVisibility>('public');
  const [items, setItems] = useState<TournamentItem[]>([
    { id: crypto.randomUUID(), name: "", image: "" },
    { id: crypto.randomUUID(), name: "", image: "" },
  ]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: "", image: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 2) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof TournamentItem, value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateItem(id, 'image', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a tournament title");
      return;
    }

    const maxVotesNum = parseInt(maxVotes);
    if (isNaN(maxVotesNum) || maxVotesNum < 1) {
      alert("Please enter a valid number of max votes (at least 1)");
      return;
    }

    const validItems = items.filter(i => i.name.trim() && i.image);
    
    if (validItems.length < 2) {
      alert("Please add at least 2 items with images to compete");
      return;
    }

    onSave(title, validItems, maxVotesNum, visibility);
  };

  // Calculate tournament size info
  const validItemCount = items.filter(i => i.name.trim() && i.image).length;
  const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(validItemCount)));
  const numByes = validItemCount > 0 ? nextPowerOf2 - validItemCount : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              <CardTitle>Create Tournament Survey</CardTitle>
            </div>
            <CardDescription>
              Items will compete in elimination rounds until a winner emerges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tournament Title</Label>
              <Input
                id="title"
                placeholder="e.g., Best Pizza Topping Championship"
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
              <p className="text-sm text-gray-500">Tournament will close after this many responses</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Competing Items</Label>
                <Button onClick={addItem} size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {validItemCount > 0 && (
                <div className="bg-purple-50 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-purple-900">Tournament Structure:</p>
                  <p className="text-purple-700">
                    {validItemCount} items → {nextPowerOf2}-item bracket
                    {numByes > 0 && ` (${numByes} automatic ${numByes === 1 ? 'bye' : 'byes'})`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <Card key={item.id} className="bg-white">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">Item {index + 1}</Label>
                        {items.length > 2 && (
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder={`Name (e.g., Pepperoni)`}
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      />
                      <div className="space-y-2">
                        <Label 
                          htmlFor={`image-${item.id}`}
                          className="cursor-pointer"
                        >
                          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            item.image 
                              ? 'border-purple-400 bg-purple-50' 
                              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                          }`}>
                            {item.image ? (
                              <div className="space-y-2">
                                <img 
                                  src={item.image} 
                                  alt={item.name || `Item ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <p className="text-sm text-purple-600 font-medium">Click to change image</p>
                              </div>
                            ) : (
                              <div className="py-6">
                                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Click to upload image</p>
                              </div>
                            )}
                          </div>
                        </Label>
                        <input
                          id={`image-${item.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(item.id, file);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setVisibility('public')}
                  size="sm"
                  variant={visibility === 'public' ? 'default' : 'outline'}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Public
                </Button>
                <Button
                  onClick={() => setVisibility('private')}
                  size="sm"
                  variant={visibility === 'private' ? 'default' : 'outline'}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Private
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Create Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}