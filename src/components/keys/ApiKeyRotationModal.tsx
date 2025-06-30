import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { X, RefreshCw, AlertTriangle, Copy, CheckCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { TextInput } from 'flowbite-react';
import type { ApiKeyWithResume } from '../../types/apiKeys';

interface ApiKeyRotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<string | null>;
  apiKey: ApiKeyWithResume | null;
  isLoading?: boolean;
  onRotationComplete?: (newKey: string) => void;
}

export const ApiKeyRotationModal: FC<ApiKeyRotationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  apiKey,
  isLoading = false,
  onRotationComplete
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setIsValid(false);
      setNewKey(null);
      setIsCopied(false);
      setError(null);
    }
  }, [isOpen]);

  // Check if confirmation text matches
  useEffect(() => {
    if (!apiKey) return;
    setIsValid(confirmText.trim().toLowerCase() === 'rotate');
  }, [confirmText, apiKey]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && !newKey) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, newKey, onClose]);

  const handleConfirm = async () => {
    if (isValid && !isLoading && !newKey) {
      try {
        setError(null);
        const result = await onConfirm();
        if (result) {
          setNewKey(result);
          if (onRotationComplete) {
            onRotationComplete(result);
          }
        } else {
          setError("Failed to rotate key - no new key was returned");
        }
      } catch (err) {
        // Extract the actual error message from the error object
        let errorMessage = 'Failed to rotate API key';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = String(err.message);
        }
        
        setError(errorMessage);
      }
    }
  };

  const handleCopy = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDone = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading && !newKey) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-background border rounded-xl shadow-2xl"
      >
        {newKey ? (
          <>
            {/* Success State */}
            <div className="p-6 border-b bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-800/30 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">API Key Rotated</h2>
                    <p className="text-sm text-muted-foreground">Your new API key is ready</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDone}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your New API Key</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                    {newKey}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">
                      Important: Save Your API Key Now
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      This is the only time your new API key will be displayed. Please copy it and update any applications using the old key.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleDone}>
                  Done
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation State */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2">
                    <Key className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Rotate API Key</h2>
                    <p className="text-sm text-muted-foreground">
                      {apiKey?.name || 'Selected key'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">
                      Warning: This action cannot be undone
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Rotating this API key will invalidate the current key. Any applications using this key will need to be updated with the new key.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="confirmation" className="block text-sm font-medium">
                  Type <span className="font-mono bg-muted px-1 py-0.5 rounded">rotate</span> to confirm:
                </label>
                <TextInput
                  id="confirmation"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="rotate"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isValid || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Rotating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Rotate Key</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};