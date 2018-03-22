# Deploy invi.sible.link

## Pasos previos
-   Ejecutar el script presintall

```bash
./preinstall.sh
```

-   Hacer clone del proyecto https://github.com/TEDICpy/gobwebsecpy en la carpeta *campaigns* del proyecto invi.sible.link. Para configurar los campaigns a mostrar en invi.sible.link consultar la última sección de este documento: "**Añadir más campaigns**"

## Instalación

`npm install`

## Deploy

A continuación se describen los pasos para cargar los datos de campaigns y publicarlos a través de la api rest de storyteller.

**Terminal 1:** Ejecutar por cada campaign, es decir: para gob.paraguay (lista_paraguay.csv), gob.brasil (lista_brasil.csv), gob.colombia (lista_colombia.csv), gob.chile (lista_chile.csv) y por otras campañas futuras.

  
    DEBUG=* node bin/queueCampaign --csv campaigns/gobwebsecpy/lista_paraguay.csv --campaign gob.paraguay

> Otra **alternativa** podría ser la siguiente:
> 
>     TZ=UTC DEBUG=* bin/queueMany.js 
> De este modo se podría evitar ejecutar *bin/queueCampaign* por cada campaign, debido a que *bin/queueMany.js* obtiene los datos de los campaigns consultando al archivo *config/campaigns.json* .

Por último, dejar corriendo **vigile** en esta terminal

    TZ=UTC npm run vigile

**Terminal 2:**   Abrir otra terminal y ejecutar el siguiente comando (donde *amount* es la cantidad de sitios a analizar, información devuelta por vigile, y *concurrency* determina cuantos sitios se analizarán a la vez)

    TZ=UTC amount=6 concurrency=3 npm run badger

Al terminal la ejecución el comando anterior, ejecutar:

    TZ=UTC amount=6 concurrency=3 npm run phantom
Por último, dejar corriendo **exposer** en esta terminal

    TZ=UTC  npm run exposer
**Terminal 3:** Ejecutar los siguientes comandos para cada uno de los campaigns (gob.paraguay, gob.brasil, gob.colombia, gob.chile y futuros campaigns)

    #analyzeBadger
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzeBadger.js --campaign gob.paraguay

	#analyzePhantom
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzePhantom.js --campaign gob.paraguay

	#analyzeGroup
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzeGroup.js --campaign gobwebsecpy

Por último, dejar corriendo **storyteller** en la terminal

    TZ=UTC node bin/storyteller.js

Si todo está en orden, los servicios de la api deberían estar disponibles en  [http://localhost:7000](http://localhost:7000). 
A modo de prueba, verificar que los siguientes servicios retornen datos de los campaigns:

 - **[http://localhost:7000/api/v1/mixed/gob.paraguay](http://localhost:7000/api/v1/mixed/gob.paraguay)**
 - **[http://localhost:7000/api/v1/surface/gob.paraguay](http://localhost:7000/api/v1/surface/gob.paraguay)**
 - **[http://localhost:7000/api/v1/details/gob.paraguay](http://localhost:7000/api/v1/details/gob.paraguay)**
 - **[http://localhost:7000/api/v1/extended/gob.paraguay](http://localhost:7000/api/v1/extended/gob.paraguay)**

## Actualización de datos
Los siguientes comandos deben correrse cada día para mantener los datos actualizados, por lo que podría programarse en una tarea usando CRON. Tener en cuenta los valores de los flags *--campaign* (campaign a analizar), *amount* (cantidad de sitios a analizar) y *concurrency* cuando sea necesario. 	

    TZ=UTC DEBUG=* bin/queueMany.js 
    TZ=UTC amount=6 concurrency=3 npm run badger
    TZ=UTC amount=6 concurrency=3 npm run phantom
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzeBadger.js --campaign gob.paraguay
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzePhantom.js --campaign gob.paraguay
    TZ=UTC config=config/analyzerDevelopment.json DEBUG=* bin/analyzeGroup.js --campaign gob.paraguay

## Añadir más campaigns
En caso de que se hayan agregado nuevos campaigns al proyecto https://github.com/TEDICpy/gobwebsecpy, se debe modificar el archivo *config/campaigns.json* para incluirlos.

    "gob": [
	    {    
		    "name": "gob.brasil",
		    "csv": "gobwebsecpy/lista_brasil.csv"
	    }, {
		    "name": "gob.colombia",
		    "csv": "gobwebsecpy/lista_colombia.csv"
	    }, {
		    "name": "gob.chile",
		    "csv": "gobwebsecpy/lista_chile.csv"
	    }, {
		    "name": "gob.paraguay",
		    "csv": "gobwebsecpy/lista_paraguay.csv"
	    } 
    ]
