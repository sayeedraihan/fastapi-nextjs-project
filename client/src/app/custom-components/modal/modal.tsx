"use client"



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
        <div className="fixed inset-0 bg-shadowcolor flex justify-center items-center">
            <div className="bg-surface text-textprimary p-4 rounded-lg shadow-lg">
                <p>{message}</p>
                {onClose && !showCancelButton && <button onClick={onClose} className="bg-primary text-textprimary rounded-lg px-4 py-2 mt-4">OK</button>}
                {onOk && <button onClick={onOk} className="bg-primary text-textprimary rounded-lg px-4 py-2 mt-4">OK</button>}
                {showCancelButton && 
                    <button 
                        className={`
                            mt-2 mx-4 px-4 py-2 
                            border-none rounded-md 
                            cursor-pointer 
                            bg-destructive text-textprimary
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