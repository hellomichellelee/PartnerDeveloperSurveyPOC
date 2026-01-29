import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { DocumentBulletList24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    boxShadow: tokens.shadow2,
  },
  icon: {
    color: tokens.colorBrandForeground1,
    fontSize: '24px',
  },
  title: {
    color: tokens.colorNeutralForeground1,
  },
});

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <DocumentBulletList24Regular className={styles.icon} />
      <Text 
        as="h1" 
        size={500} 
        weight="semibold" 
        className={styles.title}
      >
        {title}
      </Text>
    </header>
  );
}
