import type { InferGetStaticPropsType, NextPage } from 'next';
import Head from 'next/head';
import Canvas from '@components/Screen/Canvas';
import styles from '@styles/Home.module.css';
import React from 'react';
import fs from 'fs';

const Home: NextPage = ({ weather }: InferGetStaticPropsType<typeof getStaticProps>) => {
	return (
		<div className={styles.container}>
			<Head>
				<title>Mesh</title>
				<meta name='description' content='Official Website' />
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
				<link rel='manifest' href='/site.webmanifest' />
				<link rel='mask-icon' href='/safari-pinned-tab.svg' color='#2200ff' />
				<meta name='msapplication-TileColor' content='#2d89ef' />
				<meta name='theme-color' content='#000000' />
			</Head>

			<main className={styles.main}>
				<Canvas weather={weather} />
			</main>
		</div>
	);
};
export async function getStaticProps(context) {
	const weather = JSON.parse(fs.readFileSync(process.env.SAMPLE_DATA_FILE, 'utf-8'));

	return {
		props: {
			weather,
		}, // will be passed to the page component as props
	};
}

export default Home;
