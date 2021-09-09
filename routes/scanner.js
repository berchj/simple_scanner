const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Pool = require("../lib/pool");
const PoolExtra = require("../lib/pool_extra_stuff");

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split('"');
  if (token == null) res.status(401).json({ error: "Invalid Credentials" });
  jwt.verify(`${token[1]}`, "secret", function (error, user) {
    if (error) throw error;
    req.user = user;
    next();
  });
}

router.post("/buscar_pedido", authToken, (req, res) => {
  if (req.user) {
    Pool.getConnection((error, connection) => {
      if (error) throw error;
      let q = `SELECT DATE_FORMAT(CONVERT_TZ(CURRENT_TIMESTAMP(),'+03:00','+03:00'), '%d/%M/%Y %H:%i:%s') as ultimo_update_data, num_pedido as PEDIDO, mv_consolidaciones.num_consolidacion AS CONSOL, CASE WHEN pedidos_activos_dm = 1 THEN 'QS' when pedidos_activos_dm = 2 then 'QD' when pedidos_activos_dm >= 3 then 'C' when consolidado_si_no = 'No' then 'S' when consolidado_si_no = 'FORANEO NO APLICA' then 'F' else 0 END as TIPO_ENVIO, DATE_FORMAT(F_recepcion_DM, '%d/%M/%Y %H:%i:%s') as F_recepcion_dm, DATE_FORMAT(F_envio, '%d/%M/%Y %H:%i:%s') as F_envio, v_pedidos_emitidos_y_foraneos.UC_mail_pedido AS MAIL, v_pedidos_emitidos_y_foraneos.UC_nombre_envio as NOMBRE, UC_dni AS DNI, v_pedidos_emitidos_y_foraneos.UC_telefono_pedido AS TELEFONO, v_pedidos_emitidos_y_foraneos.direccion_calle_pedido AS DIRECCION, v_pedidos_emitidos_y_foraneos.direccion_localidad_pedido AS LOCALIDAD, v_pedidos_emitidos_y_foraneos.direccion_provincia_pedido AS PROVINCIA, v_pedidos_emitidos_y_foraneos.direccion_codigo_postal_pedido AS CP, UT_pedido AS TIENDA, envio_empresa_transporte_pedido AS TRANSPORTE, envio_modalidad AS 'MODALIDAD ENVIO', v_pedidos_emitidos_y_foraneos.envio_sucursal as SUCURSAL, v_pedidos_emitidos_y_foraneos.envio_expreso_pedido AS EXPRESO, num_guia_pedido AS 'NUMERO GUIA', '' AS 'PESO'/*peso_pedido AS 'PESO', DATE_FORMAT(F_emision, '%d/%M/%Y %H:%i:%s') as F_emision, DATE_FORMAT(F_ultima_actualizacion_estado, '%d/%M/%Y %H:%i:%s') as F_ultima_actualizacion_estado, CASE WHEN consolidado_si_no = 'Si' then 'CONSOLIDADO' WHEN consolidado_si_no = 'No' then 'SIMPLE' when consolidado_si_no = 'FORANEO NO APLICA' then 'FORANEO' else 0 end as 'TIPO PEDIDO', recepcion_UDM, num_recibo, monto_servicio_logistica, monto_tarifa_envio, monto_descuento_consolidacion, monto_a_pagar_envio*/ FROM v_pedidos_emitidos_y_foraneos LEFT JOIN mv_consolidaciones ON mv_consolidaciones.num_consolidacion = v_pedidos_emitidos_y_foraneos.num_consolidacion WHERE v_pedidos_emitidos_y_foraneos.num_pedido = ${connection.escape(
        req.body.n_pedido
      )}`;
      connection.query(q, (error, rows, fields) => {
        if (error) throw error;
        if (rows.length) {
          res.status(200).json({ data: rows });
        } else {
          res.status(404).json({ error: "not found" });
        }
      });
      connection.release();
    });
  } else {
    res.status(403).json({ error: "Forbidden resource" });
  }
});

router.get("/", authToken, (req, res) => {
  if (!req.user) res.status(403).json({ error: "invalid credentials" });
  PoolExtra.getConnection((error, connection) => {
    if (error) throw error;
    let q = `show tables`;
    connection.query(q, (error, rows, fields) => {
      if (error) throw error;
      if (rows) {
        res.json({
          user: req.user,
          data: rows,
          message: "authenticated successfully",
        });
      } else {
        res.json({ error: "not founded on query" });
      }
    });
    connection.release();
  });
});

router.post("/save", authToken, (req, res) => {
  PoolExtra.getConnection((error, connection) => {
    if (error) throw error;
    let q = `select * from new_table where num_pedido = ${connection.escape(
      req.body.num_pedido
    )}`;
    connection.query(q, (error, rows, fields) => {
      if (error) throw error;
      if (rows.length) {
        res.status(200).json({ message: "Pedido anteriormente registrado" });
      } else {
        var q1 = `insert into new_table (fecha_hora,col_nombre_scan,num_pedido,consol,transporte,num_guia,peso,bulto,usuario) values (${connection.escape(
          req.body.fecha_hora
        )},${connection.escape(req.body.col_nombre_scan)},${connection.escape(
          req.body.num_pedido
        )},${connection.escape(req.body.consol)},${connection.escape(
          req.body.transporte
        )},${connection.escape(req.body.num_guia)},${connection.escape(
          req.body.peso
        )},${connection.escape(req.body.bulto)},${connection.escape(
          req.body.usuario
        )})`;
        connection.query(q1, (error, rows, fields) => {
          if (error) throw error;
          res
            .status(201)
            .json({ message: "order registered successfully", data: rows });
        });
      }
    });
    connection.release();
  });
});

router.get("/orders", authToken, (req, res) => {
  PoolExtra.getConnection((error, connection) => {
    if (error) throw error;
    let q = `select * from new_table`
    connection.query(q,(error,rows,fields) => {
      if (error) throw error;
      if(rows.length){
        res.status(200).json({ data : rows })
      }else{
        res.status(404).json({ error: 'resource not found'})
      }
    })
    connection.release();
  });
});

module.exports = router;
