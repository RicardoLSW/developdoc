module.exports = {
    title: '前端开发规范&文档',
    description: '前端开发规范&文档',
    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
    ],
    // theme: '@vuepress/vue',
    base: process.env.VUE_APP_API_BASE,
    markdown: {
        lineNumbers: false
    },
    themeConfig: {
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
        sidebar:{
            '/guide/': [
                {
                    title: '开发规范',
                    collapsable: false,
                    children: [
                        'specification/',
                    ]
                },
                {
                    title: 'Vue从零开始',
                    collapsable: false,
                    children: [
                        'document/introduction',
                        'document/front-end-environment-set-up',
                        'document/code-structure',
                        'document/a-unified-code-style',
                        'document/many-environment-configuration',
                        'document/global-state-management',
                        'document/network-request-package',
                        'document/chart',
                        'document/form',
                        'document/table',
                        'document/third-party-relies-on',
                        // 'document/single-sign-on-(sso)',
                        'document/routing-menu-permissions',
                    ]
                }
            ],
        }
    }
};
