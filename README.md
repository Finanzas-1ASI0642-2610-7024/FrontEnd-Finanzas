# Enunciado

## Descripción General

El tema consistirá en el desarrollo de una aplicación Web o móvil que permita implementar un plan de pagos por el **método francés vencido ordinario** (meses de 30 días) para créditos vehiculares en Perú, utilizando el método denominado **Compra Inteligente**.

La aplicación deberá considerar los siguientes aspectos:

- Funcionamiento indistinto para monedas en **Soles (PEN)** o **Dólares (USD)**.
- Soporte para **tasas de interés nominales o efectivas**.
- Definición de **periodos de gracia total o parcial** al inicio de la operación.
- Adaptación a los requerimientos de cualquiera de las entidades financieras autorizadas.

## Configuración del Sistema

El sistema deberá incluir opciones de configuración que permitan definir:

- La moneda de trabajo.
- El tipo de tasa de interés:
    - Efectiva.
    - Nominal (incluyendo la capitalización correspondiente).
- Los plazos de gracia.

## Acceso al Sistema

Para utilizar la aplicación será obligatorio que el usuario inicie sesión mediante:

- Usuario (login).
- Contraseña (password).

## Gestión de Clientes y Vehículos

El desarrollo deberá estar enfocado desde el punto de vista de la entidad financiera que ofrece este servicio a posibles clientes.

Por ello, el sistema deberá almacenar en una base de datos:

- Información de los clientes.
- Información de los vehículos.
- Características completas de cada oferta vehicular.

## Análisis Financiero

La aplicación deberá calcular obligatoriamente:

- Valor Actual Neto (VAN) del préstamo.
- Tasa Interna de Retorno (TIR) del préstamo (desde el punto de vista del deudor).
- Indicadores exigidos por la norma de transparencia de la información del Sistema Financiero Peruano.

## Requerimientos Funcionales

### RF01 - Autenticación

El acceso al aplicativo deberá realizarse obligatoriamente mediante un usuario y una clave de acceso.

### RF02 - Registro de Información

El sistema deberá permitir registrar:

- Información solicitada al cliente.
- Información del vehículo en el cual está interesado.

### RF03 - Modificación de Datos

El sistema deberá permitir:

- Editar la información registrada.
- Modificar los datos existentes.
- Guardar nuevamente los cambios realizados.