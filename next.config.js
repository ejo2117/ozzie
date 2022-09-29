/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
		prependData: `@import 'variables.scss';`,
	},
	swcMinify: true,
};

module.exports = nextConfig;
