# Introduction y descripción
Este motor de "clicks" funciona de la siguiente manera:

Empiza por ejecutarse el 
```
node bin/start_server.js 
```
Este inicializa las conecciones  la base de datos, el cacheHelper, y el EntityManager, luego, todos los request que llegan son analizados por 
el "validator engine", que toma los validadores definidos en ```/entity_manager/validator/validators/*``` y comprueba según la logica de cada uno de ellos 
si el "click" es valido, si es valido, se registra en la tabla de clicks y el entityManager actualiza sus stats, el es el encargado de obtener las 'offers' 
activas mediante un sistema de caché.

# Force Clicks Expiration

```
db.log_events.createIndex( { "ExpireAt": 1 }, { expireAfterSeconds: 0 } )
```

# Popular DB
npm run test-db

# Insert offert - Inserta la Oferta desde SQL Server a CosmoDB
npm run dev

Ejemplo 
curl -X GET 'http://localhost:1350/offers?offers=2324294 --&param=2324286

https://<TBD>/click?
offerguid=52D1099E-C15F-E911-B49E-2818780ED032

http://click.laikad.com/index1.php?
OfferGUID=227276DF-4186-E911-ABC4-2818780ED032&
&subpubid=99999
&ClickID=test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604
&Android_AdID=test20190604

Ejemplo Click

Ejemplo Blackilist Insert por Offert

curl -X GET 'http://localhost:1350/blacklist?offerid=24808'  

curl -X GET 'http://localhost:1350/blacklist?offerid=2519960'  

curl -X GET 'http://localhost:1350/advertiser?advertiserid=1843'  

##Starting APP

```
node bin/start_server.js
```


## Examples queries:
# Simple request: localhost
curl -H "User-Agent:Safari 3.15" "http://localhost:1350/click?offerguid=3D7DEE00-463C-E911-85B3-2818780EF331&ClickID=test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999"


## Examples Click iOS
curl -H "User-Agent:Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16D57" "http://localhost:1350/click?offerguid=0ABB35DB-44DE-E911-BCD0-2818786C1ADD&ClickID=1test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999"

## Examples Click Android
curl -H "Mozilla/5.0 (Linux; Android 9; SM-G960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36" "http://localhost:1350/click?offerguid=0ABB35DB-44DE-E911-BCD0-2818786C1ADD&ClickID=1test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999"

## Simple request: SERVER PROD
curl -H "User-Agent:Safari 3.15" "http://click.laikad.com/click?offerguid=3D7DEE00-463C-E911-85B3-2818780EF331&ClickID=test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999"


## Inserto Oferta
curl -X GET 'http://localhost:1350/offers?offerid=2519960' 

## WhiteLits por Ofertas
curl -H "User-Agent:Safari 3.15 "http://localhost:1350/offers_whitelist?offerid=2519960" 

## Update PrePay
curl -H "User-Agent:Safari 3.15" "http://localhost:1350/advertiser_prepay?AdvertiserID=1861&Prepay=99"

#Insert BlackList
curl -H "User-Agent:Safari 3.15" "http://localhost:1350/blacklist?offerid=12121" 

#Debug enabled
curl -H "User-Agent:Safari 3.15" "http://localhost:1350/click?offerguid=3D7DEE00-463C-E911-85B3-2818780EF331&enableDebug=true&ClickID=test_TEST-REDIRECCIONAMIENTO-POR-DEVICE_20190604&Android_AdID=test20190604&subpubid=99999"

#Insert AppsNames
curl -H GET "http://localhost:1350/appsnames?CountryCode=AR&Device=Android" 

#GGet status page
curl -H GET "http://localhost:1350/server_status" 





##Sugerencia estructura OffersTotals

{
    [
        {
            offerId:"943843204890",
            subPubId:"943843204890"
            clicks:{
                perDay : [
                    {20190101:[]}
                    {20190101:[]}
                ],
                perHour : [
                    {201901012300:[{}]},
                    {20190101:{}}
                ]

            }
        }
    ]
}

### .envs

##TEST
```
RUN_SINGLE_INSTANCE=true
SERVER_THREAD_NUMS=2
SERVER_LISTENING_PORT=1350
MAX_UPLOAD_SIZE=3mb
MAX_REQUESTS_PER_IP=10000

MONGO_DB_HOST=laikad-db.documents.azure.com
MONGO_DB_PORT=10255
MONGO_DB_PRIMARY=SDegcQmy5wJBpLGcROwxQrLnffvDNeIKQvuwgqg2OIlUMbOGwYfqDtHLNeXYzQrr2CBtdJe4XOgTnKvsFuRAMA==
MONGO_DB_NAME=laikad 
MONGO_DB_USERNAME=laikad-db
MONGO_DB_CLICK_EXPIRATION_IN_DAYS=7
CACHE_HELPER_STD_TTL=100
CACHE_HELPER_CHECK_PERIOD=5
FILE_DB_CARRIERS_PATH=/Users/Gustavo.B/Documents/_repo/laikads/ipDB/IP2-Carrier-20190204.BIN
FILE_DB_PROXYS_PATH=/Users/Gustavo.B/Documents/_repo/laikads/ipDB/IP2-Carrier-20190204.BIN
PROJECT_ROOT_PATH_INCLUDING_LAST_SLASH=/Users/Gustavo.B/Documents/_repo/laikads/Laikadclick/
CACHE_TTL=5
CACHE_TTK_ELEMENT_NO_ACTIVITY=1
SILENT_MODE=false
IS_DEVELOPER_ENV=false
APM_ENABLED=true
APM_SERVER_URL=http://apm.laikad.com
APM_SERVER_TOKEN=
APM_SERVICE_NAME=LaikadClick
```

##TUNEL 
ssh -YL 27018:127.0.0.1:27017 ndevalais@52.171.129.40
