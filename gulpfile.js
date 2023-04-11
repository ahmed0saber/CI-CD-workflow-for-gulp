const { src, dest, watch, series, task } = require('gulp')
const addPrefix = require('gulp-autoprefixer')
const minifyCss = require('gulp-clean-css')
const terseJs = require('gulp-terser')
const concatIntoSingleFile = require('gulp-concat')
const fs = require('fs')

const prepareConcatenatedCssFile = () => {
    return src('src/*/**/*.css', {
        allowEmpty: true
    })
        .pipe(addPrefix())
        .pipe(minifyCss())
        .pipe(concatIntoSingleFile('all.min.css'))
        .pipe(minifyCss())
        .pipe(dest('public/'))
}

const prepareConcatenatedJsFile = () => {
    return src('src/*/**/*.js', {
        allowEmpty: true
    })
        .pipe(terseJs())
        .pipe(concatIntoSingleFile('all.min.js'))
        .pipe(terseJs())
        .pipe(dest('public/'))
}

const watchCssFiles = () => {
    watch('src/*/**/*.css', prepareConcatenatedCssFile)
}

const watchJsFiles = () => {
    watch('src/*/**/*.js', series(
        prepareConcatenatedJsFile,
        convertToOptionalChaining
    ))
}

task("watch-css", watchCssFiles)
task("watch-js", watchJsFiles)

const convertToOptionalChaining = async () => {
    try {
        const data = fs.readFileSync('public/all.min.js', 'utf8')
        const content = data.replace(/([a-zA-Z]|\))\.(\(|_|[a-zA-Z])/g, (i) => {
            return `${i[0]}?.${i[2]}`
        })
        fs.writeFile('public/all.min.js', content, err => {
            if (err) {
                console.error(err)
            }
        })
    } catch (err) {
        console.error(err)
    }

    return
}

exports.default = series(
    prepareConcatenatedCssFile,
    prepareConcatenatedJsFile,
    convertToOptionalChaining
)

exports["prepare-css"] = series(
    prepareConcatenatedCssFile
)

exports["prepare-js"] = series(
    prepareConcatenatedJsFile,
    convertToOptionalChaining
)