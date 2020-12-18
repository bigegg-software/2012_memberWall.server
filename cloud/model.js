const SchemaConfig = require('@bigegg/parse-server-schema-config')
const Member = {
    className: 'Member',
    fields: {
        userid: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        avatar: {
            type: 'string'
        },
        title: {
            type: 'string'
        },
        work_place: {
            type: 'string'
        },
        email: {
            type: 'string'
        },
        departList: {
            type: 'array'
        }
    },
    CLP: {
        addField: {},
        find: { '*': true },
        count: { '*': true },
        get: { '*': true },
        create: { '*': true },
        update: { '*': true },
        delete: { '*': true },
    },
}
SchemaConfig.config([Member])