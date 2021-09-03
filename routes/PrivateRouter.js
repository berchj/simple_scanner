const express = require("express");
const router = express.Router();
const Pool = require("../lib/pool");

/**session middleware */
router.use('/admin/', (req, res, next) => {
  if(!req.session.user){
    res.redirect('/')
  }else{
    next()
  }
})
/**session middleware */

router.post('/login',(req,res)=>{
  Pool.getConnection((error,connection)=>{
    if (error) throw error
    let q = "SELECT * FROM users WHERE "
    connection.release()

  })
})

router.post("/buscar_pedido", (req, res) => {
  console.info(req.body)
  Pool.getConnection((error, connection) => {
    if (error) throw error;
    let q = `SELECT DATE_FORMAT(CONVERT_TZ(CURRENT_TIMESTAMP(),'+03:00','+03:00'), '%d/%M/%Y %H:%i:%s') as ultimo_update_data, num_pedido as PEDIDO, mv_consolidaciones.num_consolidacion AS CONSOL, CASE WHEN pedidos_activos_dm = 1 THEN 'QS' when pedidos_activos_dm = 2 then 'QD' when pedidos_activos_dm >= 3 then 'C' when consolidado_si_no = 'No' then 'S' when consolidado_si_no = 'FORANEO NO APLICA' then 'F' else 0 END as TIPO_ENVIO, DATE_FORMAT(F_recepcion_DM, '%d/%M/%Y %H:%i:%s') as F_recepcion_dm, DATE_FORMAT(F_envio, '%d/%M/%Y %H:%i:%s') as F_envio, v_pedidos_emitidos_y_foraneos.UC_mail_pedido AS MAIL, v_pedidos_emitidos_y_foraneos.UC_nombre_envio as NOMBRE, UC_dni AS DNI, v_pedidos_emitidos_y_foraneos.UC_telefono_pedido AS TELEFONO, v_pedidos_emitidos_y_foraneos.direccion_calle_pedido AS DIRECCION, v_pedidos_emitidos_y_foraneos.direccion_localidad_pedido AS LOCALIDAD, v_pedidos_emitidos_y_foraneos.direccion_provincia_pedido AS PROVINCIA, v_pedidos_emitidos_y_foraneos.direccion_codigo_postal_pedido AS CP, UT_pedido AS TIENDA, envio_empresa_transporte_pedido AS TRANSPORTE, envio_modalidad AS 'MODALIDAD ENVIO', v_pedidos_emitidos_y_foraneos.envio_sucursal as SUCURSAL, v_pedidos_emitidos_y_foraneos.envio_expreso_pedido AS EXPRESO, num_guia_pedido AS 'NUMERO GUIA', '' AS 'PESO'/*peso_pedido AS 'PESO', DATE_FORMAT(F_emision, '%d/%M/%Y %H:%i:%s') as F_emision, DATE_FORMAT(F_ultima_actualizacion_estado, '%d/%M/%Y %H:%i:%s') as F_ultima_actualizacion_estado, CASE WHEN consolidado_si_no = 'Si' then 'CONSOLIDADO' WHEN consolidado_si_no = 'No' then 'SIMPLE' when consolidado_si_no = 'FORANEO NO APLICA' then 'FORANEO' else 0 end as 'TIPO PEDIDO', recepcion_UDM, num_recibo, monto_servicio_logistica, monto_tarifa_envio, monto_descuento_consolidacion, monto_a_pagar_envio*/ FROM v_pedidos_emitidos_y_foraneos LEFT JOIN mv_consolidaciones ON mv_consolidaciones.num_consolidacion = v_pedidos_emitidos_y_foraneos.num_consolidacion WHERE v_pedidos_emitidos_y_foraneos.num_pedido = ${connection.escape(req.body.n_pedido)}`;
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
});

module.exports = router;
