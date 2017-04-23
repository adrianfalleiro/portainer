module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-replace');

    var targets = {
        unix: { filename: 'dist/portainer' },
        win: { filename: 'dist/portainer.exe' },
        arm: { filename: 'dist/portainer' },
        arm64: { filename: 'dist/portainer' },
        macos: { filename: 'dist/portainer' }
    }

    // Default task.
    grunt.registerTask('default', ['jshint', 'build']);

    grunt.registerTask('build', '', function(target) {
        var target = (target && targets[target]) ? target : 'unix';
        var tasks = [
            'clean:app',
            'buildBinaryIfNotExists:' + target,
            'html2js',
            'useminPrepare:dev',
            'recess:build',
            'concat',
            'clean:tmpl',
            'copy',
            'filerev',
            'usemin',
            'clean:tmp'
        ];

        grunt.log.writeln('Building for ' + target);
        grunt.task.run(tasks);

    });

    grunt.registerTask('release', '', function(target) {
        var target = (target && targets[target]) ? target : 'unix';
        var tasks = [
            'clean:all',
            'buildBinaryIfNotExists:' + target,
            'html2js',
            'useminPrepare:release',
            'recess:build',
            'concat',
            'clean:tmpl',
            'cssmin',
            'uglify',
            'copy:assets',
            'filerev',
            'usemin',
            'clean:tmp',
            'replace'
        ];

        grunt.log.writeln('Releasing for ' + target);
        grunt.task.run(tasks);

    });

    grunt.registerTask('run', function(mode) {
        var mode = mode ? mode : 'default';
        // default target to 'unix'
        var target = 'unix';
        var tasks = [
            'buildBinaryIfNotExists',
        ];

        if (mode == "default" || mode == "swarm") {
            tasks.push('build');
        }

        tasks.push('shell:buildImage');
        tasks.push('shell:run');

        if (mode != "default") {
            tasks.push('watch:build')
        }

        grunt.task.run(tasks);


    })

 
    grunt.registerTask('clear', ['clean:app']);

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function() {
        grunt.log.subhead(Date());
    });

    grunt.registerTask('buildBinaryIfNotExists', function(target) {
        var target = (target && targets[target]) ? target : 'unix';
        if (!grunt.file.exists(targets[target].filename)) {
            grunt.task.run('shell:buildBinary:' + target);
        }
    })

    grunt.registerTask('lint', ['jshint']);

    grunt.initConfig({
        distdir: 'dist',
        pkg: grunt.file.readJSON('package.json'),
        src: {
            js: ['app/**/*.js', '!app/**/*.spec.js'],
            jsTpl: ['<%= distdir %>/templates/**/*.js'],
            jsVendor: [
                'bower_components/jquery/dist/jquery.min.js',
                'bower_components/bootstrap/dist/js/bootstrap.min.js',
                'bower_components/Chart.js/Chart.min.js',
                'bower_components/lodash/dist/lodash.min.js',
                'bower_components/splitargs/src/splitargs.js',
                'bower_components/filesize/lib/filesize.min.js',
                'bower_components/moment/min/moment.min.js',
                'bower_components/xterm.js/dist/xterm.js',
                'bower_components/bootbox.js/bootbox.js',
                'bower_components/toastr/toastr.min.js',
                'assets/js/legend.js' // Not a bower package
            ],
            html: ['index.html'],
            tpl: ['app/components/**/*.html'],
            css: ['assets/css/app.css'],
            cssVendor: [
                'bower_components/bootstrap/dist/css/bootstrap.css',
                'bower_components/font-awesome/css/font-awesome.min.css',
                'bower_components/rdash-ui/dist/css/rdash.min.css',
                'bower_components/angular-ui-select/dist/select.min.css',
                'bower_components/xterm.js/dist/xterm.css',
                'bower_components/toastr/toastr.min.css'
            ]
        },
        clean: {
            all: ['<%= distdir %>/*'],
            app: ['<%= distdir %>/*', '!<%= distdir %>/portainer'],
            tmpl: ['<%= distdir %>/templates'],
            tmp: ['<%= distdir %>/js/*', '!<%= distdir %>/js/app.*.js', '<%= distdir %>/css/*', '!<%= distdir %>/css/app.*.css']
        },
        useminPrepare: {
            dev: {
                src: '<%= src.html %>',
                options: {
                    root: '<%= distdir %>',
                    flow: {
                        steps: {
                            js: ['concat'],
                            css: ['concat']
                        }
                    }
                }
            },
            release: {
                src: '<%= src.html %>',
                options: {
                    root: '<%= distdir %>'
                }
            }
        },
        filerev: {
            files: {
                src: ['<%= distdir %>/js/*.js', '<%= distdir %>/css/*.css']
            }
        },
        usemin: {
            html: ['<%= distdir %>/index.html']
        },
        copy: {
            bundle: {
                files: [{
                        dest: '<%= distdir %>/js/',
                        src: ['app.js'],
                        expand: true,
                        cwd: '.tmp/concat/js/'
                    },
                    {
                        dest: '<%= distdir %>/css/',
                        src: ['app.css'],
                        expand: true,
                        cwd: '.tmp/concat/css/'
                    }
                ]
            },
            assets: {
                files: [{
                        dest: '<%= distdir %>/fonts/',
                        src: '*.{ttf,woff,woff2,eof,svg}',
                        expand: true,
                        cwd: 'bower_components/bootstrap/fonts/'
                    },
                    {
                        dest: '<%= distdir %>/fonts/',
                        src: '*.{ttf,woff,woff2,eof,svg}',
                        expand: true,
                        cwd: 'bower_components/font-awesome/fonts/'
                    },
                    {
                        dest: '<%= distdir %>/fonts/',
                        src: '*.{ttf,woff,woff2,eof,svg}',
                        expand: true,
                        cwd: 'bower_components/rdash-ui/dist/fonts/'
                    },
                    {
                        dest: '<%= distdir %>/images/',
                        src: ['**'],
                        expand: true,
                        cwd: 'assets/images/'
                    },
                    {
                        dest: '<%= distdir %>/ico',
                        src: '**',
                        expand: true,
                        cwd: 'assets/ico'
                    }
                ]
            }
        },
        html2js: {
            app: {
                options: {
                    base: '.'
                },
                src: ['<%= src.tpl %>'],
                dest: '<%= distdir %>/templates/app.js',
                module: '<%= pkg.name %>.templates'
            }
        },
        concat: {
            dist: {
                options: {
                    process: true
                },
                src: ['<%= src.js %>', '<%= src.jsTpl %>'],
                dest: '<%= distdir %>/js/<%= pkg.name %>.js'
            },
            vendor: {
                src: ['<%= src.jsVendor %>'],
                dest: '<%= distdir %>/js/vendor.js'
            },
            index: {
                src: ['index.html'],
                dest: '<%= distdir %>/index.html',
                options: {
                    process: true
                }
            },
            angular: {
                src: ['bower_components/angular/angular.min.js',
                    'bower_components/angular-sanitize/angular-sanitize.min.js',
                    'bower_components/angular-cookies/angular-cookies.min.js',
                    'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
                    'bower_components/angular-jwt/dist/angular-jwt.min.js',
                    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
                    'bower_components/angular-resource/angular-resource.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/ng-file-upload/ng-file-upload.min.js',
                    'bower_components/angular-utils-pagination/dirPagination.js',
                    'bower_components/angular-google-analytics/dist/angular-google-analytics.min.js',
                    'bower_components/angular-ui-select/dist/select.min.js'
                ],
                dest: '<%= distdir %>/js/angular.js'
            }
        },
        uglify: {
            dist: {
                // options: {
                // },
                src: ['<%= src.js %>', '<%= src.jsTpl %>'],
                dest: '<%= distdir %>/js/<%= pkg.name %>.js'
            },
            vendor: {
                options: {
                    preserveComments: 'some' // Preserve license comments
                },
                src: ['<%= src.jsVendor %>'],
                dest: '<%= distdir %>/js/vendor.js'
            },
            angular: {
                options: {
                    preserveComments: 'some' // Preserve license comments
                },
                src: ['<%= concat.angular.src %>'],
                dest: '<%= distdir %>/js/angular.js'
            }
        },
        recess: { // TODO: not maintained, unable to preserve license comments, switch out for something better.
            build: {
                files: {
                    '<%= distdir %>/css/<%= pkg.name %>.css': ['<%= src.css %>'],
                    '<%= distdir %>/css/vendor.css': ['<%= src.cssVendor %>']
                },
                options: {
                    compile: true,
                    noOverqualifying: false // TODO: Added because of .nav class, rename
                }
            },
            min: {
                files: {
                    '<%= distdir %>/css/<%= pkg.name %>.css': ['<%= src.css %>'],
                    '<%= distdir %>/css/vendor.css': ['<%= src.cssVendor %>']
                },
                options: {
                    compile: true,
                    compress: true,
                    noOverqualifying: false // TODO: Added because of .nav class, rename
                }
            }
        },
        watch: {
            all: {
                files: ['<%= src.js %>', '<%= src.css %>', '<%= src.tpl %>', '<%= src.html %>'],
                tasks: ['default', 'timestamp']
            },
            build: {
                files: ['<%= src.js %>', '<%= src.css %>', '<%= src.tpl %>', '<%= src.html %>'],
                tasks: ['build', 'shell:buildImage', 'shell:run', 'shell:cleanImages']
                /*
                 * Why don't we just use a host volume
                 * http.FileServer uses sendFile which virtualbox hates
                 * Tried using a host volume with -v, copying files with `docker cp`, restating container, none worked
                 * Rebuilding image on each change was only method that worked, takes ~4s per change to update
                 */
            }
        },
        jshint: {
            files: ['gruntfile.js', '<%= src.js %>'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 2,
                latedef: 'nofunc',
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {
                    angular: false,
                    '$': false
                }
            }
        },
        shell: {
            buildImage: {
                command: 'docker build --rm -t portainer -f build/linux/Dockerfile .'
            },
            buildBinary: {
                command: [
                    'docker run --rm -v $(pwd)/api:/src portainer/golang-builder /src/cmd/portainer',
                    'shasum api/cmd/portainer/portainer > portainer-checksum.txt',
                    'mkdir -p dist',
                    'mv api/cmd/portainer/portainer dist/'
                ].join(' && ')
            },
            "buildBinary:unix": {
                command: [
                    'docker run --rm -v $(pwd)/api:/src -e BUILD_GOOS="linux" -e BUILD_GOARCH="arm" portainer/golang-builder:cross-platform /src/cmd/portainer',
                    'shasum api/cmd/portainer/portainer-linux-arm > portainer-checksum.txt',
                    'mkdir -p dist',
                    'mv api/cmd/portainer/portainer-linux-arm dist/portainer'
                ].join(' && ')
            },
            "buildBinary:arm64": {
                command: [
                    'docker run --rm -v $(pwd)/api:/src -e BUILD_GOOS="linux" -e BUILD_GOARCH="arm64" portainer/golang-builder:cross-platform /src/cmd/portainer',
                    'shasum api/cmd/portainer/portainer-linux-arm64 > portainer-checksum.txt',
                    'mkdir -p dist',
                    'mv api/cmd/portainer/portainer-linux-arm64 dist/portainer'
                ].join(' && ')
            },
            "buildBinary:macos": {
                command: [
                    'docker run --rm -v $(pwd)/api:/src -e BUILD_GOOS="darwin" -e BUILD_GOARCH="amd64" portainer/golang-builder:cross-platform /src/cmd/portainer',
                    'shasum api/cmd/portainer/portainer-darwin-amd64 > portainer-checksum.txt',
                    'mkdir -p dist',
                    'mv api/cmd/portainer/portainer-darwin-amd64 dist/portainer'
                ].join(' && ')
            },
            "buildBinary:win": {
                command: [
                    'docker run --rm -v $(pwd)/api:/src -e BUILD_GOOS="windows" -e BUILD_GOARCH="amd64" portainer/golang-builder:cross-platform /src/cmd/portainer',
                    'shasum api/cmd/portainer/portainer-windows-amd64 > portainer-checksum.txt',
                    'mkdir -p dist',
                    'mv api/cmd/portainer/portainer-windows-amd64 dist/portainer.exe'
                ].join(' && ')
            },
            run: {
                command: function() {

                    var endpoint = grunt.option('endpoint');

                    var commands = [
                        'docker stop portainer',
                        'docker rm portainer',
                    ];

                    var portainerCmd = ['docker run -d -p 9000:9000'];

                    if (!endpoint) {
                        portainerCmd.push('-v /tmp/portainer:/data',  '-v /var/run/docker.sock:/var/run/docker.sock', '--name portainer', 'portainer --no-analytics');
                    } else {
                        if (grunt.option('ssl')) portainerCmd.push('-v /tmp/portainer:/data', '-v /tmp/docker-ssl:/certs'); 
                        portainerCmd.push('--name portainer', 'portainer -H tcp://' + endpoint + ' --no-analytics');
                        if (grunt.option('ssl')) portainerCmd.push('--tlsverify');
                    }

                    commands.push(portainerCmd.join(' '));
                    return commands.join(';');
                }
            },
            cleanImages: {
                command: 'docker rmi $(docker images -q -f dangling=true)'
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: 'CONFIG_GA_ID',
                        replacement: '<%= pkg.config.GA_ID %>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['dist/js/**.js'],
                    dest: 'dist/js/'
                }]
            }
        }
    });
};
