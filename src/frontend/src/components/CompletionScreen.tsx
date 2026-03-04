import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Button,
} from '@fluentui/react-components';
import { CheckmarkCircle48Regular, ArrowReset24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(180deg, #e3eeff 0%, #f3e7e9 100%)',
    ...shorthands.padding('0'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    ...shorthands.padding('48px'),
    textAlign: 'center',
    backgroundColor: 'white',
    ...shorthands.borderRadius('12px'),
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    ...shorthands.margin('40px'),
  },
  icon: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '64px',
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    marginBottom: tokens.spacingVerticalM,
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
  },
  message: {
    color: '#616161',
    marginBottom: tokens.spacingVerticalXL,
    maxWidth: '440px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '22px',
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
  },
  subtitle: {
    color: '#8a8a8a',
    fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif',
  },
  actions: {
    marginTop: tokens.spacingVerticalXL,
  },
});

interface CompletionScreenProps {
  participantName: string;
  completedTopicCount?: number;
}

export function CompletionScreen({ participantName, completedTopicCount }: CompletionScreenProps) {
  const styles = useStyles();

  const handleStartNew = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CheckmarkCircle48Regular className={styles.icon} />

        <Text size={700} weight="semibold" block className={styles.title}>
          Thank you, {participantName}!
        </Text>

        <Text size={400} block className={styles.message}>
          Your feedback has been successfully submitted.
          {completedTopicCount !== undefined && completedTopicCount > 0 && (
            <> You provided feedback on {completedTopicCount} topic{completedTopicCount !== 1 ? 's' : ''}.</>
          )}
          {' '}Your responses will help us improve Dragon admin center.
        </Text>

        <Text size={300} block className={styles.subtitle}>
          You can now close this window or start a new survey.
        </Text>

        <div className={styles.actions}>
          <Button
            appearance="subtle"
            icon={<ArrowReset24Regular />}
            onClick={handleStartNew}
          >
            Start New Survey
          </Button>
        </div>
      </Card>
    </div>
  );
}
