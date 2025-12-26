import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';

// IME-aware input component for proper Vietnamese (Unikey) input support
export interface IMEInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const IMEInput: React.FC<IMEInputProps> = ({ id, value, onChange, placeholder, disabled, className }) => {
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when prop changes and we're not composing
  useEffect(() => {
    if (isComposing || !inputRef.current) {
      return;
    }

    // Only update if the values are different to avoid cursor jumping
    if (inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value, isComposing]);

  const handleCompositionStart = (): void => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>): void => {
    setIsComposing(false);
    // Always call onChange after composition ends with the final value
    onChange(e.currentTarget.value);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>): void => {
    // Use input event for better IME support
    const target = e.currentTarget;

    // Only call onChange if we're not in the middle of composition
    if (isComposing) {
      return;
    }
    onChange(target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Fallback change handler - usually input event is sufficient for IME
    if (isComposing) {
      return;
    }
    onChange(e.target.value);
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      defaultValue={value}
      onInput={handleInput}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
};
