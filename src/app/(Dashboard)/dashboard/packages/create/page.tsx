import { requireStaffSession } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { CreatePackageForm } from '@/components/module/packages/CreatePackageForm';

export const instant = false;

export default async function CreatePackagePage() {
  await requireStaffSession(['OWNER_ADMIN']);

  return (
    <div>
      <ManagementPageHeader
        title="Create Verified Tour Package"
        actionLabel="← Back to Catalog"
        actionHref="/dashboard/packages"
      />
      <CreatePackageForm />
    </div>
  );
}
