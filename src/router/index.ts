import { createRouter, createWebHistory } from 'vue-router';

// Import your views
import Admin from '@/views/Admin.vue';
import LoginPage from '@/views/LoginPage.vue';
import Treasurer from '@/views/Treasurer.vue';
import Tickets from '@/components/treasurer/Tickets.vue';          
import ProcessedTickets from '@/components/treasurer/ProcessedTickets.vue'; 

// admin pages
import ProcessedTicketsAdmin from '@/components/admin/ProcessedTickets.vue';
import ImpoundedVehicles from '@/components/admin/ImpoundedVehicles.vue';
import Violators from '@/components/admin/Violators.vue';
import Violations from '@/components/admin/Violations.vue';
import VehicleTypes from '@/components/admin/VehicleTypes.vue';
const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin,
    children: [
      {
        path: 'processed-tickets',            
        name: 'admin-processed-tickets',
        component: ProcessedTicketsAdmin,
      },
      {
        path: 'impounded-vehicles',    
        name: 'impounded-vehicles',
        component: ImpoundedVehicles,
      },
      {
        path: 'violators',    
        name: 'violators',
        component: Violators,
      },
      {
        path: 'violations',    
        name: 'violations',
        component: Violations,
      },
      {
        path: 'vehicle-types',    
        name: 'vehicle-types',
        component: VehicleTypes,
      }
    ]
  },
  {
    path: '/treasurer',
    name: 'treasurer',
    component: Treasurer,
    children: [
      {
        path: 'tickets',            
        name: 'tickets',
        component: Tickets,
      },
      {
        path: 'processed-tickets',    
        name: 'processed-tickets',
        component: ProcessedTickets,
      }
    ],
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
