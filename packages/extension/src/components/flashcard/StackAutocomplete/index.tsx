import React, { useState, useEffect, useMemo, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { shadowRoot } from '../../../features/content';

interface OptionType {
  value: string;
  label: string;
}

interface StackAutocompleteProps {
  items: string[];
  defaultValue: string;
  onBlur: (value: string) => void;
}

export const StackAutocomplete: React.FC<StackAutocompleteProps> = ({
  items,
  defaultValue,
  onBlur,
}) => {
  const selectRef = useRef<any>(null);
  const options = useMemo(
    () => items.map((item) => ({ value: item, label: item })),
    [items]
  );
  const [selectedValue, setSelectedValue] = useState<OptionType | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (defaultValue) {
      const defaultOption = options.find(
        (opt) => opt.value === defaultValue
      ) || { value: defaultValue, label: defaultValue };
      setSelectedValue(defaultOption);
      setInputValue(defaultValue);
    } else {
      setSelectedValue(null);
      setInputValue('');
    }
  }, [defaultValue, options]);

  // Focus and move cursor to end
  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.focus();
      // Small delay to ensure input is ready
      setTimeout(() => {
        const input = selectRef.current?.inputRef;
        if (input) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 0);
    }
  }, []);

  const handleBlur = () => {
    onBlur(inputValue);
  };

  const emotionCache = useMemo(() => {
    if (typeof window === 'undefined' || !shadowRoot) return null;

    const styleContainer = document.createElement('div');
    shadowRoot.appendChild(styleContainer);

    return createCache({
      key: 'react-select',
      container: styleContainer,
    });
  }, [shadowRoot]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      handleBlur();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  };

  if (!emotionCache) return null;

  return (
    <CacheProvider value={emotionCache}>
      <CreatableSelect
        ref={selectRef}
        options={options}
        value={selectedValue}
        inputValue={inputValue}
        onChange={(newValue) => {
          setSelectedValue(newValue as OptionType);
          setInputValue(newValue ? newValue.value : '');
          onBlur(newValue ? newValue.value : defaultValue);
        }}
        onInputChange={(newValue) => setInputValue(newValue)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Оберіть або вдіть стек..."
        isClearable
        autoFocus
        openMenuOnFocus
        menuIsOpen
      />
    </CacheProvider>
  );
};
