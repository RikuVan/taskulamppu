import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

export default {
  input: './taskulamppu.js',
  output: {
    file: 'build/index.js',
    format: 'umd',
    name: 'taskulamppu'
  },
  plugins: [uglify({}, minify)]
}
