import {
    makeStyles,
    shorthands,
    Card,
    Text,
    Button,
    tokens,
} from '@fluentui/react-components';
import {
    CheckmarkCircle48Regular,
    GridDots20Regular,
    ArrowExit20Regular,
} from '@fluentui/react-icons';

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
    actions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...shorthands.gap('12px'),
        marginTop: tokens.spacingVerticalXL,
    },
});

interface TopicCompletionScreenProps {
    topicTitle: string;
    completedCount: number;
    totalTopics: number;
    onSelectAnotherTopic: () => void;
    onEndSurvey: () => void;
}

export function TopicCompletionScreen({
    topicTitle,
    completedCount,
    totalTopics,
    onSelectAnotherTopic,
    onEndSurvey,
}: TopicCompletionScreenProps) {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <CheckmarkCircle48Regular className={styles.icon} />

                <Text size={700} weight="semibold" block className={styles.title}>
                    Thanks for your feedback on {topicTitle}!
                </Text>

                <Text size={400} block className={styles.message}>
                    Your responses for this topic have been saved. You&apos;ve completed {completedCount} of {totalTopics} topics.
                    {completedCount < totalTopics
                        ? ' You can select another topic to continue providing feedback, or finish the survey.'
                        : ' You\'ve covered all topics! You can finish the survey now.'}
                </Text>

                <div className={styles.actions}>
                    {completedCount < totalTopics && (
                        <Button
                            appearance="primary"
                            size="large"
                            icon={<GridDots20Regular />}
                            onClick={onSelectAnotherTopic}
                        >
                            Select another topic
                        </Button>
                    )}
                    <Button
                        appearance={completedCount >= totalTopics ? 'primary' : 'outline'}
                        size="large"
                        icon={<ArrowExit20Regular />}
                        onClick={onEndSurvey}
                    >
                        Finish survey
                    </Button>
                </div>
            </Card>
        </div>
    );
}
