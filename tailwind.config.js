module.exports = {
  purge: {
    enabled: true,
    content: ['./src/**/*.{js,ts,jsx,tsx}', './src/**/**/*.{js,ts,jsx,tsx}'],
  },
  theme: {
    extend: {
      fill: (theme) => ({
        red: theme('colors.red.primary'),
      }),
      fontFamily: {
        logoFont: ['KelsonSans-BoldRU', 'Arial', 'sans-serif'],
      },
      padding: {
        harf: '50%',
      },
      colors: {
        white: '#ffffff',
        blue: {
          medium: '#005c98',
        },
        black: {
          light: '#262626',
          faded: '#00000059',
        },
        gray: {
          base: '#616161',
          background: '#fafafa',
          primary: '#dbdbdb',
        },
        red: {
          primary: '#ed4956',
          background: '#ed4956',
        },
        logoColor: {
          base: '#FF9800',
          littleLight: '#FFAA32',
          light: '#FFBF66',
        },
      },
      width: {
        '19/20': '95%',
      },
      minWidth: {
        900: '900px',
      },
    },
  },
  variants: {
    backgroundColor: ['active'],
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
