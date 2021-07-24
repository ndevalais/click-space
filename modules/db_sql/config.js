var config = require('../modules/config');
module.export =
    {
        "server": config.MSSQL_SERVER,
        "authentication": {
            "type": "default",
            "options": {
                "userName": config.MSSQL_USER_NAME,
                "password": config.MSSQL_PASSWORD
            }
        },
        "options": {
            "encrypt": true,
            "database": config.MSSQL_DATABASE_NAME,
            "useColumnNames": true
        },
        "connectTimeout": 60000,
        "requestTimeout": 60000
    }

