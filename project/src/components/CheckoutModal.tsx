import React from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export default function CheckoutModal({ isOpen, onClose, item }: CheckoutModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Complete Purchase</h3>
        <div className="flex items-center space-x-4 mb-4">
          <img src={item.image} alt={item.breed} className="w-20 h-20 object-cover rounded-lg" />
          <div>
            <div className="font-semibold">{item.breed}</div>
            <div className="text-sm text-gray-600">₹{item.price.toLocaleString('en-IN')}</div>
            <div className="text-sm text-gray-500">{item.ageMonths} months</div>
          </div>
        </div>

        <div className="space-x-2 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button
            onClick={() => {
              // mock purchase
              alert(`Purchase complete for ${item.breed}`);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-green-600 text-white"
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
