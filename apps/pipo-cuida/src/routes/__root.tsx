import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TopBar } from '@/components/ui/top-bar/top-bar';
import styles from './__root.module.css';

export const Route = createRootRoute({
  component: () => (
    <div className={styles.app}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  ),
});
