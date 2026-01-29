import {
  makeStyles,
  tokens,
  Card,
  Text,
  Button,
} from '@fluentui/react-components';
import { CheckmarkCircle48Regular, ArrowReset24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
  },
  icon: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '64px',
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    marginBottom: tokens.spacingVerticalM,
  },
  message: {
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalXL,
    maxWidth: '400px',
    margin: '0 auto',
    lineHeight: tokens.lineHeightBase400,
  },
  actions: {
    marginTop: tokens.spacingVerticalXL,
  },
});

interface CompletionScreenProps {
  participantName: string;
}

export function CompletionScreen({ participantName }: CompletionScreenProps) {
  const styles = useStyles();

  const handleStartNew = () => {
    // Reload the page to start a fresh survey
    window.location.reload();
  };

  return (
    <Card className={styles.card}>
      <CheckmarkCircle48Regular className={styles.icon} />
      
      <Text size={700} weight="semibold" block className={styles.title}>
        Thank you, {participantName}!
      </Text>
      
      <Text size={400} block className={styles.message}>
        Your feedback has been successfully submitted. Your responses will help us 
        improve our products and services.
      </Text>

      <Text size={300} block style={{ color: tokens.colorNeutralForeground3 }}>
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
  );
}
