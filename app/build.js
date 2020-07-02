let fs = require('fs');
let sass = require('node-sass');

let scss_filename = __dirname+'/scss/app.scss';
let css_filename = __dirname+'/../public/stylesheets/app.css';

sass.render({
  file: scss_filename
}, function(err, result) {
    if (err) {
        console.log("Error", err);
    }
    fs.writeFile(css_filename, result.css, 'utf-8', function (err) {
        if (err) {
            console.log("Error", err);
        }
    });
});