import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'features',
    component: TabsPage,
    children: [
      {
        path: 'invest',
        loadComponent: () =>
          import('../features/invest/invest.page').then((m) => m.InvestPage),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('../features/discover/discover.page').then((m) => m.DiscoverPage),
      },
      {
        path: '',
        redirectTo: '/features/invest',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/features/invest',
    pathMatch: 'full',
  },
];
