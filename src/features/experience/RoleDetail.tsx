import { useParams } from 'react-router';
import { useReturnToHub } from '../../app/hubMemory';
import { formatRange } from '../../content/format';
import { resume } from '../../content/resume';
import { SITE_NAME } from '../../hooks/useDocumentTitle';
import { DetailBody } from '../screens/DetailBody';
import detailStyles from '../screens/DetailBody.module.css';
import { NotFound } from '../screens/NotFound';
import { ScreenLayout } from '../screens/ScreenLayout';

/** /experience/:id: one role in full. */
export function RoleDetail() {
  const { id } = useParams();
  const role = resume.experience.find((r) => r.id === id);
  useReturnToHub('experience', role?.id);

  if (!role) return <NotFound />;

  return (
    <ScreenLayout
      title={role.title}
      crumb={role.title}
      trail={[{ label: 'Experience', to: '/experience' }]}
      documentTitle={`${role.title} | ${SITE_NAME}`}
      sectionId="experience"
      backTo="/experience"
    >
      <DetailBody
        lead={
          <>
            <span className={detailStyles.badge}>{formatRange(role.dates)}</span>
            <span>{role.company}</span>
            {role.team && <span className={detailStyles.muted}>{role.team}</span>}
          </>
        }
        bullets={role.bullets}
        stack={role.stack}
      />
    </ScreenLayout>
  );
}
