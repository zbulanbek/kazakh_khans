import {createWebHistory, createRouter } from "vue-router";
import MapGame from '@/pages/MapGame';
import OldMap from '@/pages/OldMap';

const routes = [
	{
		path: '/',
		component: OldMap 
	},	
	{
		path: '/private',
		component: MapGame
	}
];

const router = createRouter({
	routes,
  history: createWebHistory(),
});

export default router;