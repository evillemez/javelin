# TODO #

* Engine updates objects
    * plugins call object components callbacks
        * components need certain methods:
            * start
            * enable
            * update
            * disable
            * destroy
        * components can access this.$go for communication
        * components can access this.$engine for communication
    * Engine passes objects to plugins
        * plugins may process specific components