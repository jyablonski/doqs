// @ts-check
import { remarkDiagram } from './src/plugins/mermaid.mjs'
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			head: [
				{
					tag: 'script',
					attrs: {
						src: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs',
						type: 'module',
						defer: true,
					},
					content: `mermaid.initialize({ startOnLoad: true });`,
				},
			],
			title: 'Doqs',
			favicon: './src/assets/logo.png',
			logo: {
				src: './src/assets/logo.png',
			},
			social: {
				github: 'https://github.com/jyablonski/doqs',
			},
			sidebar: [
				{ label: 'Home', link: '/' },
				{
					label: 'Data Sources',
					autogenerate: { directory: 'data' },
				},
				{
					label: 'Diagrams',
					autogenerate: { directory: 'diagrams' },
				},
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'Runbooks',
					autogenerate: { directory: 'runbooks' },
				},
				{
					label: 'Services',
					autogenerate: { directory: 'services' },
				},
			],
		}),
	],
	markdown: {
		remarkPlugins: [remarkDiagram],
		shikiConfig: {
			// Enable word wrap to prevent horizontal scrolling
			wrap: true,
		},
	},
});
