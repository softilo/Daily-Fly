'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  PaginatedResponse,
  PaginationMeta,
  ServiceCategory,
  TourPackage,
} from '@/types/api';

export async function getPackages(params?: {
  page?: number;
  limit?: number;
  category?: ServiceCategory;
  search?: string;
  destination?: string;
  isArchived?: boolean;
}): Promise<PaginatedResponse<TourPackage>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.destination) query.set('destination', params.destination);
  // Note: Backend uses @Type(() => Boolean) without custom transform, which parses "false" as true.
  // Backend defaults to isArchived = false when omitted. Only send isArchived when explicitly true.
  if (params?.isArchived === true) {
    query.set('isArchived', 'true');
  }

  const endpoint = `/packages${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await serverFetch.get(endpoint);

  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  }

  const raw = (await res.json().catch(() => null)) as {
    data?: TourPackage[];
    meta?: PaginationMeta;
  } | TourPackage[] | null;

  const packages: TourPackage[] = Array.isArray((raw as { data?: TourPackage[] })?.data)
    ? ((raw as { data: TourPackage[] }).data)
    : Array.isArray(raw)
      ? (raw as TourPackage[])
      : [];

  const meta: PaginationMeta = (raw as { meta?: PaginationMeta })?.meta ?? {
    total: packages.length,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    totalPages: Math.ceil(packages.length / (params?.limit ?? 20)),
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    data: packages,
    meta,
  };
}

export async function getSinglePackage(
  id: string,
): Promise<TourPackage | null> {
  const res = await serverFetch.get(`/packages/${id}`);
  if (!res.ok) return null;
  const raw = (await res.json().catch(() => null)) as
    | { data?: TourPackage }
    | TourPackage
    | null;
  if (!raw) return null;
  return ('data' in raw && raw.data ? raw.data : raw) as TourPackage;
}

export interface UpsertPackagePayload {
  category?: ServiceCategory;
  title: string;
  destination: string;
  durationDays: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
  requiredDocuments?: string[];
  structuredSpecs?: Record<string, unknown>;
  basePrice: number;
  currency?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
  isArchived?: boolean;
}

function revalidatePackageRoutes(id?: string): void {
  revalidatePath('/dashboard/packages');
  revalidatePath('/packages');
  if (id) {
    revalidatePath(`/packages/${id}`);
    revalidatePath(`/dashboard/packages/${id}/edit`);
  }
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
}

export async function createPackage(
  payload: UpsertPackagePayload,
): Promise<{ success: boolean; message: string; data?: TourPackage }> {
  const res = await serverFetch.post('/packages', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create package',
    };
  }

  const created = (
    body && typeof body === 'object' && 'data' in body && body.data
      ? body.data
      : body
  ) as TourPackage;

  revalidatePackageRoutes(created?.id);

  return {
    success: true,
    message: 'Package created successfully',
    data: created,
  };
}

export async function updatePackage(
  id: string,
  payload: Partial<UpsertPackagePayload>,
): Promise<{ success: boolean; message: string; data?: TourPackage }> {
  const res = await serverFetch.patch(`/packages/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update package',
    };
  }

  const updated = (
    body && typeof body === 'object' && 'data' in body && body.data
      ? body.data
      : body
  ) as TourPackage;

  revalidatePackageRoutes(id);

  return {
    success: true,
    message: 'Package updated successfully',
    data: updated,
  };
}

export async function togglePackageVisibility(
  id: string,
  nextIsArchived: boolean,
): Promise<{ success: boolean; message: string }> {
  // Primary update path uses PATCH /packages/:id
  const patchRes = await serverFetch.patch(`/packages/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArchived: nextIsArchived }),
  });

  if (patchRes.ok) {
    revalidatePackageRoutes(id);
    return {
      success: true,
      message: nextIsArchived
        ? 'Package unpublished and hidden from website'
        : 'Package published and live on website',
    };
  }

  // Fallback for unpublishing when backend restricts `isArchived` updates to DELETE
  if (nextIsArchived) {
    const deleteRes = await serverFetch.delete(`/packages/${id}`);
    if (deleteRes.ok) {
      revalidatePackageRoutes(id);
      return {
        success: true,
        message: 'Package unpublished and hidden from website',
      };
    }
    const delBody = await deleteRes.json().catch(() => null);
    return {
      success: false,
      message: delBody?.message || 'Failed to unpublish package',
    };
  }

  const patchBody = await patchRes.json().catch(() => null);
  return {
    success: false,
    message: patchBody?.message || 'Failed to update package visibility',
  };
}

export async function archivePackage(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return togglePackageVisibility(id, true);
}
