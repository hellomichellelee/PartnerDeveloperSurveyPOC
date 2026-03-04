import {
  Button,
  makeStyles,
  shorthands,
  Text,
  mergeClasses,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Regular,
  GlobeSurface24Regular,
  Organization24Regular,
  Library24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';
import type { SurveyTopic } from '../types';

// Map icon string keys to actual Fluent icon components
const iconMap: Record<string, React.ReactNode> = {
  CheckmarkCircle: <CheckmarkCircle24Regular />,
  GlobeSurface: <GlobeSurface24Regular />,
  Organization: <Organization24Regular />,
  Library: <Library24Regular />,
  Settings: <Settings24Regular />,
};

interface TopicMenuProps {
  topics: SurveyTopic[];
  completedTopics: Set<string>;
  onTopicSelect: (topicId: string) => void;
  onEndSurvey: () => void;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(180deg, #e3eeff 0%, #f3e7e9 100%)',
    ...shorthands.padding('0'),
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('60px', '66px', '60px', '66px'),
    flexGrow: 1,
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    boxSizing: 'border-box',
    '@media (max-width: 1024px)': {
      ...shorthands.padding('48px', '40px', '48px', '40px'),
    },
    '@media (max-width: 600px)': {
      ...shorthands.padding('32px', '24px', '32px', '24px'),
    },
  },

  title: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    fontWeight: 600,
    fontSize: '40px',
    lineHeight: '52px',
    color: '#242424',
    marginBottom: '16px',
    '@media (max-width: 1024px)': {
      fontSize: '36px',
      lineHeight: '48px',
    },
    '@media (max-width: 600px)': {
      fontSize: '28px',
      lineHeight: '36px',
    },
  },

  subtitle: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '22px',
    color: '#424242',
    marginBottom: '32px',
    maxWidth: '900px',
    '@media (max-width: 600px)': {
      fontSize: '14px',
      lineHeight: '20px',
      marginBottom: '24px',
    },
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    ...shorthands.gap('24px'),
    '@media (max-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr',
      ...shorthands.gap('16px'),
    },
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    ...shorthands.borderRadius('12px'),
    ...shorthands.padding('20px'),
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
    minHeight: '180px',
    ':hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-2px)',
    },
  },

  cardCompleted: {
    opacity: 0.6,
    cursor: 'default',
    ':hover': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      transform: 'none',
    },
  },

  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '12px',
    ...shorthands.gap('8px'),
  },

  cardIcon: {
    color: '#0078d4',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    fontWeight: 600,
    fontSize: '16px',
    lineHeight: '22px',
    color: '#242424',
  },

  cardDescription: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    color: '#616161',
    flexGrow: 1,
    marginBottom: '16px',
  },

  feedbackButton: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '40px',
    ...shorthands.gap('12px'),
  },

  completedCount: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '20px',
    color: '#616161',
    alignSelf: 'center',
    marginRight: 'auto',
  },
});

export function TopicMenu({ topics, completedTopics, onTopicSelect, onEndSurvey }: TopicMenuProps) {
  const styles = useStyles();

  const handleCardClick = (topicId: string) => {
    if (!completedTopics.has(topicId)) {
      onTopicSelect(topicId);
    }
  };

  const handleButtonClick = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completedTopics.has(topicId)) {
      onTopicSelect(topicId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Text as="h1" className={styles.title}>
          Select a topic
        </Text>
        <Text as="p" className={styles.subtitle}>
          Select a topic to provide feedback about a feature that you have interacted with while using Dragon admin center. Once you&apos;ve provided thoughts on a topic, you will be able to return to this menu to select another topic you would like to discuss. When you are finished providing feedback you can end the survey.
        </Text>

        <div className={styles.grid}>
          {topics.map((topic) => {
            const isCompleted = completedTopics.has(topic.id);
            return (
              <div
                key={topic.id}
                className={mergeClasses(
                  styles.card,
                  isCompleted && styles.cardCompleted
                )}
                onClick={() => handleCardClick(topic.id)}
                role="button"
                tabIndex={isCompleted ? -1 : 0}
                aria-disabled={isCompleted}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>
                    {iconMap[topic.icon] || <Library24Regular />}
                  </span>
                  <Text className={styles.cardTitle}>{topic.title}</Text>
                </div>
                <Text className={styles.cardDescription}>
                  {topic.description}
                </Text>
                <Button
                  appearance="outline"
                  size="small"
                  className={styles.feedbackButton}
                  disabled={isCompleted}
                  onClick={(e) => handleButtonClick(topic.id, e)}
                >
                  {isCompleted ? 'Feedback submitted' : 'Share feedback'}
                </Button>
              </div>
            );
          })}
        </div>

        {completedTopics.size > 0 && (
          <div className={styles.footer}>
            <Text className={styles.completedCount}>
              {completedTopics.size} of {topics.length} topics completed
            </Text>
            <Button
              appearance="primary"
              size="large"
              onClick={onEndSurvey}
            >
              Finish survey
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
