import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Text,
  Input,
  Button,
  Field,
  Divider,
} from '@fluentui/react-components';
import { Person24Regular, Mail24Regular } from '@fluentui/react-icons';
import type { Participant } from '../types';

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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    marginTop: tokens.spacingVerticalL,
  },
  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: tokens.spacingVerticalL,
  },
});

interface ParticipantFormProps {
  onSubmit: (participant: Participant) => void;
}

export function ParticipantForm({ onSubmit }: ParticipantFormProps) {
  const styles = useStyles();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        onSubmit({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          consentGiven: true,
        });
      }
    },
    [firstName, lastName, email, validateForm, onSubmit]
  );

  return (
    <Card className={styles.card}>
      <CardHeader
        image={<Person24Regular className={styles.headerIcon} />}
        header={
          <Text size={600} weight="semibold">
            Participant Information
          </Text>
        }
        description={
          <Text size={300}>
            Please provide your contact information
          </Text>
        }
      />

      <Divider />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.nameRow}>
          <Field
            label="First name"
            required
            validationState={errors.firstName ? 'error' : undefined}
            validationMessage={errors.firstName}
          >
            <Input
              value={firstName}
              onChange={(_, data) => setFirstName(data.value)}
              placeholder="Enter your first name"
            />
          </Field>

          <Field
            label="Last name"
            required
            validationState={errors.lastName ? 'error' : undefined}
            validationMessage={errors.lastName}
          >
            <Input
              value={lastName}
              onChange={(_, data) => setLastName(data.value)}
              placeholder="Enter your last name"
            />
          </Field>
        </div>

        <Field
          label="Email address"
          required
          validationState={errors.email ? 'error' : undefined}
          validationMessage={errors.email}
        >
          <Input
            type="email"
            value={email}
            onChange={(_, data) => setEmail(data.value)}
            placeholder="you@example.com"
            contentBefore={<Mail24Regular />}
          />
        </Field>

        <div className={styles.actions}>
          <Button appearance="primary" size="large" type="submit">
            Start Survey
          </Button>
        </div>
      </form>
    </Card>
  );
}
