import { useHubMemory } from '../../app/hubMemory';
import { acronym, formatRange } from '../../content/format';
import { resume } from '../../content/resume';
import { HubTile, type TileVariant } from '../hub/HubTile';
import { PROMPTS } from '../hud/prompts';
import { TileGrid } from '../hub/TileGrid';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';

const VARIANTS: TileVariant[] = ['blue', 'teal', 'amber', 'violet'];

/** The Experience hub: one tile per role, newest first. */
export function ExperienceScreen() {
  const tiles = useHubMemory('experience');

  return (
    <ScreenLayout
      prompts={[PROMPTS.move, PROMPTS.open]}
      {...sectionScreenProps('experience')}
      focusTitle={!tiles.restoring}
    >
      <TileGrid
        label="Roles"
        items={resume.experience.map((role, i) => ({
          key: role.id,
          to: `/experience/${role.id}`,
          label: role.title,
          children: ({ link, descriptionId }) => (
            <HubTile
              mono={acronym(role.company)}
              badge={String(role.dates.start.year)}
              variant={VARIANTS[i % VARIANTS.length]!}
              title={link}
              descriptionId={descriptionId}
              subtitle={role.team ? `${role.company} · ${role.team}` : role.company}
              meta={formatRange(role.dates)}
            />
          ),
        }))}
        selectedKey={tiles.selected}
        onSelect={tiles.select}
        focusOnMount={tiles.restoring}
        linkState={{ from: '/experience' }}
      />
    </ScreenLayout>
  );
}
