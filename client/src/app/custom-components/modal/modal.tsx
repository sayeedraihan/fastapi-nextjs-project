"use client"

type ModalProps = {
    isOpen?: boolean;
    onClose?: () => void;
    onOk?: () => void;
    message?: string;
    showCancelButton?: boolean;
    okText?: string;
    cancelText?: string;
};

const Modal = ({ isOpen, onClose, onOk, message, showCancelButton, okText, cancelText }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-shadowcolor flex justify-center items-center">
            <div className="bg-surface text-textprimary p-4 rounded-lg shadow-lg">
                <p>{message}</p>
                <div className="flex justify-end gap-x-4 mt-4">
                    {onClose && !showCancelButton && (
                        <button onClick={onClose} className="bg-primary text-textprimary rounded-lg px-4 py-2 mt-4">
                            {okText || "OK"}
                        </button>
                    )}
                    {onOk && (
                        <button onClick={onOk} className="bg-primary text-textprimary rounded-lg px-4 py-2">
                            {okText || "OK"}
                        </button>
                    )}
                    {showCancelButton && (
                        <button
                            className={`
                                mt-2 mx-4 px-4 py-2 
                                border-none rounded-md 
                                cursor-pointer 
                                bg-destructive text-textprimary
                            `}
                            onClick={onClose}
                        >
                            {cancelText || "Cancel"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;