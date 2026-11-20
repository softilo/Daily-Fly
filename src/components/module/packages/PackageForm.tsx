'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createPackage,
  updatePackage,
} from '@/services/packages/packages.service';
import { ServiceCategory, TourPackage } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function parseLines(raw: FormDataEntryValue | null): string[] {
  return String(raw || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function PackageForm({
  mode,
  initialData,
}: {
  mode: 'create' | 'edit';
  initialData?: TourPackage;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [isPublic, setIsPublic] = useState(
    initialData ? !initialData.isArchived : true,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    const payload = {
      category: (formData.get('category') as ServiceCategory) || 'TOUR',
      title: String(formData.get('title') || '').trim(),
      destination: String(formData.get('destination') || '').trim(),
      durationDays: Number(formData.get('durationDays')) || 3,
      basePrice: Number(formData.get('basePrice')) || 0,
      currency: String(formData.get('currency') || 'BDT'),
      description: String(formData.get('description') || '').trim(),
      inclusions: parseLines(formData.get('inclusions')),
      exclusions: parseLines(formData.get('exclusions')),
      requiredDocuments: parseLines(formData.get('requiredDocuments')),
      notes: String(formData.get('notes') || '').trim() || undefined,
      ...(mode === 'edit' ? { isArchived: !isPublic } : {}),
    };

    startTransition(async () => {
      const res =
        mode === 'edit' && initialData
          ? await updatePackage(initialData.id, payload)
          : await createPackage(payload);

      if (!res.success) {
        setError(res.message);
        return;
      }

      router.push('/dashboard/packages');
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle>
          {mode === 'edit'
            ? `Edit Package Details — ${initialData?.title || ''}`
            : 'Add Verified Tour Package to Catalog'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {mode === 'edit' && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0A3A23]/15 bg-[#edf7f1]/60 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0A3A23]">
                  Website Visibility Status
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  {isPublic
                    ? 'Public — visible on the homepage and public packages catalog.'
                    : 'Unpublished — hidden from visitors and excluded from public pages.'}
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    isPublic
                      ? 'bg-[#0A3A23] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    !isPublic
                      ? 'bg-[#D9822B] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Unpublished
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Package Category *</Label>
              <select
                id="category"
                name="category"
                defaultValue={initialData?.category || 'TOUR'}
                className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0A3A23] focus:outline-none focus:ring-2 focus:ring-[#0A3A23]/15"
              >
                <option value="TOUR">Holiday Tour Package</option>
                <option value="HAJJ_UMRAH">Hajj &amp; Umrah Package</option>
              </select>
              {mode === 'create' && (
                <p className="mt-1.5 text-[11px] text-gray-500">
                  For Student Visa or Work Permits,{' '}
                  <Link
                    href="/dashboard/visa-immigration/services/create"
                    className="font-semibold text-[#0A3A23] hover:text-[#D9822B] hover:underline"
                  >
                    create a Visa Service instead →
                  </Link>
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="title">Package / Program Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initialData?.title || ''}
                placeholder="e.g., Cox's Bazar 3D/2N Luxury Beach Escape"
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                name="destination"
                defaultValue={initialData?.destination || ''}
                placeholder="e.g., Cox's Bazar"
                required
              />
            </div>
            <div>
              <Label htmlFor="durationDays">Duration (Days) *</Label>
              <Input
                id="durationDays"
                name="durationDays"
                type="number"
                min={1}
                defaultValue={initialData?.durationDays ?? 3}
                required
              />
            </div>
            <div>
              <Label htmlFor="basePrice">
                Indicative Base Price (Per Person) *
              </Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                min={0}
                defaultValue={
                  initialData?.basePrice !== undefined
                    ? Number(initialData.basePrice)
                    : undefined
                }
                placeholder="e.g., 12500"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                defaultValue={initialData?.currency || 'BDT'}
                className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0A3A23] focus:outline-none focus:ring-2 focus:ring-[#0A3A23]/15"
              >
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Package Overview &amp; Itinerary *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ''}
              placeholder="Detailed overview of itinerary, hotel category, and transport..."
              className="min-h-[110px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="inclusions">Inclusions (One per line)</Label>
              <Textarea
                id="inclusions"
                name="inclusions"
                defaultValue={(initialData?.inclusions || []).join('\n')}
                placeholder={
                  'AC Bus / Flight\n3-Star Beach View Hotel\nDaily Buffet Breakfast'
                }
                className="min-h-[110px]"
              />
            </div>
            <div>
              <Label htmlFor="exclusions">Exclusions (One per line)</Label>
              <Textarea
                id="exclusions"
                name="exclusions"
                defaultValue={(initialData?.exclusions || []).join('\n')}
                placeholder={'Personal expenses\nLunch & Dinner\nEntry tickets'}
                className="min-h-[110px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="requiredDocuments">
                Required Documents (One per line)
              </Label>
              <Textarea
                id="requiredDocuments"
                name="requiredDocuments"
                defaultValue={(initialData?.requiredDocuments || []).join('\n')}
                placeholder={
                  'Valid Passport (min 6 months)\nNID Copy\nPassport-size Photographs'
                }
              />
            </div>
            <div>
              <Label htmlFor="notes">Staff / Package Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={initialData?.notes || ''}
                placeholder="Internal remarks or seasonal validity notes..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <Link href="/dashboard/packages">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending
                ? mode === 'edit'
                  ? 'Saving Changes...'
                  : 'Publishing...'
                : mode === 'edit'
                  ? '✓ Save Package Changes'
                  : '✓ Publish Approved Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
