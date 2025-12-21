import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Percent, Activity, Heart, Dumbbell, Scale, TrendingDown } from "lucide-react";

const BodyFatCalculator = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState(""); // Required for females
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [category, setCategory] = useState("");

  const calculateBodyFat = () => {
    const heightNum = parseFloat(height);
    const waistNum = parseFloat(waist);
    const neckNum = parseFloat(neck);
    const hipNum = parseFloat(hip);

    // Validate required fields including gender
    if (!gender || heightNum <= 0 || waistNum <= 0 || neckNum <= 0) {
      return;
    }

    let bodyFatValue: number;

    if (gender === "male") {
      // US Navy Method for males
      bodyFatValue = 495 / (1.0324 - 0.19077 * Math.log10(waistNum - neckNum) + 0.15456 * Math.log10(heightNum)) - 450;
    } else if (gender === "female") {
      // US Navy Method for females (requires hip measurement)
      if (hipNum <= 0) return;
      bodyFatValue = 495 / (1.29579 - 0.35004 * Math.log10(waistNum + hipNum - neckNum) + 0.22100 * Math.log10(heightNum)) - 450;
    } else {
      return;
    }

    bodyFatValue = Math.max(0, Math.min(60, bodyFatValue)); // Clamp to reasonable range
    setBodyFat(parseFloat(bodyFatValue.toFixed(1)));

    // Categorize based on gender
    if (gender === "male") {
      if (bodyFatValue < 6) setCategory("essential");
      else if (bodyFatValue < 14) setCategory("athletic");
      else if (bodyFatValue < 18) setCategory("fitness");
      else if (bodyFatValue < 25) setCategory("average");
      else setCategory("obese");
    } else {
      if (bodyFatValue < 14) setCategory("essential");
      else if (bodyFatValue < 21) setCategory("athletic");
      else if (bodyFatValue < 25) setCategory("fitness");
      else if (bodyFatValue < 32) setCategory("average");
      else setCategory("obese");
    }
  };

  const getRecommendations = () => {
    switch (category) {
      case "essential":
        return {
          color: "text-purple-400",
          bgColor: "bg-purple-500/20",
          title: "Essential Fat",
          tips: [
            "This is the minimum level needed for health",
            "Focus on maintaining proper nutrition",
            "Ensure adequate caloric intake",
            "Monitor health markers regularly",
          ],
          icon: <Heart className="h-5 w-5" />,
        };
      case "athletic":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          title: "Athletic",
          tips: [
            "Excellent fitness level achieved",
            "Maintain balanced training routine",
            "Focus on performance optimization",
            "Continue with structured nutrition",
          ],
          icon: <Dumbbell className="h-5 w-5" />,
        };
      case "fitness":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          title: "Fitness",
          tips: [
            "Great body composition level",
            "Continue regular exercise routine",
            "Maintain balanced diet habits",
            "Consider strength training for definition",
          ],
          icon: <Activity className="h-5 w-5" />,
        };
      case "average":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          title: "Average",
          tips: [
            "Room for improvement exists",
            "Increase cardiovascular activity",
            "Focus on reducing processed foods",
            "Aim for consistent workout schedule",
          ],
          icon: <Scale className="h-5 w-5" />,
        };
      case "obese":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          title: "Above Average",
          tips: [
            "Consult with a fitness professional",
            "Start with moderate exercise program",
            "Focus on whole foods and vegetables",
            "Set realistic, achievable goals",
          ],
          icon: <TrendingDown className="h-5 w-5" />,
        };
      default:
        return null;
    }
  };

  const recommendations = getRecommendations();

  const resetCalculator = () => {
    setAge("");
    setGender("");
    setHeight("");
    setWeight("");
    setWaist("");
    setNeck("");
    setHip("");
    setBodyFat(null);
    setCategory("");
  };

  const isFormValid = () => {
    const baseValid = age && gender && height && waist && neck;
    if (gender === "female") {
      return baseValid && hip;
    }
    return baseValid;
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetCalculator()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
          <Percent className="h-5 w-5" />
          Calculate Body Fat %
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            Body Fat Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!bodyFat ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bf-height">Height (cm)</Label>
                  <Input
                    id="bf-height"
                    type="number"
                    placeholder="Height in cm"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bf-weight">Weight (kg)</Label>
                  <Input
                    id="bf-weight"
                    type="number"
                    placeholder="Weight in kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    placeholder="At navel level"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neck">Neck (cm)</Label>
                  <Input
                    id="neck"
                    type="number"
                    placeholder="Below larynx"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {gender === "female" && (
                <div className="space-y-2">
                  <Label htmlFor="hip">Hip (cm)</Label>
                  <Input
                    id="hip"
                    type="number"
                    placeholder="At widest point"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Uses the US Navy Method formula for accurate body fat estimation.
              </p>

              <Button 
                onClick={calculateBodyFat} 
                className="w-full"
                variant="cta"
                disabled={!isFormValid()}
              >
                Calculate Body Fat %
              </Button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* Body Fat Result */}
              <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Your Body Fat</p>
                <p className={`text-5xl font-bold ${recommendations?.color}`}>
                  {bodyFat}%
                </p>
                <p className={`text-lg font-semibold mt-2 ${recommendations?.color}`}>
                  {recommendations?.title}
                </p>
              </div>

              {/* Body Fat Scale */}
              <div className="space-y-2">
                <div className="h-3 rounded-full overflow-hidden flex">
                  <div className="w-1/5 bg-purple-500" />
                  <div className="w-1/5 bg-blue-500" />
                  <div className="w-1/5 bg-green-500" />
                  <div className="w-1/5 bg-yellow-500" />
                  <div className="w-1/5 bg-red-500" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Essential</span>
                  <span>Athletic</span>
                  <span>Fitness</span>
                  <span>Average</span>
                  <span>High</span>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations && (
                <div className={`p-4 rounded-xl ${recommendations.bgColor} border border-border`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={recommendations.color}>{recommendations.icon}</span>
                    <h4 className="font-semibold">Fitness Recommendations</h4>
                  </div>
                  <ul className="space-y-2">
                    {recommendations.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={resetCalculator} 
                variant="outline" 
                className="w-full"
              >
                Calculate Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BodyFatCalculator;