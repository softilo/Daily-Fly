import { requireStaffSession } from '@/services/auth/getMe';
import { getAgencySettings } from '@/services/settings/settings.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { AgencySettingsForm } from '@/components/module/settings/AgencySettingsForm';

export const instant = false;

export default async function AgencySettingsPage() {
  await requireStaffSession(['OWNER_ADMIN']);

  const settings = await getAgencySettings();

  return (
    <div>
      <ManagementPageHeader title="Agency Settings" />
      <AgencySettingsForm settings={settings} />
    </div>
  );
}
