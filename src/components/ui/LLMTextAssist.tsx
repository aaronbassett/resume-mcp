import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Shell, Check, X } from 'lucide-react';
import { HypeButton } from './HypeButton';
import { useGenerativeAI } from '../../hooks/useGenerativeAI';

interface LLMTextAssistProps {
  existingValue?: string;
  setNewValue: (value: string) => void;
  additionalContext?: string[];
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const LLMTextAssist: FC<LLMTextAssistProps> = ({
  existingValue,
  setNewValue,
  additionalContext = ['Form field update'],
  className = '',
  onClick
}) => {
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const { generateText, isLoading, error } = useGenerativeAI({
    existingText: existingValue,
    contextualInfo: additionalContext.join('\n')
  });

  // Reset button state after success or error
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (buttonState === 'success') {
      timeoutId = setTimeout(() => {
        setButtonState('idle');
      }, 1000);
    } else if (buttonState === 'error') {
      timeoutId = setTimeout(() => {
        setButtonState('idle');
        setTooltipVisible(false);
      }, 3000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [buttonState]);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent event propagation to avoid closing the edit mode
    e.stopPropagation();
    
    // Call the onClick prop if provided
    if (onClick) {
      onClick(e);
    }
    
    if (buttonState === 'loading') return;
    
    setButtonState('loading');
    
    try {
      let instructions = '';
      
      if (existingValue) {
        instructions = 'Please improve this text to make it more professional, clear, and compelling. Maintain the original meaning but enhance the language, flow, and impact.';
      } else {
        instructions = 'Please generate appropriate text based on the provided context. Create content that is professional, clear, and compelling.';
      }
      
      const result = await generateText(instructions);
      
      if (result) {
        setNewValue(result);
        setButtonState('success');
      } else {
        setButtonState('error');
        setTooltipVisible(true);
      }
    } catch (err) {
      console.error('Error generating text:', err);
      setButtonState('error');
      setTooltipVisible(true);
    }
  };

  const renderButtonContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Shell className="h-4 w-4" />
          </motion.div>
        );
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <HypeButton
        variant="primary"
        onClick={handleClick}
        disabled={buttonState === 'loading'}
        className="h-8 w-8 p-0 text-xs"
      >
        {renderButtonContent()}
      </HypeButton>
      
      {tooltipVisible && buttonState === 'error' && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 p-2 bg-destructive text-destructive-foreground text-xs rounded shadow-lg">
          {error || "There was an error generating text. Please try again later."}
        </div>
      )}
    </div>
  );
};