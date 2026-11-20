'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, EyeOff, Pencil } from 'lucide-react';
import { togglePackageVisibility } from '@/services/packages/packages.service';

export function PackageTableRowActions({
  id,
  isArchived,
  isAdmin,
}: {
  id: string;
  isArchived: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleVisibility = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await togglePackageVisibility(id, !isArchived);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
        {!isArchived ? (
          <Link
            href={`/packages/${id}`}
            target="_blank"
            title="Preview public package page"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[#0A3A23]/40 hover:bg-[#F9FAFB] hover:text-[#0A3A23]"
          >
            <span>Preview</span>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </Link>
        ) : (
          <span
            title="Publish this package to view its public link"
            className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-gray-200/70 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-400"
          >
            <span>Hidden</span>
          </span>
        )}

        {isAdmin && (
          <>
            <Link
              href={`/dashboard/packages/${id}/edit`}
              title="Edit package details"
              className="inline-flex items-center gap-1 rounded-lg border border-[#0A3A23]/25 bg-[#edf7f1] px-2.5 py-1.5 text-xs font-bold text-[#0A3A23] transition hover:bg-[#0A3A23] hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              disabled={isPending}
              onClick={handleToggleVisibility}
              title={
                isArchived
                  ? 'Make package public on website'
                  : 'Unpublish package from public website'
              }
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                isArchived
                  ? 'border-[#0A3A23] bg-[#0A3A23] text-white hover:bg-[#062416]'
                  : 'border-[#F7D29E] bg-[#FEF3E2] text-[#BF6F1E] hover:bg-[#D9822B] hover:text-white'
              }`}
            >
              {isArchived ? (
                <>
                  <Eye className="h-3 w-3" />
                  <span>{isPending ? 'Publishing...' : 'Publish'}</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>{isPending ? 'Updating...' : 'Unpublish'}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
      {errorMsg && (
        <span className="max-w-[230px] text-[11px] font-medium text-rose-600">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
