const express = require("express");
const router = express.Router();
const Pool = require("../lib/pool");

router.post("/buscar_pedido", (req, res) => {
  console.info(req.body)
  Pool.getConnection((error, connection) => {
    if (error) throw error;
    let q = `select * from v_pedidos_emitidos_y_foraneos where num_pedido = ${connection.escape(req.body.n_pedido)}`;
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
