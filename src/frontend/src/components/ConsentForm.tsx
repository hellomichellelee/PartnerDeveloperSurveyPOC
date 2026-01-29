import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Text,
  Checkbox,
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
  checkboxContainer: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalL,
  },
});

interface ConsentFormProps {
  onAccept: () => void;
}

export function ConsentForm({ onAccept }: ConsentFormProps) {
  const styles = useStyles();
  const [agreed, setAgreed] = useState(false);

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

      <div className={styles.checkboxContainer}>
        <Checkbox
          checked={agreed}
          onChange={(_, data) => setAgreed(data.checked === true)}
          label={
            <Text weight="semibold">
              I have read and agree to the terms above
            </Text>
          }
        />
      </div>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          size="large"
          disabled={!agreed}
          onClick={onAccept}
        >
          Continue to Survey
        </Button>
      </div>
    </Card>
  );
}
