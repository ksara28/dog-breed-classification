interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  breed: string;
}

export default function ContactModal({ isOpen, onClose, breed }: ContactModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert(`Message sent to seller about ${breed}. (Mock)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Contact Seller</h3>
        <p className="text-sm text-gray-600 mb-4">About: <strong>{breed}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Message</label>
            <textarea required className="w-full mt-1 border-2 border-gray-200 rounded-lg p-3" rows={4} />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}
