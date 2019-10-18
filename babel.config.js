const presets = [
  [
    '@babel/env',
    {
      targets: {
				browsers: [
					'> 0.2%',
					'last 6 versions',
					'not dead'
				]
      },
      useBuiltIns: 'usage',
			modules: 'amd',
			loose: false
    },
  ],
];

module.exports = {
	presets,
	ignore: ['@*.js']
};