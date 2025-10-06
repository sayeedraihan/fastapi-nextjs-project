"use client"

import { useCallback, useState } from 'react';

export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [onOkCallback, setOnOkCallback] = useState<(() => void) | null>(null);

    const showModal = useCallback((newMessage: string, onOk?: () => void) => {
        setMessage(newMessage);
        setIsOpen(true);
        if(onOk) {
            setOnOkCallback(onOk);
        }
    }, []);

    const hideModal = useCallback(() => {
        setIsOpen(false);
        setMessage('');
    }, []);

    return {
        isOpen,
        message,
        showModal,
        hideModal,
        onOk: onOkCallback
    };
};