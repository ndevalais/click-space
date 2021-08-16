require('dotenv').config();
var doc = require('./configDoc');
var pe = process.env;

var config = {
    APM_AGENT_CAPTURE_SPAN_STACK_TRACES:getConfig("APM_AGENT_CAPTURE_SPAN_STACK_TRACES", "false"),
    APM_AGENT_TRANSACTION_SAMPLE_RATE:getConfig("APM_AGENT_TRANSACTION_SAMPLE_RATE", "0.0001"),
    MONGO_DB_STRING:getConfig("MONGO_DB_STRING", ""),
    MONGO_DB_SECONDARY:getConfig("MONGO_DB_SECONDARY", ""),
    MONGO_DB_OPTIONS:getConfig("MONGO_DB_OPTIONS", "?ssl=false"),
    WRITE_OUT_TIMER:getConfig("WRITE_OUT_TIMER", 5000),
    MAX_SIZE_BEFORE_WRITE:getConfig("MAX_SIZE_BEFORE_WRITE",10000),
    COUNT_BEFORE_WRITE : getConfig("COUNT_BEFORE_WRITE",5000),
    REDIS_PORT:getConfig("REDIS_PORT", 6379),
    REDIS_HOST:getConfig("REDIS_HOST", "127.0.0.1"),
    SILENT_MODE:getConfig("SILENT_MODE", false),
    MAX_CACHE_ELEMENTS: getConfig("MAX_CACHE_ELEMENTS", 300),
    //MSSQL_MIN_POOL_CONNECTIONS: getConfig("MSSQL_MIN_POOL_CONNECTIONS", 20),
    //MSSQL_MAX_POOL_CONNECTIONS: getConfig("MSSQL_MAX_POOL_CONNECTIONS", 1000),
    SERVER_THREAD_NUMS: getConfig("SERVER_THREAD_NUMS"),
    SERVER_LISTENING_PORT: getConfig("SERVER_LISTENING_PORT"),
    MAX_REQUESTS_PER_IP: getConfig("MAX_REQUESTS_PER_IP", 10000),
    MAX_UPLOAD_SIZE: getConfig("MAX_UPLOAD_SIZE"),
    RUN_SINGLE_INSTANCE: getConfig("RUN_SINGLE_INSTANCE"),
    MONGO_DB_HOST: getConfig("MONGO_DB_HOST"),
    MONGO_DB_PORT: getConfig("MONGO_DB_PORT"),
    MONGO_DB_PRIMARY: getConfig("MONGO_DB_PRIMARY"),
    MONGO_DB_NAME: getConfig("MONGO_DB_NAME"),
    MONGO_DB_USERNAME: getConfig("MONGO_DB_USERNAME"),
    MONGO_DB_CLICK_EXPIRATION_IN_DAYS: getConfig("MONGO_DB_CLICK_EXPIRATION_IN_DAYS"),
    CACHE_HELPER_STD_TTL: getConfig("CACHE_HELPER_STD_TTL"),
    CACHE_HELPER_CHECK_PERIOD: getConfig("CACHE_HELPER_CHECK_PERIOD"),
    CACHE_TTL: getConfig("CACHE_TTL"),
    CACHE_TTK_ELEMENT_NO_ACTIVITY: getConfig("CACHE_TTK_ELEMENT_NO_ACTIVITY"),
    FILE_DB_CARRIERS_PATH: getConfig("FILE_DB_CARRIERS_PATH"),
    FILE_DB_PROXYS_PATH: getConfig("FILE_DB_PROXYS_PATH"),
    IS_DEVELOPER_ENV: getConfig("IS_DEVELOPER_ENV", false),
    PROJECT_ROOT_PATH_INCLUDING_LAST_SLASH: getConfig("PROJECT_ROOT_PATH_INCLUDING_LAST_SLASH"),

    APM_ENABLED: getConfig("APM_ENABLED", false),
    APM_SERVER_URL: getConfig("APM_SERVER_URL"),
    APM_SERVER_TOKEN: getConfig("APM_SERVER_TOKEN", ''),
    APM_SERVICE_NAME: getConfig("APM_SERVICE_NAME"),

    //MSSQL_SERVER: getConfig("MSSQL_SERVER"),
    //MSSQL_USER_NAME: getConfig("MSSQL_USER_NAME"),
    //MSSQL_PASSWORD: getConfig("MSSQL_PASSWORD"),
    //MSSQL_DATABASE_NAME: getConfig("MSSQL_DATABASE_NAME"),
    //MSSQL_LOG: getConfig("MSSQL_LOG"),
    ELASTIC_SEARCH_URL: getConfig("ELASTIC_SEARCH_URL"),
    REPORT_TO_ELASTIC_SEARCH: getConfig("REPORT_TO_ELASTIC_SEARCH", false),
    LOGMODE: getConfig("LOGMODE", "console"),
    LOG_INDEX_NAME: getConfig("LOG_INDEX_NAME", "click_log_index"),
    MONGO_DEBUG_LEVEL: getConfig("MONGO_DEBUG_LEVEL", "error"),
    ELASTIC_CLICKS_INDEX_NAME: getConfig("ELASTIC_CLICKS_INDEX_NAME", "clicks_docs"),
    ELASTIC_INSTALLS_INDEX_NAME: getConfig("ELASTIC_INSTALLS_INDEX_NAME", "installs_docs"),
    ELASTIC_EVENTS_INDEX_NAME: getConfig("ELASTIC_EVENTS_INDEX_NAME", "events_docs"),
    ELASTIC_DEBUG_INDEX_NAME: getConfig("ELASTIC_DEBUG_INDEX_NAME", "debug_docs"),
    API_KEY_SECRET: getConfig("API_KEY_SECRET", "laikad_api_secret"),
    HEADER_TO_GET_IP_FROM: getConfig("HEADER_TO_GET_IP_FROM", "headers.x-forwarded-for"),
    CLICK_COUNT_VALID: getConfig("CLICK_COUNT_VALID", 20),

    MARGEN_DAILY: getConfig("MARGEN_DAILY", 1.2),
    CR_LIMITE: getConfig("CR_LIMITE", 7),
    MAX_IPs: getConfig("MAX_IPs", 2),
    MONGO_DB_POOL_SIZE: getConfig("MONGO_DB_POOL_SIZE", 100),
    IGNORED_VALIDATORS: getConfig("IGNORED_VALIDATORS", ""),
};

function getConfig(name, defValue) {
    var value = pe[name];
    if (!value && defValue !== undefined) {
        console.log(`La variable de configuración:[ ${name} ] no fué definida en el archivo .env, iniciando con valor default: ${name}=${defValue}`);
        return defValue;
    } else if (!value) {
        console.log("La variable de configuración:[", name, "] debe ser definida en el archivo .env !");
        var help = doc[name];
        if (doc[name]) {
            console.log("Ayuda para [", name, "]\n\t*", help);
        }
        process.exit();
    } else {
        return value;
    }
}

module.exports = config;