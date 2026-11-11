import { ArrowRight, MapPin } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';
import { resume } from '../../content/resume';
import { ScreenLayout } from '../screens/ScreenLayout';
import { sectionScreenProps } from '../screens/sectionMeta';
import { latestNews } from './latestNews';
import styles from './AboutScreen.module.css';

const news = latestNews(resume);

/** About: a short bio beside a "latest news" feed of recent roles. */
export function AboutScreen() {
  const { name, headline, location, bio } = resume.profile;
  const newsHeading = useId();

  return (
    <ScreenLayout {...sectionScreenProps('about')}>
      <div className={styles.about}>
        <section className={styles.profile}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.headline}>{headline}</p>
          <p className={styles.location}>
            <MapPin aria-hidden="true" />
            <span>{location}</span>
          </p>
          {bio.map((paragraph) => (
            <p key={paragraph} className={styles.bio}>
              {paragraph}
            </p>
          ))}
        </section>

        <section className={styles.news} aria-labelledby={newsHeading}>
          <h2 id={newsHeading} className={styles.newsTitle}>
            Latest news
          </h2>
          <ul aria-label="Latest news" className={styles.feed}>
            {news.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  state={{ from: '/about' }}
                  viewTransition
                  className={styles.item}
                >
                  <span className={styles.when}>{item.when}</span>
                  <span className={styles.itemHeadline}>{item.headline}</span>
                  <span className={styles.summary}>{item.summary}</span>
                  <ArrowRight className={styles.arrow} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScreenLayout>
  );
}
