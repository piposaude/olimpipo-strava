import { renderHook } from '@testing-library/react';
import { useHome, targetToPath } from './use-home';

describe('useHome', () => {
  it('returns two help tiles and five quick links with one Olimpipo entry', () => {
    const { result } = renderHook(() => useHome());
    expect(result.current.helpTiles).toHaveLength(2);
    expect(result.current.quickLinks).toHaveLength(5);
    const olimpipo = result.current.quickLinks.find(link => link.target === 'olimpipo');
    expect(olimpipo?.variant).toBe('olimpipo');
    expect(olimpipo?.badge?.label).toBe('Edição ativa');
  });

  it('renders one partner', () => {
    const { result } = renderHook(() => useHome());
    expect(result.current.partners).toHaveLength(1);
    expect(result.current.partners[0].eyebrow).toBe('Pipo + Beep Saúde');
  });
});

describe('targetToPath', () => {
  it('prefixes the target with a slash', () => {
    expect(targetToPath('olimpipo')).toBe('/olimpipo');
    expect(targetToPath('plan')).toBe('/plan');
  });
});
