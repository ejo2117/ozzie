import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>Oswald Fresh</title>
				<meta name='description' content='Official Website' />
				<link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
				<link rel='manifest' href='/site.webmanifest' />
				<link rel='mask-icon' href='/safari-pinned-tab.svg' color='#2200ff' />
				<meta name='msapplication-TileColor' content='#2d89ef' />
				<meta name='theme-color' content='#ffffff' />
			</Head>

			<main className={styles.main}>
				<h1>Mezcal.</h1>
			</main>
		</div>
	);
};

export default Home;
