import { Routes } from '@angular/router';
import { Lists } from './pages/lists/lists';
import { ListDetail } from './pages/list-detail/list-detail';

export const routes: Routes = [
    {path: '', component: Lists},
    {path: 'lijst/:id', component: ListDetail},
    {path: '**', redirectTo: ''}
];
