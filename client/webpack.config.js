const path = require('path');

const paths = {
    src: path.resolve(__dirname, 'src'),
    dist: path.resolve(__dirname, 'dist')
};

module.exports = {
    context: paths.src, // базовая директория для точек входа и загрузчиков    
    entry: {
        app: './index'  // точка входа в приложение, наш src/index.ts файл, названием итогового бандла будет имя свойства - app
    },
    
    output: {
        path: paths.dist,  // путь для результатов сборки 
        filename: 'haman.min.js'  // название итогового бандла, получится dist/app.bundle.js
    },
    
    resolve: {
        extensions: ['.ts'] // указание расширений файлов, которые webpack будет обрабатывать, и пытаться добавить автоматически (например получив запрос на index, не найдет его и попробует index.ts)
    },
    
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            } // загрузчик для обработки файлов с расширением .ts
        ]
    }
};