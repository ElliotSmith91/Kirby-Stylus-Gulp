# kirby_gulp_stylus

A directory template and front-end development tool for using automation tools like Browser Sync and Gulp alongside Kirby CMS.

Utilises Stylus and automatic cache-busting on CSS, so long as your main stylus file is called app.styl.

There are lots of improvements to be made to this basic structure etc. but I hope some people out there find it useful for now.

I've had to change this a lot over the past few months due to wanting new features and things, you can see some of the original thinking of gulpfiles etc in my other repos.

Running gulp with no flags from parent directory will build into the \_site directory, and serve from it using php-connect and Browser Sync.

Make sure you run the usual npm install in the directory to ensure you have all Neccessary modules.
