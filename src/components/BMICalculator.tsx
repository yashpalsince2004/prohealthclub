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
import { Calculator, Activity, Heart, Dumbbell, Scale } from "lucide-react";

const BMICalculator = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum > 0 && weightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmiValue = weightNum / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));

      if (bmiValue < 18.5) {
        setCategory("underweight");
      } else if (bmiValue < 25) {
        setCategory("normal");
      } else if (bmiValue < 30) {
        setCategory("overweight");
      } else {
        setCategory("obese");
      }
    }
  };

  const getRecommendations = () => {
    switch (category) {
      case "underweight":
        return {
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          title: "Underweight",
          tips: [
            "Focus on calorie-dense nutritious foods",
            "Strength training to build muscle mass",
            "Eat more frequent meals throughout the day",
            "Include protein-rich foods in every meal",
          ],
          icon: <Dumbbell className="h-5 w-5" />,
        };
      case "normal":
        return {
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          title: "Healthy Weight",
          tips: [
            "Maintain your current balanced diet",
            "Continue regular exercise routine",
            "Focus on strength and cardiovascular fitness",
            "Stay hydrated and get adequate sleep",
          ],
          icon: <Heart className="h-5 w-5" />,
        };
      case "overweight":
        return {
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          title: "Overweight",
          tips: [
            "Create a moderate calorie deficit",
            "Increase cardiovascular exercise",
            "Reduce processed foods and sugars",
            "Track your meals and portions",
          ],
          icon: <Activity className="h-5 w-5" />,
        };
      case "obese":
        return {
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          title: "Obese",
          tips: [
            "Consult with a healthcare professional",
            "Start with low-impact exercises",
            "Focus on whole foods and vegetables",
            "Set small, achievable goals",
          ],
          icon: <Scale className="h-5 w-5" />,
        };
      default:
        return null;
    }
  };

  const recommendations = getRecommendations();

  const resetCalculator = () => {
    setHeight("");
    setWeight("");
    setBmi(null);
    setCategory("");
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetCalculator()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
          <Calculator className="h-5 w-5" />
          Calculate Your BMI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            BMI Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!bmi ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Enter your height in cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter your weight in kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>

              <Button 
                onClick={calculateBMI} 
                className="w-full"
                variant="cta"
                disabled={!height || !weight}
              >
                Calculate BMI
              </Button>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {/* BMI Result */}
              <div className="text-center p-6 rounded-xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                <p className={`text-5xl font-bold ${recommendations?.color}`}>
                  {bmi}
                </p>
                <p className={`text-lg font-semibold mt-2 ${recommendations?.color}`}>
                  {recommendations?.title}
                </p>
              </div>

              {/* BMI Scale */}
              <div className="space-y-2">
                <div className="h-3 rounded-full overflow-hidden flex">
                  <div className="w-1/4 bg-blue-500" />
                  <div className="w-1/4 bg-green-500" />
                  <div className="w-1/4 bg-yellow-500" />
                  <div className="w-1/4 bg-red-500" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Under 18.5</span>
                  <span>18.5-24.9</span>
                  <span>25-29.9</span>
                  <span>30+</span>
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

export default BMICalculator;
