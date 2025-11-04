import { getPrimaryNav } from '@/lib/navigation';
import MainMenu from './MainMenu';

export default async function MainMenuServer() {
  try {
    const items = await getPrimaryNav(); // ya usa 'menu-primary'
    return <MainMenu items={items} />;
  } catch (e) {
    console.error('MENU LOAD FAILED → fallback vacío', e);
    return <MainMenu items={[]} />;
  }
}
