import { useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  CardHeader,
  Text,
  Radio,
  RadioGroup,
  Button,
  Divider,
} from '@fluentui/react-components';
import { ShieldCheckmark24Regular } from '@fluentui/react-icons';
import { surveyConfig } from '../config/survey';

const useStyles = makeStyles({
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: tokens.spacingVerticalXL,
  },
  headerIcon: {
    color: tokens.colorBrandForeground1,
    fontSize: '24px',
  },
  description: {
    marginBottom: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground2,
  },
  consentBox: {
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
    maxHeight: '300px',
    overflowY: 'auto',
    whiteSpace: 'pre-line',
  },
  consentText: {
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase300,
  },
  consentLabel: {
    marginBottom: tokens.spacingVerticalM,
  },
  radioGroup: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalS,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalL,
  },
  optOutContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(180deg, #e3eeff 0%, #f3e7e9 100%)',
    ...shorthands.padding('0'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  optOutCard: {
    maxWidth: '600px',
    width: '100%',
    ...shorthands.padding('48px'),
    textAlign: 'center',
    backgroundColor: 'white',
    ...shorthands.borderRadius('12px'),
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    ...shorthands.margin('40px'),
  },
  optOutTitle: {
    marginBottom: tokens.spacingVerticalM,
  },
  optOutMessage: {
    color: '#616161',
    marginBottom: tokens.spacingVerticalXL,
    maxWidth: '440px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '22px',
  },
});

type ConsentChoice = '' | 'yes' | 'no';

interface ConsentFormProps {
  onAccept: () => void;
}

export function ConsentForm({ onAccept }: ConsentFormProps) {
  const styles = useStyles();
  const [choice, setChoice] = useState<ConsentChoice>('');
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <div className={styles.optOutContainer}>
        <Card className={styles.optOutCard}>
          <Text size={700} weight="semibold" block className={styles.optOutTitle}>
            Thank You
          </Text>
          <Text size={400} block className={styles.optOutMessage}>
            We appreciate your time. You have chosen not to participate in
            this survey. You may close this window.
          </Text>
        </Card>
      </div>
    );
  }

  const handleContinue = () => {
    if (choice === 'yes') {
      onAccept();
    } else if (choice === 'no') {
      setDeclined(true);
    }
  };

  return (
    <Card className={styles.card}>
      <CardHeader
        image={<ShieldCheckmark24Regular className={styles.headerIcon} />}
        header={
          <Text size={600} weight="semibold">
            Research Consent
          </Text>
        }
        description={
          <Text size={300} className={styles.description}>
            Please review the consent information below before proceeding
          </Text>
        }
      />

      <Divider />

      <div className={styles.consentBox}>
        <Text className={styles.consentText} size={300}>
          {surveyConfig.consentText}
        </Text>
      </div>

      <Text weight="semibold" className={styles.consentLabel}>
        I have read the{' '}
        <a
          href="https://microsoft.na3.adobesign.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhAMoGgput_MpuSsI1UTUE8zaMc8kA9Fc8idPF6P0D3g0hTffoYVi1jaN9808P1ghIA*"
          target="_blank"
          rel="noopener noreferrer"
        >
          participant consent form
        </a>{' '}
        and agree to the terms.
      </Text>

      <RadioGroup
        className={styles.radioGroup}
        value={choice}
        onChange={(_, data) => setChoice(data.value as ConsentChoice)}
      >
        <Radio value="yes" label="Yes, I agree and would like to continue." />
        <Radio value="no" label="No, I prefer to opt out." />
      </RadioGroup>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          size="large"
          disabled={choice === ''}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}
