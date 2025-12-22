import { useEffect, useState } from 'react';
import { checkPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/password-validator';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

export function PasswordStrengthIndicator({ password, show = true }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(checkPasswordStrength(''));

  useEffect(() => {
    if (password) {
      setStrength(checkPasswordStrength(password));
    } else {
      setStrength(checkPasswordStrength(''));
    }
  }, [password]);

  if (!show || !password) {
    return null;
  }

  const progressValue = (strength.score / 4) * 100;
  const strengthLabel = getPasswordStrengthLabel(strength.score);
  const strengthColor = getPasswordStrengthColor(strength.score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Kekuatan Password:</span>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {strengthLabel}
        </span>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2"
        indicatorClassName={
          strength.score <= 1 ? 'bg-red-500' :
          strength.score === 2 ? 'bg-yellow-500' :
          strength.score === 3 ? 'bg-blue-500' :
          'bg-green-500'
        }
      />
      
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1 mt-2">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-red-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      
      {strength.isStrong && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span>✓</span>
          <span>Password Anda kuat dan aman!</span>
        </p>
      )}
    </div>
  );
}
