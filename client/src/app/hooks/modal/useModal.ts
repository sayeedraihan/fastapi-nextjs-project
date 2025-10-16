"use client"

import { useState, useCallback } from 'react';

export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    // The state will hold the function directly, or null.
    const [onOkCallback, setOnOkCallback] = useState<(() => void) | null>(null);

    const showModal = useCallback((newMessage: string, onOk?: () => void) => {
        setMessage(newMessage);
        setIsOpen(true);
        // If an onOk callback is provided, store it directly.
        if(onOk) {
            setOnOkCallback(() => onOk);
        }
    }, []);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        setMessage('');
        setOnOkCallback(null); // Reset the callback on close.
    }, []);

    return {
        isOpen,
        message,
        showModal,
        hideModal,
        onOk: onOkCallback,
    };
};