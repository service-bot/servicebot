module.exports = function(grunt) {

    grunt.initConfig({
        sass: {
            dist:{
                options: {
                    style: 'expanded'
                },
                files: {
                    'public/css/main.css' : 'public/scss/main.scss',
                    'plugins/core-embeddables/css/style.css' : 'plugins/core-embeddables/scss/style.scss'
                }
            }
        },
        watch: {
            css: {
                files: ['public/scss/*.scss', 'plugins/**/scss/*.scss'],
                tasks: ['sass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['watch']);

};