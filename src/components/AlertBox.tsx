import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface AlertBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  variant?: 'default' | 'destructive';
}

const AlertBox = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Confirm",
  variant = 'destructive'
}: AlertBoxProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-gray-800/95 border-gray-700/50 backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className={`text-xl font-bold ${
            variant === 'destructive' 
              ? 'text-red-400' 
              : 'text-blue-400'
          }`}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-gray-700/50 text-gray-100 hover:bg-gray-600/50 border-gray-600"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`${
              variant === 'destructive'
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertBox;