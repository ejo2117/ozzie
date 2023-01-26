/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
	reactStrictMode: true,
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
		prependData: `@import 'variables.scss';`,
	},
	swcMinify: true,
	webpack: (config, opts) => {
		let configCopy = { ...config };
		configCopy.resolve.alias = {
			...config.resolve.alias,
			'@lib': path.resolve('./lib'),
			'@components': path.resolve('./components'),
			'@utils': path.resolve('./utils'),
			'@styles': path.resolve('./styles'),
			'@hooks': path.resolve('./hooks'),
		};
		return configCopy;
	},
};

module.exports = nextConfig;
