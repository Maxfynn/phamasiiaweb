import React, { useState, ChangeEvent, FormEvent } from 'react';

interface AddDrugProps {
  onSuccess?: () => void;
}

interface FormData {
  type: string;
  name: string;
  brand: string;
  amount: string;
  doseQuantity: string;
  stockType: string;
  manufacturedAt: string;
  expiredAt: string;
  purchasePrice: string;
  salesPrice: string;
  location: string;
  storeId: number;
  unitCostPrice: string;
  remainingQuantity: string;
}

interface FormErrors extends Partial<Record<keyof FormData, string>> {}

interface ResponseMessage {
  type: 'success' | 'error';
  text: string;
}

export default function AddDrug({ onSuccess }: AddDrugProps) {
  const initialFormState: FormData = {
    type: '',
    name: '',
    brand: '',
    amount: '',
    doseQuantity: '',
    stockType: '',
    manufacturedAt: '',
    expiredAt: '',
    purchasePrice: '',
    salesPrice: '',
    location: '',
    storeId: 1,
    unitCostPrice: '',
    remainingQuantity: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [responseMessage, setResponseMessage] = useState<ResponseMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    const now = new Date();

    if (!formData.type) errors.type = 'Type is required.';
    if (!formData.name) errors.name = 'Drug name is required.';
    if (!formData.brand) errors.brand = 'Brand is required.';
    if (!formData.stockType) errors.stockType = 'Stock type is required.';
    if (!formData.location) errors.location = 'Location is required.';

    const floatFields = ['amount', 'doseQuantity', 'purchasePrice', 'salesPrice', 'unitCostPrice', 'remainingQuantity'] as const;

    floatFields.forEach((key) => {
      const value = parseFloat(formData[key]);
      if (!formData[key] || isNaN(value) || value < 0) {
        errors[key] = `${key.replace(/([A-Z])/g, ' $1')} must be a valid number ≥ 0.`;
      }
    });

    const manufactured = new Date(formData.manufacturedAt);
    if (!formData.manufacturedAt) {
      errors.manufacturedAt = 'Manufactured date is required.';
    } else if (manufactured > now) {
      errors.manufacturedAt = 'Manufactured date cannot be in the future.';
    }

    const expired = new Date(formData.expiredAt);
    if (!formData.expiredAt) {
      errors.expiredAt = 'Expiration date is required.';
    } else if (expired < now) {
      errors.expiredAt = 'Expiration date cannot be in the past.';
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResponseMessage(null);
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      setResponseMessage({ type: 'error', text: 'Please fix the errors above.' });
      return;
    }

    setFormErrors({});
    try {
      const response = await fetch('/api/drugstore/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add drug');

      setResponseMessage({ type: 'success', text: data.message || 'Drug added successfully.' });
      setFormData(initialFormState);
      setIsFormOpen(false);
      onSuccess?.();
    } catch (error: any) {
      setResponseMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (id: keyof FormData, label: string, type: string = 'text') => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={formData[id]}
        onChange={handleChange}
        placeholder={label}
        className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
      />
      {formErrors[id] && <p className="text-red-600 text-sm">{formErrors[id]}</p>}
    </div>
  );

  const renderSelectField = (id: keyof FormData, label: string, options: string[]) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
      <select
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
      >
        <option value="">Select option</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      {formErrors[id] && <p className="text-red-600 text-sm">{formErrors[id]}</p>}
    </div>
  );

  const renderDateField = (id: keyof FormData, label: string) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">{label}</label>
      <input
        id={id}
        name={id}
        type="date"
        value={formData[id]}
        onChange={handleChange}
        className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
      />
      {formErrors[id] && <p className="text-red-600 text-sm">{formErrors[id]}</p>}
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6 border p-4 rounded-md shadow-sm">
        <h1 className="text-2xl font-bold">Drugs Store</h1>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            + Add Drug
          </button>
        )}
      </div>

      {responseMessage && (
        <div
          aria-live="polite"
          className={`mb-5 p-3 rounded text-sm ${responseMessage.type === 'success'
            ? 'text-green-800 bg-green-100 border border-green-300'
            : 'text-red-800 bg-red-100 border border-red-300'}`}
        >
          {responseMessage.text}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelectField('type', 'Type', ['Tablet', 'Syrup', 'Cosmetic'])}
            {renderSelectField('stockType', 'Stock Type', ['Single', 'Boxes', 'Bottles', 'Sheets'])}
            {renderInputField('name', 'Drug Name')}
            {renderInputField('brand', 'Brand')}
            {renderInputField('amount', 'Amount', 'number')}
            {renderInputField('doseQuantity', 'Dose Quantity', 'number')}
            {renderInputField('unitCostPrice', 'Unit Cost Price', 'number')}
            {renderInputField('remainingQuantity', 'Remaining Quantity', 'number')}
            {renderInputField('purchasePrice', 'Purchase Price', 'number')}
            {renderInputField('salesPrice', 'Sales Price', 'number')}
            {renderInputField('location', 'Location')}
            {renderDateField('manufacturedAt', 'Manufactured Date')}
            {renderDateField('expiredAt', 'Expiration Date')}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
