import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Chart from '../components/Chart/Chart';
import Canvas from '../components/Screen/Canvas';
import Field from '../components/Screen/Field';
import Sticker from '../components/Sticker';
import styles from '../styles/Home.module.css';
import React from 'react';

// basic commit
const Home: NextPage = () => {
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
				{/* <Sticker /> */}
				<Canvas />
			</main>
		</div>
	);
};

export default Home;
