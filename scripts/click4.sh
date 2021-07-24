#! /bin/sh
### BEGIN INIT INFO
# Provides:       click
# Required-Start: $local_fs $remote_fs $network $syslog $named $redis-server
# Required-Stop:     $local_fs $remote_fs $network $syslog $named
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts the click services
# Description:       stops ths click services
### END INIT INFO

# Este script inicia click en el booteo del sistema:
# 1- Levanta mongodb
# 2- Levanta 3 instancias de la aplicación de node, mediante forever.
# Más info en: https://solunika.atlassian.net/wiki/spaces/TROOP/pages/edit-v2/139952132


case "$1" in
    start)
        echo "Iniciando servicios de click..."
        echo -ne "....Iniciando MongoDB:"
        sudo service mongod start
        echo  "[OK]"
        
        echo -ne "....Ejecutando forever para levantar instancias de click:"
        {
            PATH="/home/ndevalais/bin:/home/ndevalais/.local/bin:/home/ndevalais/.nvm/versions/node/v10.16.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
            
            /sbin/runuser ndevalais -s /bin/bash -c "PATH=$PATH && cd /home/ndevalais/_repo/click_server_00 && forever start -a --uid click_server_00 bin/start_server.js"
            /sbin/runuser ndevalais -s /bin/bash -c "PATH=$PATH && cd /home/ndevalais/_repo/click_server_01 && forever start -a --uid click_server_01 bin/start_server.js"
            /sbin/runuser ndevalais -s /bin/bash -c "PATH=$PATH && cd /home/ndevalais/_repo/click_server_02 && forever start -a --uid click_server_02 bin/start_server.js"
            
        }&> /dev/null

        echo  "[OK]"
    ;;
    stop)
        echo "Para detener las instancias ejecute: forever stop [idInstancia] por ejemplo:\n  forever stop click_server_00"
    ;;
    list)
        sudo forever list
    ;;
    *)
        echo "Ayuda: /etc/init.d/click {start|stop|list}"
        exit 1
    ;;
esac

exit 0
