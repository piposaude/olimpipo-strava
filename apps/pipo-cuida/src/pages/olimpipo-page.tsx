import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/olimpipo';
import { EditionsScreen } from '@/components/olimpipo/editions-screen/editions-screen';
import { RankingScreen } from '@/components/olimpipo/ranking-screen/ranking-screen';
import { ActivitiesScreen } from '@/components/olimpipo/activities-screen/activities-screen';
import type { Edition } from '@/components/olimpipo/types';
import styles from './olimpipo-page.module.css';

type View =
  | { kind: 'editions' }
  | { kind: 'ranking'; edition: Edition }
  | { kind: 'activities'; edition: Edition };

export function OlimpipoPage() {
  const { participant_id, company_id } = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ kind: 'editions' });
  const [form, setForm] = useState({ participant_id: '', company_id: 'pipo-hackathon' });

  if (!participant_id) {
    return (
      <div className={styles.loginShell}>
        <div className={styles.loginCard}>
          <div className={styles.loginEyebrow}>
            <img src="/assets/icons/illus-olimpipo.svg" alt="" className={styles.loginIcon} />
            Olimpipo
          </div>
          <h1 className={styles.loginTitle}>Quem é você?</h1>
          <p className={styles.loginSub}>
            Informe seu ID de participante para continuar.
          </p>
          <label className={styles.loginLabel}>
            ID do participante
            <input
              className={styles.loginInput}
              type="text"
              placeholder="ex: lara.clink"
              value={form.participant_id}
              onChange={(e) => setForm((f) => ({ ...f, participant_id: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && form.participant_id.trim()) {
                  navigate({ to: '/olimpipo', search: { participant_id: form.participant_id.trim(), company_id: form.company_id } });
                }
              }}
            />
          </label>
          <label className={styles.loginLabel}>
            Empresa
            <input
              className={styles.loginInput}
              type="text"
              value={form.company_id}
              onChange={(e) => setForm((f) => ({ ...f, company_id: e.target.value }))}
            />
          </label>
          <button
            type="button"
            className={styles.loginBtn}
            disabled={!form.participant_id.trim()}
            onClick={() =>
              navigate({ to: '/olimpipo', search: { participant_id: form.participant_id.trim(), company_id: form.company_id } })
            }
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (view.kind === 'editions') {
    return (
      <EditionsScreen
        participantId={participant_id}
        companyId={company_id}
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
