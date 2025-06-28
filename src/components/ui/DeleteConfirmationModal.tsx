import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { TextInput } from 'flowbite-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'item',
  isLoading = false
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
      setIsValid(false);
    }
  }, [isOpen]);

  // Check if confirmation text matches
  useEffect(() => {
    setIsValid(confirmationText.trim() === title.trim());
  }, [confirmationText, title]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
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
  }, [isOpen, isLoading, onClose]);

  const handleConfirm = () => {
    if (isValid && !isLoading) {
      onConfirm();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-background border rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-destructive/10 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete {itemType}</h2>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
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

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning message */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      Permanent Deletion Warning
                    </p>
                    <p className="text-sm text-destructive/80">
                      You are about to permanently delete "<span className="font-medium">{itemName}</span>". 
                      This action is <strong>irreversible</strong> and all associated data will be lost forever.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation input */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="confirmation" className="block text-sm font-medium mb-2">
                    To confirm deletion, type the {itemType} title below:
                  </label>
                  <div className="bg-muted/30 rounded-md p-3 mb-3">
                    <code className="text-sm font-mono break-all">{title}</code>
                  </div>
                  <TextInput
                    id="confirmation"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Type "${title}" to confirm`}
                    disabled={isLoading}
                    autoComplete="off"
                    className={`w-full ${
                      confirmationText && !isValid 
                        ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                        : ''
                    }`}
                  />
                  {confirmationText && !isValid && (
                    <p className="text-sm text-destructive mt-1">
                      Text doesn't match. Please type the exact title.
                    </p>
                  )}
                </div>
              </div>

              {/* Additional warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>What will be deleted:</strong>
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  <li>• The {itemType} and all its content</li>
                  <li>• All associated analytics data</li>
                  <li>• Any shared links will become invalid</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-muted/20">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={!isValid || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Forever</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};