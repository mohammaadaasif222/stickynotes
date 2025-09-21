// Usage Examples Component
import { useModal } from "../../hooks/useModal";
import { Button } from "./Button";
import { Modal } from "./Modal";

export const ModalDemo = () => {
  const modal = useModal();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Modal Examples</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button onClick={modal.openModal} variant="outline">
          Warning Modal
        </Button>
      </div>

      {/* Warning Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        variant="error"
        title="Warning"
        message="Are you sure you want to proceed? This action cannot be undone."
        showConfirm
        showCancel
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />
    </div>
  );
};
