import React from 'react';
import { requireStaffSession } from '@/services/auth/getMe';
import CountryForm from '@/components/module/visa/CountryForm';

export const instant = false;

export default async function CreateCountryPage() {
  await requireStaffSession();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Destination Country</h1>
        <p className="text-sm text-slate-600">
          Create a new destination country profile for visa and immigration services.
        </p>
      </div>
      <CountryForm />
    </div>
  );
}
