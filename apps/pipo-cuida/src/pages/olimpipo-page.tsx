import { useState } from 'react';
import { EditionsScreen } from '@/components/olimpipo/editions-screen/editions-screen';
import { RankingScreen } from '@/components/olimpipo/ranking-screen/ranking-screen';
import { ActivitiesScreen } from '@/components/olimpipo/activities-screen/activities-screen';
import type { Edition } from '@/components/olimpipo/types';

type View =
  | { kind: 'editions' }
  | { kind: 'ranking'; edition: Edition }
  | { kind: 'activities'; edition: Edition };

export function OlimpipoPage() {
  const [view, setView] = useState<View>({ kind: 'editions' });

  if (view.kind === 'editions') {
    return (
      <EditionsScreen
        onOpenEdition={(edition) => setView({ kind: 'ranking', edition })}
      />
    );
  }

  if (view.kind === 'ranking') {
    return (
      <RankingScreen
        edition={view.edition}
        onBack={() => setView({ kind: 'editions' })}
        onOpenActivities={() =>
          setView({ kind: 'activities', edition: view.edition })
        }
      />
    );
  }

  return (
    <ActivitiesScreen
      edition={view.edition}
      onBack={() => setView({ kind: 'ranking', edition: view.edition })}
    />
  );
}
