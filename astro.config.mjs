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
			// remove the previous + next page links on all pages
			pagination: false,
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
					label: 'Architecture',
					autogenerate: { directory: 'architecture' },
				},
				{
					label: 'Data Sources',
					autogenerate: { directory: 'data' },
					collapsed: true,
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
			// enable this if you want to set a footer up across all pages
			// components: {
			// 	// Footer: './src/components/Footer.astro',
			// 	Header: './src/components/Header.astro'
			// },
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
