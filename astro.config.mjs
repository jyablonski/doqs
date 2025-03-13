// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Doqs',
			favicon: './src/assets/logo.png',
			logo: {
				src: './src/assets/logo.png',
			},
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{ label: 'Home', link: '/' },
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
