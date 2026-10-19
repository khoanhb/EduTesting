import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ 
    label, 
    options = [], 
    value, 
    onChange, 
    className = "w-44" 
    }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className={`relative text-xs ${className}`} ref={dropdownRef}>
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-between cursor-pointer hover:border-[#06B6D4] transition-colors shadow-sm select-none"
        >
            <span className="truncate text-[#0F172A] font-medium">
            {label ? `${label}: ` : ''}{selectedOption?.label}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${isOpen ? 'rotate-180 text-[#06B6D4]' : ''}`} />
        </div>

        {isOpen && (
            <div className="absolute left-0 mt-1.5 w-full bg-white border border-[#E2E8F0] rounded-[8px] shadow-lg py-1 z-50 animate-fade-in max-h-56 overflow-y-auto">
            {options.map((option) => {
                const isSelected = option.value === value;
                return (
                <div
                    key={option.value}
                    onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    }}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-[#E0F2FE]/40 text-[#06B6D4] font-semibold' : 'text-[#475569]'
                    }`}
                >
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#06B6D4] stroke-[2.5]" />}
                </div>
                );
            })}
            </div>
        )}
        </div>
    );
}