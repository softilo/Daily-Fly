import { notFound } from 'next/navigation';
import { requireStaffSession } from '@/services/auth/getMe';
import { getSinglePackage } from '@/services/packages/packages.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { PackageForm } from '@/components/module/packages/PackageForm';

export const instant = false;

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [, pkg] = await Promise.all([
    requireStaffSession(['OWNER_ADMIN']),
    getSinglePackage(id),
  ]);

  if (!pkg) {
    notFound();
  }

  return (
    <div>
      <ManagementPageHeader
        title="Edit Tour & Hajj Package"
        actionLabel="← Back to Catalog"
        actionHref="/dashboard/packages"
      />
      <PackageForm mode="edit" initialData={pkg} />
    </div>
  );
}
