import { resume } from '../../content/resume';
import { PROMPTS } from '../hud/prompts';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import { ContactCards } from './ContactCards';

export function ContactScreen() {
  return (
    <ScreenLayout prompts={[PROMPTS.move, PROMPTS.open]} {...sectionScreenProps('contact')}>
      <ContactCards contact={resume.contact} />
    </ScreenLayout>
  );
}
