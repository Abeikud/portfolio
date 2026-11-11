import { resume } from '../../content/resume';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import { ContactCards } from './ContactCards';

export function ContactScreen() {
  return (
    <ScreenLayout {...sectionScreenProps('contact')}>
      <ContactCards contact={resume.contact} />
    </ScreenLayout>
  );
}
