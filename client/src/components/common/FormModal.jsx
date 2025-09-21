export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  submitVariant = 'primary',
  loading = false,
  size = 'md',
  className = ''
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant={submitVariant} loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};