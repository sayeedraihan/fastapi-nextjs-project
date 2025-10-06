"use client"

import styles from './modal.module.css';

type ModalProps = {
    isOpen?: boolean;
    onClose?: () => void;
    onOk?: () => void;
    message?: string;
    showCancelButton?: boolean
};

const Modal = ({ isOpen, onClose, onOk, message, showCancelButton }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className={`${styles.modalOverlay} bg-shadowcolor`}>
            <div className={`${styles.modalContent} bg-primaryorbackground text-fontcolor`}>
                <p>{message}</p>
                {onClose && !showCancelButton && <button onClick={onClose}>OK</button>}
                {onOk && <button onClick={onOk}>OK</button>}
                {showCancelButton && 
                    <button 
                        className={`
                            mt-2 mx-4 px-4 py-8 
                            border-none rounded-md 
                            cursor-pointer 
                            bg-primaryorbackground
                        `} 
                        onClick={onClose}
                    >
                        Cancel
                    </button>}
            </div>
        </div>
    );
};

export default Modal;